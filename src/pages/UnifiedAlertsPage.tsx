import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bell, Search, RefreshCw } from "lucide-react";

// Mock alert data
const flowAlerts = [
  { id: 1, title: "Flow Execution Failed", severity: "high", flow: "CHARGING_GATEWAY_MAIN", timestamp: "2024-01-15 10:30:00", status: "active" },
  { id: 2, title: "Performance Degradation", severity: "medium", flow: "BILLING_EVENTS_PROCESSOR", timestamp: "2024-01-15 09:15:00", status: "acknowledged" },
  { id: 3, title: "Memory Usage Warning", severity: "low", flow: "PAYMENT_VALIDATION", timestamp: "2024-01-15 08:45:00", status: "resolved" }
];

const nodeAlerts = [
  { id: 4, title: "Node Connection Timeout", severity: "high", node: "ASN1_DECODER_NODE", timestamp: "2024-01-15 11:00:00", status: "active" },
  { id: 5, title: "Processing Queue Full", severity: "medium", node: "ENRICHMENT_BLN_NODE", timestamp: "2024-01-15 10:15:00", status: "active" },
  { id: 6, title: "Resource Utilization Alert", severity: "low", node: "VALIDATION_BLN_NODE", timestamp: "2024-01-15 09:30:00", status: "acknowledged" }
];

export function UnifiedAlertsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const allAlerts = [
    ...flowAlerts.map(alert => ({ ...alert, type: "flow", source: alert.flow })),
    ...nodeAlerts.map(alert => ({ ...alert, type: "node", source: alert.node }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getFilteredAlerts = (type?: string) => {
    let alerts = type === "flow" ? flowAlerts.map(a => ({ ...a, type: "flow", source: a.flow })) :
                 type === "node" ? nodeAlerts.map(a => ({ ...a, type: "node", source: a.node })) :
                 [
                   ...flowAlerts.map(a => ({ ...a, type: "flow", source: a.flow })),
                   ...nodeAlerts.map(a => ({ ...a, type: "node", source: a.node }))
                 ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return alerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.source.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
      
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getSeverityBadge = (severity: string) => {
    const variant = severity === "high" ? "destructive" :
                   severity === "medium" ? "secondary" : 
                   "outline";
    
    return (
      <Badge variant={variant} className="text-xs font-medium">
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-destructive/10 text-destructive border-destructive/20",
      acknowledged: "bg-warning/10 text-warning border-warning/20",
      resolved: "bg-success/10 text-success border-success/20"
    };
    
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className={type === "flow" ? "bg-info/10 text-info border-info/20" : "bg-primary/10 text-primary border-primary/20"}>
        {type === "flow" ? "Flow" : "Node"}
      </Badge>
    );
  };

  const renderAlertsTable = (alerts: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 border-b border-border">
          <tr>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Alert</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Type</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Severity</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Source</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                {alert.title}
              </td>
              <td className="px-4 py-3">
                {getTypeBadge(alert.type)}
              </td>
              <td className="px-4 py-3">
                {getSeverityBadge(alert.severity)}
              </td>
              <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                {alert.source}
              </td>
              <td className="px-4 py-3">
                {getStatusBadge(alert.status)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {alert.timestamp}
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
                System Alerts
              </h1>
              <p className="text-sm text-muted-foreground">
                Unified view of all flow and node alerts across the platform
              </p>
            </div>
            
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
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {allAlerts.filter(a => a.severity === "high").length}
                </div>
                <div className="text-sm text-muted-foreground">High Severity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">
                  {allAlerts.filter(a => a.severity === "medium").length}
                </div>
                <div className="text-sm text-muted-foreground">Medium Severity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {allAlerts.filter(a => a.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-info">
              {allAlerts.filter(a => a.status === "resolved").length}
            </div>
            <div className="text-sm text-muted-foreground">Resolved Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content */}
      <Card className="professional-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Alerts Overview
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Alerts ({allAlerts.length})</TabsTrigger>
                <TabsTrigger value="flow">Flow Alerts ({flowAlerts.length})</TabsTrigger>
                <TabsTrigger value="node">Node Alerts ({nodeAlerts.length})</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {renderAlertsTable(getFilteredAlerts())}
            </TabsContent>
            
            <TabsContent value="flow" className="mt-0">
              {renderAlertsTable(getFilteredAlerts("flow"))}
            </TabsContent>
            
            <TabsContent value="node" className="mt-0">
              {renderAlertsTable(getFilteredAlerts("node"))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}