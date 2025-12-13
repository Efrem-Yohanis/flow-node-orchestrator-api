import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Trash2, Database } from "lucide-react";
import { getSavedTables, deleteSavedTable } from "@/lib/savedTables";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function SavedTablesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 10;

  const tables = useMemo(() => getSavedTables(), [refreshKey]);

  const filteredTables = useMemo(() => {
    return tables.filter(table =>
      table.tableName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tables, searchQuery]);

  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (tableName: string) => {
    navigate(`/tables/saved/${encodeURIComponent(tableName)}/view`);
  };

  const handleDropTable = (id: string, tableName: string) => {
    deleteSavedTable(id);
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Table Dropped",
      description: `Table ${tableName} has been removed from saved tables.`,
    });
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Saved Tables
        </h1>
        <p className="text-muted-foreground mt-1">View all saved tables</p>
      </div>

      <Card className="border-2 shadow-elegant">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Saved Tables
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by table name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Created From</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Columns Used</TableHead>
                  <TableHead>Row Count</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No saved tables found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">{table.tableName}</TableCell>
                      <TableCell>{table.createdFrom}</TableCell>
                      <TableCell>{table.dateCreated}</TableCell>
                      <TableCell>{table.columns.join(", ")}</TableCell>
                      <TableCell>{table.rowCount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(table.tableName)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDropTable(table.id, table.tableName)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Drop Table
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
