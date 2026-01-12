const API_BASE_URL = "http://127.0.0.1:8000/api";

// Types
export interface AssignedCampaign {
  campaign_id: string;
  name: string;
  status: string;
}

export interface RewardAccount {
  id: number;
  account_id: string;
  account_name: string;
  balance: string; // "50000.00"
  formatted_balance: string; // "50,000.00 ETB"
  currency: string; // "ETB"
  status: "active" | "inactive" | string;
  is_available: boolean;
  assigned_campaigns_count: number;
  assigned_campaigns: AssignedCampaign[];
  created_at: string;
  updated_at: string;
}

export interface RewardAccountListResponse {
  status: string;
  accounts: RewardAccount[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  summary: {
    total_accounts: number;
    active_accounts: number;
    total_balance: number;
    formatted_total_balance: string;
  };
}

export interface RewardAccountDetailResponse {
  status: string;
  account: RewardAccount;
}

export interface RewardAccountCreateRequest {
  account_id: string;
  account_name: string;
  balance: number;
  currency: string;
  status: "active" | "inactive";
}

export interface RewardAccountCreateResponse {
  status: string;
  message: string;
  account: RewardAccount;
}

// If your backend has a strict update schema, replace this.
export type RewardAccountUpdateRequest = Partial<RewardAccountCreateRequest>;

export interface RewardAccountUpdateResponse {
  status: string;
  message: string;
  account: RewardAccount;
}

export interface RewardAccountDeleteResponse {
  status: string;
  message: string;
}

async function handleJson<T>(response: Response, errorPrefix: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// API Functions
export async function fetchRewardAccounts(): Promise<RewardAccountListResponse> {
  const response = await fetch(`${API_BASE_URL}/reward-accounts/`);
  return handleJson(response, "Failed to fetch reward accounts");
}

export async function fetchRewardAccountDetail(id: number | string): Promise<RewardAccountDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/reward-accounts/${id}`);
  return handleJson(response, "Failed to fetch reward account");
}

export async function createRewardAccount(
  data: RewardAccountCreateRequest
): Promise<RewardAccountCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/reward-accounts/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleJson(response, "Failed to create reward account");
}
export async function updateRewardAccount(
  id: number | string,
  data: RewardAccountUpdateRequest
): Promise<RewardAccountUpdateResponse> {
  const response = await fetch(`${API_BASE_URL}/reward-accounts/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleJson(response, "Failed to update reward account");
}

export async function deleteRewardAccount(id: number | string): Promise<RewardAccountDeleteResponse> {
  const response = await fetch(`${API_BASE_URL}/reward-accounts/${id}/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return handleJson(response, "Failed to delete reward account");
}