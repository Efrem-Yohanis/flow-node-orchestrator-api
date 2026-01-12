// src/services/dashboardApi.ts
const API_BASE_URL = "http://127.0.0.1:8000/api";

export type Period = "24h" | "7d" | "30d" | "90d";

export interface MetricValue {
  current: number;
  formatted: string;
  previous_period: number;
  change: number; // can be negative
  change_type: "increase" | "decrease";
  threshold_days?: number;
}

export interface CustomerMetricsResponse {
  status: string;
  period: string;
  metrics: {
    total_customers: MetricValue;
    active_customers: MetricValue;
    new_registered: MetricValue;
    churn_rate: MetricValue;
    dormant_customers: MetricValue;
  };
  date_ranges: {
    current_period_start: string;
    current_period_end: string;
    previous_period_start: string;
    previous_period_end: string;
  };
  updated_at: string;
}

export interface ActivityTrendDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
}

export interface ActivityTrendResponse {
  status: string;
  period: string;
  chart_type: string;
  granularity: string;
  labels: string[];
  datasets: ActivityTrendDataset[];
  totals: {
    total_active: number;
    total_dormant: number;
    active_percentage: number;
    dormant_percentage: number;
  };
  date_ranges: {
    start_date: string;
    end_date: string;
  };
  updated_at: string;
}

export interface ChurnRiskDistributionResponse {
  status: string;
  analysis: {
    timestamp: string;
    timeframe: string;
    total_customers_analyzed: number;
    distribution: {
      low_risk: {
        count: number;
        percentage: number;
        description: string;
      };
      medium_risk: {
        count: number;
        percentage: number;
        description: string;
      };
      high_risk: {
        count: number;
        percentage: number;
        description: string;
        recommendation?: string;
      };
    };
    summary: {
      total_at_high_risk: number;
      high_risk_percentage: number;
      key_insight: string;
    };
  };
}

export interface CampaignPerformanceItem {
  id: string;
  name: string;
  performance: number;
  target: number;
  completion_rate: number;
  color: string;
}

export interface CampaignPerformanceResponse {
  status: string;
  campaigns: CampaignPerformanceItem[];
  timeframe: string;
  total_performance: number;
  average_completion_rate: number;
  updated_at: string;
}

export interface RecentCampaignItem {
  id: string;
  name: string;
  delivered: number;
  target: number;
  progress: number;
  status: "running" | "completed" | string;
  start_date: string;
  end_date: string;
  type: string;
}

export interface RecentCampaignsResponse {
  status: string;
  campaigns: RecentCampaignItem[];
  total_running: number;
  total_completed: number;
  overall_delivery_rate: number;
  updated_at: string;
}

export interface DashboardSummaryResponse {
  status: string;
  period: string;
  data: {
    customer_metrics: CustomerMetricsResponse;
    activity_trend: ActivityTrendResponse;
    churn_risk_distribution: ChurnRiskDistributionResponse;
    campaign_performance: CampaignPerformanceResponse;
    recent_campaigns: RecentCampaignsResponse;
  };
  timestamp: string;
}

async function handleJson<T>(response: Response, errorPrefix: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDashboardSummary(period: Period = "7d"): Promise<DashboardSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/summary?period=${encodeURIComponent(period)}`);
  return handleJson(response, "Failed to fetch dashboard summary");
}

export async function fetchCustomerMetrics(period: Period = "7d"): Promise<CustomerMetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/customer-metrics?period=${encodeURIComponent(period)}`);
  return handleJson(response, "Failed to fetch customer metrics");
}

export async function fetchActivityTrend(period: Period = "7d"): Promise<ActivityTrendResponse> {
  const response = await fetch(`${API_BASE_URL}/activity-trend/?period=${encodeURIComponent(period)}`);
  return handleJson(response, "Failed to fetch activity trend");
}

export async function fetchChurnRiskDistribution(): Promise<ChurnRiskDistributionResponse> {
  const response = await fetch(`${API_BASE_URL}/churn-risk-distribution`);
  return handleJson(response, "Failed to fetch churn risk distribution");
}

export async function fetchCampaignPerformance(): Promise<CampaignPerformanceResponse> {
  const response = await fetch(`${API_BASE_URL}/campaign-performance`);
  const text = await response.text();
  const sanitized = text.replace(/"id"\s*:\s*([0-9]{15,})/g, '"id":"$1"');
  const data = JSON.parse(sanitized) as CampaignPerformanceResponse;
  // Normalize ids to strings
  if (data && Array.isArray(data.campaigns)) {
    data.campaigns = data.campaigns.map((c: any) => ({ ...c, id: String(c.id) }));
  }
  return data;
}

export async function fetchRecentCampaigns(): Promise<RecentCampaignsResponse> {
  const response = await fetch(`${API_BASE_URL}/recent-campaigns`);
  const text = await response.text();
  const sanitized = text.replace(/"id"\s*:\s*([0-9]{15,})/g, '"id":"$1"');
  const data = JSON.parse(sanitized) as RecentCampaignsResponse;
  if (data && Array.isArray(data.campaigns)) {
    data.campaigns = data.campaigns.map((c: any) => ({ ...c, id: String(c.id) }));
  }
  return data;
}