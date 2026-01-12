const API_BASE_URL = "http://127.0.0.1:8000/api";

export interface CustomerProfile {
  msisdn: string;
  name: string;
  initials: string;
  status: string;
  tier: string;
  kycLevel: string;
  demographics: {
    gender: string;
    age: number;
    region: string;
    city: string;
  };
  dates: {
    registered: string;
    lastActive: string;
  };
}

export interface CustomerMetrics {
  lifetimeValue: number;
  monthlyAvg: number;
  currency: string;
}

export interface CustomerAIInsights {
  churnScore: number;
  churnRisk: string;
  recommendedAction: string;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
}

export interface CustomerCampaign {
  id: string;
  name: string;
  date: string;
  status: string;
  reward: string;
}

export interface CustomerMessage {
  id: string;
  date: string;
  channel: string;
  content: string;
}

export interface CustomerActivities {
  transactions: CustomerTransaction[];
  campaigns: CustomerCampaign[];
  messages: CustomerMessage[];
}

export interface Customer360Response {
  profile: CustomerProfile;
  metrics: CustomerMetrics;
  aiInsights: CustomerAIInsights;
  activities: CustomerActivities;
}

export async function fetchCustomer360(msisdn: string): Promise<Customer360Response> {
  const response = await fetch(`${API_BASE_URL}/customer/${msisdn}/`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch customer: ${response.statusText}`);
  }

  return response.json();
}
