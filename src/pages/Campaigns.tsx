// src/pages/Campaigns.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCampaigns } from "@/hooks/useCampaigns";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Running":
      return "bg-success/10 text-success border-success/20";
    case "Completed":
      return "bg-info/10 text-info border-info/20";
    case "Scheduled":
      return "bg-warning/10 text-warning border-warning/20";
    case "Draft":
      return "bg-muted text-muted-foreground border-muted";
    case "Pending Approval":
      return "bg-info/10 text-info border-info/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Campaigns() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error, refetch } = useCampaigns();
  const campaigns = data?.campaigns ?? [];

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Failed to load campaigns</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">View and manage engagement campaigns</p>
            {data?.summary && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.summary.total_campaigns} campaigns • {data.summary.formatted_total_cost} estimated total cost
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => navigate("/campaigns/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Campaign Name</TableHead>
              <TableHead className="font-semibold">Campaign Type</TableHead>
              <TableHead className="font-semibold">Segment Name</TableHead>
              <TableHead className="font-semibold">Channels</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Start Date</TableHead>
              <TableHead className="font-semibold">End Date</TableHead>
              <TableHead className="font-semibold w-24">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No campaigns match your search" : "No campaigns found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((c) => (
                <TableRow key={String(c.id)} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.segment}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {c.channels.map((ch) => (
                        <Badge key={ch} variant="secondary" className="text-xs">
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("font-medium", getStatusColor(c.status))}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.startDate ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.endDate ?? "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns/${String(c.id)}`)}
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}