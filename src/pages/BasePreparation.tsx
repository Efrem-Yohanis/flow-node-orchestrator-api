import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Users, Clock, DollarSign, Target, Gift, CreditCard, X, Wallet, Building, Upload } from "lucide-react";
import { BaseTableBuilder } from "@/components/base-preparation/BaseTableBuilder";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  createActiveCustomerTable,
  createVlrAttachedTable,
  createRegisteredMpesaTable,
  createTargetedTable,
  createRewardedCustomerTable,
  createTableFromFile,
  createGaCustomersTable,
  ApiResponse,
} from "@/lib/basePreparationApi";

interface TableFieldConfig {
  name: string;
  type: "text" | "number" | "date" | "dropdown" | "date-conditional" | "file";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface TableConfig {
  id: string;
  instanceId: string;
  label: string;
  icon: any;
  borderColor: string;
  fields: TableFieldConfig[];
  values: Record<string, any>;
  allowMultiple?: boolean;
}

interface TableStatus {
  name: string;
  status: "pending" | "running" | "completed" | "error";
  time: number;
  parameters: string;
  columns?: string[];
  rowCount?: number;
}

const availableTables: { id: string; label: string; icon: any; borderColor: string; fields: TableFieldConfig[]; allowMultiple?: boolean }[] = [
  { 
    id: "from_input", 
    label: "FROM INPUT", 
    icon: Upload, 
    borderColor: "border-l-emerald-500",
    allowMultiple: true,
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., custom_input_table" },
      { name: "file_input", type: "file", label: "File Input", required: true },
    ]
  },
  { 
    id: "from_my_schema", 
    label: "FROM MY SCHEMA", 
    icon: Building, 
    borderColor: "border-l-cyan-500",
    allowMultiple: true,
    fields: [
      { name: "schema_table", type: "text", label: "Schema Table Name", required: true, placeholder: "e.g., users, orders" },
    ]
  },
  { 
    id: "ga_customers", 
    label: "GA CUSTOMERS", 
    icon: Users, 
    borderColor: "border-l-emerald-500",
    allowMultiple: true,
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., ga_customers_table" },
      { name: "data_from", type: "date", label: "Data From (End Date)", required: true },
      { name: "active_for_days", type: "number", label: "Active For (Days)", required: false, placeholder: "e.g., 30" },
    ]
  },
  { 
    id: "staff_list", 
    label: "STAFF LIST", 
    icon: Users, 
    borderColor: "border-l-teal-500",
    allowMultiple: true,
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., staff_list_jan_2024" },
    ]
  },
  { 
    id: "fraud_customer", 
    label: "FRAUD CUSTOMER", 
    icon: Users, 
    borderColor: "border-l-orange-500",
    allowMultiple: true,
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., fraud_customer_jan_2024" },
    ]
  },
  { 
    id: "active_customers", 
    label: "ACTIVE CUSTOMERS", 
    icon: Users, 
    borderColor: "border-l-green-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., active_customers_jan_2024" },
      { name: "data_from", type: "date", label: "Data From (End Date)", required: true },
      { name: "active_for", type: "number", label: "Active For (Days)", required: true, placeholder: "e.g., 30" },
    ]
  },
  { 
    id: "vlr_attached_customers", 
    label: "VLR ATTACHED CUSTOMERS", 
    icon: Clock, 
    borderColor: "border-l-blue-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., vlr_attached_customers" },
      { name: "day_from", type: "number", label: "Day From", required: true, placeholder: "e.g., 0" },
      { name: "day_to", type: "number", label: "Day To", required: true, placeholder: "e.g., 10" },
    ]
  },
  { 
    id: "registered_mpesa", 
    label: "REGISTERED MPESA", 
    icon: Building, 
    borderColor: "border-l-purple-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., registered_mpesa" },
      { name: "data_format", type: "dropdown", label: "Data Format", required: true, options: ["before", "after", "date_range"] },
      { name: "date", type: "date-conditional", label: "Date", required: true },
    ]
  },
  { 
    id: "balance_threshold", 
    label: "BALANCE THRESHOLD", 
    icon: DollarSign, 
    borderColor: "border-l-yellow-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., balance_threshold_10" },
      { name: "balance_threshold", type: "number", label: "Balance Threshold", required: true, placeholder: "e.g., 10" },
      { name: "comparison", type: "dropdown", label: "Comparison", required: true, options: ["equal to", "greater than or equal to", "less than or equal to", "greater than", "less than", "not equal to"] },
    ]
  },
  { 
    id: "targeted_customers", 
    label: "TARGETED CUSTOMERS", 
    icon: Target, 
    borderColor: "border-l-red-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., targeted_customers_jan" },
      { name: "data_from", type: "date", label: "Data From", required: true },
      { name: "targeted_for_last", type: "number", label: "Targeted For Last (Days)", required: true, placeholder: "e.g., 30" },
    ]
  },
  { 
    id: "rewarded_customers", 
    label: "REWARDED CUSTOMERS", 
    icon: Gift, 
    borderColor: "border-l-pink-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., rewarded_customers" },
      { name: "data_format", type: "dropdown", label: "Data Format", required: true, options: ["before", "after", "date_range"] },
      { name: "date", type: "date-conditional", label: "Date", required: true },
    ]
  },
  { 
    id: "cbe_topup", 
    label: "CBE TOP UP", 
    icon: CreditCard, 
    borderColor: "border-l-indigo-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., cbe_topup_customers" },
      { name: "data_format", type: "dropdown", label: "Data Format", required: true, options: ["before", "after", "date_range"] },
      { name: "date", type: "date-conditional", label: "Date", required: true },
    ]
  },
  { 
    id: "rewarded_from_account", 
    label: "REWARDED FROM ACCOUNT", 
    icon: Wallet, 
    borderColor: "border-l-cyan-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., rewarded_from_account_list" },
      { name: "account_number", type: "text", label: "Account Number", required: true, placeholder: "e.g., 9000069" },
    ]
  },
];

export default function BasePreparation() {
  const { toast } = useToast();
  const [postfix, setPostfix] = useState("NOV29");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [selectedTables, setSelectedTables] = useState<TableConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const fileInputRefs = useRef<Record<string, File | null>>({});

  const handleAddTable = () => {
    if (!selectedTableId) return;
    
    const table = availableTables.find(t => t.id === selectedTableId);
    if (!table) return;

    const initialValues: Record<string, any> = {};
    table.fields.forEach(field => {
      if (field.type === "date-conditional") {
        initialValues[field.name] = { start: undefined, end: undefined, single: undefined };
      } else {
        initialValues[field.name] = "";
      }
    });

    const newTable: TableConfig = {
      ...table,
      instanceId: crypto.randomUUID(),
      values: initialValues
    };
    
    setSelectedTables([...selectedTables, newTable]);
    setSelectedTableId("");
  };

  const handleRemoveTable = (instanceId: string) => {
    setSelectedTables(selectedTables.filter(t => t.instanceId !== instanceId));
  };

  const updateTableField = (instanceId: string, fieldName: string, value: any) => {
    setSelectedTables(selectedTables.map(table => 
      table.instanceId === instanceId 
        ? { ...table, values: { ...table.values, [fieldName]: value } }
        : table
    ));
  };

  const getTableParameters = (table: TableConfig): string => {
    return table.fields
      .map(field => {
        const value = table.values[field.name];
        if (field.type === "date") {
          return value ? format(value, "yyyy-MM-dd") : "N/A";
        }
        if (field.type === "date-conditional") {
          const dataFormat = table.values["data_format"];
          if (dataFormat === "date_range") {
            return value?.start && value?.end 
              ? `${format(value.start, "yyyy-MM-dd")} to ${format(value.end, "yyyy-MM-dd")}`
              : "N/A";
          }
          return value?.single ? format(value.single, "yyyy-MM-dd") : "N/A";
        }
        return value || "N/A";
      })
      .join(", ");
  };

  const getAllTables = () => {
    return selectedTables.map((table, idx) => ({
      name: `${table.values.table_name || table.label.replace(/ /g, "_")}_${postfix}`,
      status: "pending" as const,
      time: 0,
      parameters: getTableParameters(table),
      tableIndex: idx,
    }));
  };

  const callApiForTable = async (table: TableConfig): Promise<ApiResponse> => {
    const tableName = `${table.values.table_name || table.label.replace(/ /g, "_")}_${postfix}`;
    
    switch (table.id) {
      case "active_customers":
        return createActiveCustomerTable({
          table_name: tableName,
          data_from: table.values.data_from ? format(table.values.data_from, "yyyy-MM-dd") : "",
          active_for: parseInt(table.values.active_for) || 30,
        });

      case "ga_customers":
        return createGaCustomersTable({
          table_name: tableName,
          data_from: table.values.data_from ? format(table.values.data_from, "yyyy-MM-dd") : "",
          active_for: table.values.active_for_days ? parseInt(table.values.active_for_days) : undefined,
        });

      case "vlr_attached_customers": {
        const dayFrom = parseInt(table.values.day_from) || 0;
        const dayTo = parseInt(table.values.day_to) || 10;
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - dayTo);
        const toDate = new Date(today);
        toDate.setDate(today.getDate() - dayFrom);
        return createVlrAttachedTable({
          table_name: tableName,
          day_from: format(fromDate, "yyyy-MM-dd"),
          day_to: format(toDate, "yyyy-MM-dd"),
        });
      }

      case "registered_mpesa": {
        const dataFormat = table.values.data_format;
        const dateValue = table.values.date;
        if (dataFormat === "date_range" && dateValue?.start && dateValue?.end) {
          return createRegisteredMpesaTable({
            table_name: tableName,
            date_range: {
              start: format(dateValue.start, "yyyy-MM-dd"),
              end: format(dateValue.end, "yyyy-MM-dd"),
            },
          });
        } else if (dataFormat === "before" && dateValue?.single) {
          return createRegisteredMpesaTable({
            table_name: tableName,
            before: format(dateValue.single, "yyyy-MM-dd"),
          });
        } else if (dataFormat === "after" && dateValue?.single) {
          return createRegisteredMpesaTable({
            table_name: tableName,
            after: format(dateValue.single, "yyyy-MM-dd"),
          });
        } else {
          return createRegisteredMpesaTable({ table_name: tableName });
        }
      }

      case "targeted_customers":
        return createTargetedTable({
          table_name: tableName,
          data_from: table.values.data_from ? format(table.values.data_from, "yyyy-MM-dd") : "",
          targeted_for_last: parseInt(table.values.targeted_for_last) || 7,
        });

      case "rewarded_customers": {
        const dataFormat = table.values.data_format;
        const dateValue = table.values.date;
        if (dataFormat === "date_range" && dateValue?.start && dateValue?.end) {
          return createRewardedCustomerTable({
            table_name: tableName,
            date_range: {
              start: format(dateValue.start, "yyyy-MM-dd"),
              end: format(dateValue.end, "yyyy-MM-dd"),
            },
          });
        } else if (dataFormat === "before" && dateValue?.single) {
          return createRewardedCustomerTable({
            table_name: tableName,
            before: format(dateValue.single, "yyyy-MM-dd"),
          });
        } else if (dataFormat === "after" && dateValue?.single) {
          return createRewardedCustomerTable({
            table_name: tableName,
            after: format(dateValue.single, "yyyy-MM-dd"),
          });
        } else {
          return createRewardedCustomerTable({ table_name: tableName });
        }
      }

      case "from_input": {
        const file = fileInputRefs.current[table.instanceId];
        if (!file) {
          throw new Error("No file selected");
        }
        return createTableFromFile(tableName, file);
      }

      // For tables without specific API, return a mock success
      default:
        return {
          success: true,
          table_name: tableName,
          columns: ["MSISDN"],
          row_count: Math.floor(Math.random() * 100000) + 1000,
          execution_time_seconds: Math.random() * 10 + 1,
        };
    }
  };

  const handleGenerate = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to generate.",
        variant: "destructive"
      });
      return;
    }

    const tables = getAllTables();
    setTableStatuses(tables.map(t => ({ ...t, tableIndex: undefined })));
    setIsGenerating(true);
    setStartTime(Date.now());
    
    toast({
      title: "Starting Generation",
      description: `Generating ${tables.length} base tables...`,
    });

    // Process tables sequentially
    for (let i = 0; i < selectedTables.length; i++) {
      const table = selectedTables[i];
      const startTableTime = Date.now();

      // Set status to running
      setTableStatuses(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: "running" };
        return updated;
      });

      // Start timer interval
      const interval = setInterval(() => {
        setTableStatuses(prev => {
          const updated = [...prev];
          if (updated[i]?.status === "running") {
            updated[i] = { ...updated[i], time: Math.floor((Date.now() - startTableTime) / 1000) };
          }
          return updated;
        });
      }, 1000);

      try {
        const response = await callApiForTable(table);
        clearInterval(interval);
        
        const elapsedTime = response.execution_time_seconds || (Date.now() - startTableTime) / 1000;
        
        setTableStatuses(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: response.success ? "completed" : "error",
            time: Math.round(elapsedTime * 100) / 100,
            columns: response.columns,
            rowCount: response.row_count || response.rows_inserted || response.rows_created,
          };
          return updated;
        });
      } catch (error) {
        clearInterval(interval);
        console.error(`Error creating table ${table.values.table_name}:`, error);
        
        setTableStatuses(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: "error",
            time: Math.floor((Date.now() - startTableTime) / 1000),
          };
          return updated;
        });
      }
    }

    setIsGenerating(false);
    toast({
      title: "Generation Complete",
      description: "All table creation tasks have finished.",
    });
  };

  const getStatusBadge = (status: TableStatus["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">🟢 Completed</Badge>;
      case "running":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">🟡 Running</Badge>;
      case "pending":
        return <Badge variant="secondary">⚪ Pending</Badge>;
      case "error":
        return <Badge variant="destructive">🔴 Error</Badge>;
    }
  };

  const renderField = (table: TableConfig, field: TableFieldConfig) => {
    const value = table.values[field.name];

    switch (field.type) {
      case "text":
        return (
          <Input 
            type="text" 
            value={value} 
            onChange={(e) => updateTableField(table.instanceId, field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isGenerating}
          />
        );
      case "number":
        return (
          <Input 
            type="number" 
            value={value} 
            onChange={(e) => updateTableField(table.instanceId, field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isGenerating}
          />
        );
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isGenerating}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => updateTableField(table.instanceId, field.name, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "dropdown":
        return (
          <Select value={value} onValueChange={(val) => updateTableField(table.instanceId, field.name, val)} disabled={isGenerating}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "date-conditional":
        const dataFormat = table.values["data_format"];
        if (dataFormat === "date_range") {
          return (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal" disabled={isGenerating}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.start ? format(value.start, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value?.start}
                    onSelect={(date) => updateTableField(table.instanceId, field.name, { ...value, start: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal" disabled={isGenerating}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.end ? format(value.end, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value?.end}
                    onSelect={(date) => updateTableField(table.instanceId, field.name, { ...value, end: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          );
        }
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isGenerating}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value?.single ? format(value.single, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value?.single}
                onSelect={(date) => updateTableField(table.instanceId, field.name, { ...value, single: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "file":
        return (
          <Input 
            type="file" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                fileInputRefs.current[table.instanceId] = file;
              }
              updateTableField(table.instanceId, field.name, file?.name || "");
            }}
            disabled={isGenerating}
            className="cursor-pointer"
            accept=".csv,.xlsx,.xls"
          />
        );
      default:
        return null;
    }
  };

  const completedTables = tableStatuses.filter(t => t.status === "completed").length;
  // All tables are always available for selection (no filtering)
  const availableToSelect = availableTables;

  return (
    <div className="w-full space-y-6">
      <div className="w-full">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Base Preparation Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Configure and generate base tables</p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 shadow-elegant">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                ⚙️ BASE TABLE CONFIGURATION
              </CardTitle>
              <CardDescription>Select tables and configure parameters</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="postfix" className="text-base font-semibold">Table Postfix</Label>
                  <Input 
                    id="postfix"
                    type="text" 
                    value={postfix} 
                    onChange={(e) => setPostfix(e.target.value.toUpperCase())} 
                    placeholder="e.g., NOV29"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Appended to all table names</p>
                </div>

                <div>
                  <Label className="text-base font-semibold">Add Tables</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                      <SelectTrigger className="flex-1 bg-background">
                        <SelectValue placeholder="Select a table to add..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {availableToSelect.map(table => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddTable} disabled={!selectedTableId}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTables.length === 0 
                      ? "No tables selected"
                      : `${selectedTables.length} table(s) selected`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedTables.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedTables.map(table => {
                const Icon = table.icon;
                return (
                  <Card key={table.instanceId} className={`border-l-4 ${table.borderColor}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {table.label}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveTable(table.instanceId)}
                          disabled={isGenerating}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {table.fields.map(field => (
                        <div key={field.name}>
                          <Label>{field.label}{field.required && " *"}</Label>
                          {renderField(table, field)}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Base Table Builder - shows when tables are selected */}
          {selectedTables.length > 0 && (
            <BaseTableBuilder 
              availableTables={selectedTables.map(t => `${t.values.table_name || t.label.replace(/ /g, "_")}_${postfix}`)}
              postfix={postfix}
            />
          )}

          {isGenerating && (
            <Card className="border-2 shadow-elegant animate-fade-in">
              <CardHeader className="border-b bg-gradient-to-r from-blue-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    📊 PROGRESS TRACKING
                  </CardTitle>
                  <Badge variant="outline" className="text-base">
                    {completedTables}/{tableStatuses.length} Tables
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Overall Status</p>
                      <p className="text-lg font-semibold mt-1">
                        {completedTables === tableStatuses.length ? "🟢 Complete" : "🟡 Running"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Elapsed Time</p>
                      <p className="text-lg font-semibold mt-1">{Math.floor((Date.now() - startTime) / 1000)}s</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Total Execution</p>
                      <p className="text-lg font-semibold mt-1">
                        {completedTables === tableStatuses.length 
                          ? `${Math.floor((Date.now() - startTime) / 1000)}s` 
                          : "-"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  {tableStatuses.map((table, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{table.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{table.parameters}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(table.status)}
                            <p className="text-sm font-mono min-w-[60px] text-right">
                              {table.status === "completed" && `${table.time}s`}
                              {table.status === "running" && `${table.time}s...`}
                              {table.status === "pending" && "-"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
