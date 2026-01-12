// Report API Service

const API_BASE_URL = "http://127.0.0.1:8000/api";

export interface Report {
  id: string;
  name: string;
  description?: string;
  source_type: "campaign" | "custom";
  configuration: {
    campaign_id?: string;
    custom_mode?: "sql" | "filter";
    sql_query?: string;
    filters?: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  export_format: "pdf" | "excel" | "csv";
  scheduling: {
    enabled: boolean;
    frequency?: "daily" | "weekly" | "monthly";
    recipients?: string[];
  };
  scheduling_enabled?: boolean;
  frequency?: "daily" | "weekly" | "monthly";
  recipients?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReportListResponse {
  status: string;
  count: number;
  results: Report[];
}

export interface ReportCreateRequest {
  name: string;
  description?: string;
  source_type: "campaign" | "custom";
  configuration: {
    campaign_id?: string;
    custom_mode?: "sql" | "filter";
    sql_query?: string;
    filters?: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  export_format: "pdf" | "excel" | "csv";
  scheduling_enabled: boolean;
  frequency?: "daily" | "weekly" | "monthly";
  recipients?: string[];
  is_active?: boolean;
}

export interface ReportUpdateRequest {
  name?: string;
  description?: string;
  source_type?: "campaign" | "custom";
  configuration?: {
    campaign_id?: string;
    custom_mode?: "sql" | "filter";
    sql_query?: string;
    filters?: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  export_format?: "pdf" | "excel" | "csv";
  scheduling_enabled?: boolean;
  frequency?: "daily" | "weekly" | "monthly";
  recipients?: string[];
  is_active?: boolean;
}

export async function fetchReports(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  sourceType?: string,
  exportFormat?: string
): Promise<ReportListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (search) params.append("search", search);
  if (sourceType && sourceType !== "all") params.append("source_type", sourceType);
  if (exportFormat && exportFormat !== "all") params.append("export_format", exportFormat);

  const response = await fetch(`${API_BASE_URL}/report-configurations/?${params}`);
  if (!response.ok) throw new Error("Failed to fetch reports");
  return await response.json();
}

export async function fetchReportDetail(id: string): Promise<Report> {
  const response = await fetch(`${API_BASE_URL}/report-configurations/${id}/`, {
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch report detail");
  return await response.json();
}

export async function createReport(payload: ReportCreateRequest): Promise<Report> {
  const response = await fetch(`${API_BASE_URL}/report-configurations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create report");
  return await response.json();
}

export async function updateReport(id: string, payload: ReportUpdateRequest): Promise<Report> {
  const response = await fetch(`${API_BASE_URL}/report-configurations/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update report");
  return await response.json();
}

export async function deleteReport(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/report-configurations/${id}/`, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to delete report");
}
