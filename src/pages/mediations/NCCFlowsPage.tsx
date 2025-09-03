import { useEffect, useState } from "react";
import { Eye, Grid, List, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingCard } from "@/components/ui/loading";
import { useItems } from '../apis/ItemService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function NCCFlowsPage() {
  const { data: items, loading, error } = useItems();
  const [flows, setFlows] = useState(items || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    if (items) {
      // Filter flows for NCC mediation based on name
      const nccFlows = items.filter(flow => 
        flow.name.toLowerCase().includes('ncc')
      );
      setFlows(nccFlows);
    }
  }, [items]);

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFlows.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedFlows = filteredFlows.slice(startIndex, startIndex + pageSize);

  const getFlowStatus = (flow: any) => {
    if (flow.is_running) return "running";
    if (flow.is_deployed) return "deployed";
    return "draft";
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case "running": return "default";
      case "deployed": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "running": return "🟢 Running";
      case "deployed": return "🟡 Deployed";
      case "draft": return "📝 Draft";
      default: return "❓ Unknown";
    }
  };

  if (loading) {
    return <LoadingCard text="Loading NCC flows..." />;
  }

  if (error) {
    return <div>Error loading NCC flows: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">NCC Flows</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="🔍 Search NCC flows..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-96"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border border-border rounded-md">
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFlows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell className="font-medium">{flow.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(getFlowStatus(flow))}
                      className="font-medium"
                    >
                      {getStatusDisplay(getFlowStatus(flow))}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">Version {flow.version}</span>
                  </TableCell>
                  <TableCell>{new Date(flow.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{flow.created_by}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/flows/${flow.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedFlows.map((flow) => (
            <Card key={flow.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm flex items-center justify-between">
                  {flow.name}
                  <Badge 
                    variant={getStatusBadgeVariant(getFlowStatus(flow))}
                    className="font-medium"
                  >
                    {getStatusDisplay(getFlowStatus(flow))}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Created:</span> {new Date(flow.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">By:</span> {flow.created_by}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Version:</span> {flow.version}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Description:</span> {flow.description || "No description available"}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <div className="text-xs font-medium text-foreground">Actions:</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border border-border shadow-lg z-50">
                      <DropdownMenuItem onClick={() => navigate(`/flows/${flow.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredFlows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredFlows.length)} of {filteredFlows.length} NCC flows
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}