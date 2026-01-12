import { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PageLoading } from "@/components/ui/page-loading";

import {
  useCreateRewardAccount,
  useDeleteRewardAccount,
  useRewardAccounts,
  useUpdateRewardAccount,
} from "@/hooks/useRewardAccounts";
import type { RewardAccount } from "@/services/rewardAccountApi";

const LOW_BALANCE_THRESHOLD = 100000;

function parseBalance(balance: string) {
  const n = Number.parseFloat(balance);
  return Number.isFinite(n) ? n : 0;
}

export default function RewardAccountManagement() {
  const { data, isLoading, error, refetch, isFetching } = useRewardAccounts();

  const createMutation = useCreateRewardAccount();
  const deleteMutation = useDeleteRewardAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [minBalanceFilter, setMinBalanceFilter] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<RewardAccount | null>(null);

  // Create/Edit form (matches your API request body)
  const [formAccountId, setFormAccountId] = useState("");
  const [formAccountName, setFormAccountName] = useState("");
  const [formBalance, setFormBalance] = useState<string>("");
  const [formCurrency, setFormCurrency] = useState("ETB");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  const updateMutation = useUpdateRewardAccount(selectedAccount?.id ?? -1);

  const accounts = data?.accounts ?? [];

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.account_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || acc.status === statusFilter;

      const matchesAssigned =
        assignedFilter === "all" ||
        (assignedFilter === "assigned" && acc.assigned_campaigns_count > 0) ||
        (assignedFilter === "unassigned" && acc.assigned_campaigns_count === 0);

      const min = minBalanceFilter ? Number.parseFloat(minBalanceFilter) : null;
      const bal = parseBalance(acc.balance);
      const matchesMinBalance = min === null || !Number.isFinite(min) ? true : bal >= min;

      return matchesSearch && matchesStatus && matchesAssigned && matchesMinBalance;
    });
  }, [accounts, assignedFilter, minBalanceFilter, searchQuery, statusFilter]);

  const resetForm = () => {
    setFormAccountId("");
    setFormAccountName("");
    setFormBalance("");
    setFormCurrency("ETB");
    setFormStatus("active");
  };

  const openViewModal = (account: RewardAccount) => {
    setSelectedAccount(account);
    setShowViewModal(true);
  };

  const openEditModal = (account: RewardAccount) => {
    setSelectedAccount(account);
    setFormAccountId(account.account_id);
    setFormAccountName(account.account_name);
    setFormBalance(String(parseBalance(account.balance)));
    setFormCurrency(account.currency);
    setFormStatus((account.status as "active" | "inactive") ?? "active");
    setShowEditModal(true);
  };

  const openDeleteModal = (account: RewardAccount) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    const balanceNum = Number.parseFloat(formBalance);
    if (!formAccountId || !formAccountName || !Number.isFinite(balanceNum)) return;

    await createMutation.mutateAsync({
      account_id: formAccountId,
      account_name: formAccountName,
      balance: balanceNum,
      currency: formCurrency,
      status: formStatus,
    });

    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedAccount) return;

    const balanceNum = Number.parseFloat(formBalance);

    await updateMutation.mutateAsync({
      account_id: formAccountId,
      account_name: formAccountName,
      balance: Number.isFinite(balanceNum) ? balanceNum : undefined,
      currency: formCurrency,
      status: formStatus,
    });

    setShowEditModal(false);
    setSelectedAccount(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    await deleteMutation.mutateAsync(selectedAccount.id);
    setShowDeleteModal(false);
    setSelectedAccount(null);
  };

  const handleExport = () => {
    const csvContent = [
      ["DB ID", "Account ID", "Account Name", "Balance", "Currency", "Status", "Assigned Campaigns", "Updated At"],
      ...filteredAccounts.map((acc) => [
        String(acc.id),
        acc.account_id,
        acc.account_name,
        acc.balance,
        acc.currency,
        acc.status,
        acc.assigned_campaigns.map((c) => c.name).join("; "),
        acc.updated_at,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reward_accounts.csv";
    a.click();
  };

  if (isLoading) {
    return <PageLoading message="Loading reward accounts..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Failed to load reward accounts</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold">Reward Account Management</h1>
            <p className="text-muted-foreground">Link and manage reward accounts</p>

            {data?.summary && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.summary.total_accounts} accounts • {data.summary.formatted_total_balance} total
                {isFetching ? " (refreshing...)" : ""}
              </p>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Accounts with balance below {LOW_BALANCE_THRESHOLD.toLocaleString()} ETB are flagged</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Link Reward Account
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by account name or account ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Min Balance"
          value={minBalanceFilter}
          onChange={(e) => setMinBalanceFilter(e.target.value)}
          className="w-36"
        />

        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Account Name / Account ID</TableHead>
              <TableHead className="font-semibold text-right">Current Balance</TableHead>
              <TableHead className="font-semibold">Assigned Campaigns</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Updated</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No accounts match your search" : "No reward accounts found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((acc) => {
                const bal = parseBalance(acc.balance);
                const isLow = bal < LOW_BALANCE_THRESHOLD;

                return (
                  <TableRow key={acc.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium">{acc.account_name}</p>
                        <p className="text-sm text-muted-foreground">{acc.account_id}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLow && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        <span className={cn("font-medium", isLow && "text-destructive")}>
                          {acc.formatted_balance || `${bal.toLocaleString()} ${acc.currency}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {acc.assigned_campaigns_count > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {acc.assigned_campaigns.slice(0, 2).map((c) => (
                            <Badge key={c.campaign_id} variant="outline" className="text-xs">
                              {c.name}
                            </Badge>
                          ))}
                          {acc.assigned_campaigns_count > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{acc.assigned_campaigns_count - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          acc.status === "active"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {acc.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(acc.updated_at).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openViewModal(acc)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(acc)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteModal(acc)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Reward Account</DialogTitle>
            <DialogDescription>Create and link a reward account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Account ID *</Label>
              <Input value={formAccountId} onChange={(e) => setFormAccountId(e.target.value)} placeholder="RWD-ACC-001" />
            </div>

            <div className="space-y-2">
              <Label>Account Name *</Label>
              <Input value={formAccountName} onChange={(e) => setFormAccountName(e.target.value)} placeholder="Festive Rewards Pool" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Balance *</Label>
                <Input type="number" value={formBalance} onChange={(e) => setFormBalance(e.target.value)} placeholder="500000" />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} placeholder="ETB" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as "active" | "inactive")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createMutation.isPending ||
                !formAccountId ||
                !formAccountName ||
                !Number.isFinite(Number.parseFloat(formBalance))
              }
            >
              {createMutation.isPending ? "Linking..." : "Link Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account ID</p>
                  <p className="font-medium">{selectedAccount.account_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Name</p>
                  <p className="font-medium">{selectedAccount.account_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-medium">{selectedAccount.formatted_balance}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedAccount.status === "active"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {selectedAccount.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Assigned Campaigns</p>
                {selectedAccount.assigned_campaigns_count > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAccount.assigned_campaigns.map((c) => (
                      <Badge key={c.campaign_id} variant="outline">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No campaigns assigned</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{new Date(selectedAccount.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reward Account</DialogTitle>
            <DialogDescription>Update reward account fields.</DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Account ID</Label>
                <Input value={formAccountId} onChange={(e) => setFormAccountId(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={formAccountName} onChange={(e) => setFormAccountName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Balance</Label>
                  <Input type="number" value={formBalance} onChange={(e) => setFormBalance(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as "active" | "inactive")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Reward Account</DialogTitle>
            <DialogDescription>This will remove the account integration from this system.</DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="py-4 space-y-3">
              <div className="p-3 bg-muted rounded-md space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Account:</span>{" "}
                  <strong>{selectedAccount.account_name}</strong> ({selectedAccount.account_id})
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Balance:</span>{" "}
                  <strong>{selectedAccount.formatted_balance}</strong>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}