import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, Search, RefreshCw, Download } from "lucide-react";

// Mock report data
const nodeReports = [
  { id: 1, name: "ASN1 Decoder Performance Report", type: "Performance", generated: "2024-01-15 10:00:00", size: "2.4 MB", status: "ready" },
  { id: 2, name: "Enrichment BLN Error Analysis", type: "Error", generated: "2024-01-15 09:30:00", size: "1.8 MB", status: "ready" },
  { id: 3, name: "Validation BLN Usage Report", type: "Usage", generated: "2024-01-15 08:45:00", size: "3.2 MB", status: "generating" },
  { id: 4, name: "FDC Node Throughput Analysis", type: "Performance", generated: "2024-01-15 08:00:00", size: "1.5 MB", status: "ready" }
];

const flowReports = [
  { id: 5, name: "Charging Gateway Flow Report", type: "Flow Analysis", generated: "2024-01-15 11:00:00", size: "4.1 MB", status: "ready" },
  { id: 6, name: "Billing Events Processing Report", type: "Performance", generated: "2024-01-15 10:15:00", size: "2.9 MB", status: "ready" },
  { id: 7, name: "Payment Validation Flow Report", type: "Error", generated: "2024-01-15 09:45:00", size: "1.7 MB", status: "ready" },
  { id: 8, name: "Convergent Mediation Report", type: "Usage", generated: "2024-01-15 09:00:00", size: "3.8 MB", status: "generating" }
];

export function UnifiedReportsPage() {
  const [activeTab, setActiveTab] = useState("node");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const allReports = [...nodeReports.map(r => ({ ...r, category: "node" })), ...flowReports.map(r => ({ ...r, category: "flow" }))];

  const getFilteredReports = (category?: string) => {
    let reports = category === "node" ? nodeReports.map(r => ({ ...r, category: "node" })) :
                  category === "flow" ? flowReports.map(r => ({ ...r, category: "flow" })) :
                  allReports;

    return reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || report.type === typeFilter;
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleDownload = (reportId: number) => {
    console.log(`Downloading report ${reportId}`);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ready: "bg-success/10 text-success border-success/20",
      generating: "bg-warning/10 text-warning border-warning/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20"
    };
    
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      Performance: "bg-info/10 text-info border-info/20",
      Error: "bg-destructive/10 text-destructive border-destructive/20",
      Usage: "bg-success/10 text-success border-success/20",
      "Flow Analysis": "bg-primary/10 text-primary border-primary/20"
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || "bg-muted/10 text-muted-foreground"}>
        {type}
      </Badge>
    );
  };

  const renderReportsTable = (reports: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 border-b border-border">
          <tr>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Report Name</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Type</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Generated</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Size</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                {report.name}
              </td>
              <td className="px-4 py-3">
                {getTypeBadge(report.type)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {report.generated}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {report.size}
              </td>
              <td className="px-4 py-3">
                {getStatusBadge(report.status)}
              </td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(report.id)}
                  disabled={report.status !== "ready"}
                  className="h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="professional-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                System Reports
              </h1>
              <p className="text-sm text-muted-foreground">
                Unified view of all flow and node reports across the platform
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-9"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">
                  {allReports.filter(r => r.status === "ready").length}
                </div>
                <div className="text-sm text-muted-foreground">Ready Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">
                  {allReports.filter(r => r.status === "generating").length}
                </div>
                <div className="text-sm text-muted-foreground">Generating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-info">
              {nodeReports.length}
            </div>
            <div className="text-sm text-muted-foreground">Node Reports</div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {flowReports.length}
            </div>
            <div className="text-sm text-muted-foreground">Flow Reports</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content */}
      <Card className="professional-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Reports Overview
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                  <SelectItem value="Usage">Usage</SelectItem>
                  <SelectItem value="Flow Analysis">Flow Analysis</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="node">Node Reports ({nodeReports.length})</TabsTrigger>
                <TabsTrigger value="flow">Flow Reports ({flowReports.length})</TabsTrigger>
                <TabsTrigger value="all">All Reports ({allReports.length})</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="node" className="mt-0">
              {renderReportsTable(getFilteredReports("node"))}
            </TabsContent>
            
            <TabsContent value="flow" className="mt-0">
              {renderReportsTable(getFilteredReports("flow"))}
            </TabsContent>
            
            <TabsContent value="all" className="mt-0">
              {renderReportsTable(getFilteredReports())}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}