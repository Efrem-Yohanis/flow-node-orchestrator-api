// src/services/campaignApi.ts
const API_BASE_URL = "http://127.0.0.1:8000/api";

/** LIST */
export interface CampaignListItem {
  id: string | number; // your list response shows huge numbers, detail uses "CAMP_XXXX"
  name: string;
  type: string; // "Incentive"
  segment: string;
  channels: string[];
  status: string; // "Draft" | "Pending Approval" ...
  startDate: string | null;
  endDate: string | null;
}

export interface CampaignListResponse {
  status: "success" | string;
  campaigns: CampaignListItem[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  summary: {
    total_campaigns: number;
    active_campaigns: number;
    total_estimated_cost: number;
    formatted_total_cost: string;
  };
}

/** CREATE / UPDATE / SUBMIT request body (same shape you provided) */
export interface CampaignUpsertRequest {
  basics: {
    name: string;
    type: string; // "incentive"
    objective: string;
    description: string;
  };
  audience: {
    selectedSegmentIds: string[];
    uploadedFile: any | null;
    totalTargetedCustomers: number;
  };
  communication: {
    enabledChannels: string[]; // ["sms","email"]
    messages: Record<string, any>;
    email?: Record<string, any>;
    settings?: Record<string, any>;
  };
  rewards: {
    type: string; // "cashback"
    value: number;
    caps: {
      perCustomer: number;
      campaignCap: number;
    };
    disbursementAccount: { id: string };
  };
  scheduling: {
    type: string; // "scheduled"
    startDate: string;
    endDate: string;
    frequencyCap: string; // "daily"
  };
  status: string; // "draft"
}

/** CREATE response */
export interface CampaignCreateResponse {
  success: boolean;
  message: string;
  data: {
    campaignId: string; // "CAMP_42CB816E"
    status: string;
    createdAt: string;
    validationSummary?: {
      estimatedCost: number;
      accountBalanceRemaining: number;
      conflictingCampaigns: number;
    };
    approvalWorkflow?: {
      currentStage: string;
      nextApprover: string;
    };
  };
}

/** DETAIL */
export interface CampaignDetailResponse {
  success: boolean;
  campaignId: string;
  data: {
    header: {
      name: string;
      status: string;
      type: string;
      owner: string;
      createdDate: string;
      objective: string;
    };
    overview: {
      summary: {
        description: string;
        scheduleType: string;
        frequencyCap: string;
      };
      rewards: {
        type: string;
        value: string;
        dailyCap: string;
        perCustomerCap: string;
        account: string;
        estimatedCost: string;
      };
      channels: Array<{
        type: string; // "SMS" | "EMAIL"
        enabled: boolean;
        priority: number;
        cap: number;
        content: Array<{ lang: string; text: string }>;
      }>;
      approvals: any[];
    };
  };
}

/** UPDATE response (your PUT returns success + message + data similar to detail) */
export interface CampaignUpdateResponse {
  success: boolean;
  message: string;
  data: CampaignDetailResponse["data"];
}

/** SUBMIT response */
export interface CampaignSubmitResponse {
  status: "success" | string;
  message: string;
}

/** DELETE response */
export interface CampaignDeleteResponse {
  status: "success" | string;
  message: string;
}

/** EXTRA TABS */
export interface CampaignAudienceResponse {
  success: boolean;
  data: {
    stats: {
      total: number;
      segments: Array<{ label: string; count: number; percentage: number }>;
      valueTiers: Array<{ label: string; count: number; percentage: number }>;
    };
    list: Array<{
      msisdn: string;
      tier: string;
      status: string;
      risk: string;
      reward: string;
    }>;
  };
}

export interface CampaignChannelsResponse {
  success: boolean;
  data: {
    channels: Array<{
      type: string;
      status: string;
      configuration: {
        templates: Record<string, string>;
        characterCount: number;
      };
      metrics: {
        sent: number;
        delivered: number;
        failed: number;
      };
    }>;
  };
}

export interface CampaignPerformanceResponse {
  success: boolean;
  data: {
    kpis: Array<{ label: string; value: string; icon: string; color: string }>;
    dailyTrend: Array<{ date: string; targeted: number; activated: number }>;
    channelPerformance: Array<{
      channel: string;
      targeted: number;
      sent: number;
      delivered: number;
      successRate: number;
    }>;
  };
}

export interface CampaignRewardsResponse {
  success: boolean;
  data: {
    configuration: { type: string; value: string; campaignCap: string };
    accountDetails: {
      id: string;
      name: string;
      currentBalance: number;
      consumed: number;
      startingBalance: number;
    };
    statusLog: Array<{ msisdn: string; status: string; reason: string; timestamp: string }>;
  };
}

export interface CampaignLogsResponse {
  success: boolean;
  data: {
    systemLogs: Array<{ timestamp: string; type: string; message: string }>;
    auditTrail: Array<{ timestamp: string; user: string; action: string }>;
  };
}

// helpers
async function handleJson<T>(res: Response, prefix: string): Promise<T> {
  if (!res.ok) throw new Error(`${prefix}: ${res.status} ${res.statusText}`);
  return res.json();
}

// API functions
export async function fetchCampaigns(): Promise<CampaignListResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/`);
  const text = await res.text();
  // Sanitize large numeric ids by turning long numeric literals into strings before parsing
  const sanitized = text.replace(/"id"\s*:\s*([0-9]{15,})/g, '"id":"$1"');
  const data = JSON.parse(sanitized) as CampaignListResponse;

  // Normalize id to string and prefer campaignId when available to avoid precision/scientific issues
  if (data && Array.isArray(data.campaigns)) {
    data.campaigns = data.campaigns.map((c: any) => ({ ...c, id: c.campaignId ? String(c.campaignId) : String(c.id), campaignId: c.campaignId ? String(c.campaignId) : undefined }));
  }
  return data;
}

export async function createCampaign(payload: CampaignUpsertRequest): Promise<CampaignCreateResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res, "Failed to create campaign");
}

export async function fetchCampaignDetail(id: string | number): Promise<CampaignDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}`);
  return handleJson(res, "Failed to fetch campaign detail");
}

export async function updateCampaign(
  id: string | number,
  payload: CampaignUpsertRequest
): Promise<CampaignUpdateResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res, "Failed to update campaign");
}

export async function submitCampaign(
  id: string | number,
  payload: CampaignUpsertRequest
): Promise<CampaignSubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}/submit/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res, "Failed to submit campaign");
}

export async function deleteCampaign(id: string | number): Promise<CampaignDeleteResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}/delete/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return handleJson(res, "Failed to delete campaign");
}

// Detail sub-resources (tabs)
export async function fetchCampaignAudience(id: string | number): Promise<CampaignAudienceResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}/audience/`);
  return handleJson(res, "Failed to fetch campaign audience");
}

export async function fetchCampaignChannels(id: string | number): Promise<CampaignChannelsResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}/channels`);
  return handleJson(res, "Failed to fetch campaign channels");
}

export async function fetchCampaignPerformance(id: string | number): Promise<CampaignPerformanceResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}/performance`);
  return handleJson(res, "Failed to fetch campaign performance");
}

export async function fetchCampaignRewards(id: string | number): Promise<CampaignRewardsResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}/rewards`);
  return handleJson(res, "Failed to fetch campaign rewards");
}

export async function fetchCampaignLogs(id: string | number): Promise<CampaignLogsResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(String(id))}/logs`);
  return handleJson(res, "Failed to fetch campaign logs");
}