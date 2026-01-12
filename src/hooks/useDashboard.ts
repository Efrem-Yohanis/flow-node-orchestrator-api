// src/hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardSummary,
  fetchCustomerMetrics,
  fetchActivityTrend,
  fetchChurnRiskDistribution,
  fetchCampaignPerformance,
  fetchRecentCampaigns,
  type Period,
} from "@/services/dashboardApi";

export function useDashboardSummary(period: Period) {
  return useQuery({
    queryKey: ["dashboard-summary", period],
    queryFn: () => fetchDashboardSummary(period),
    enabled: !!period,
  });
}

// Optional: if you want to call endpoints separately
export function useCustomerMetrics(period: Period) {
  return useQuery({
    queryKey: ["customer-metrics", period],
    queryFn: () => fetchCustomerMetrics(period),
    enabled: !!period,
  });
}

export function useActivityTrend(period: Period) {
  return useQuery({
    queryKey: ["activity-trend", period],
    queryFn: () => fetchActivityTrend(period),
    enabled: !!period,
  });
}

export function useChurnRiskDistribution() {
  return useQuery({
    queryKey: ["churn-risk-distribution"],
    queryFn: fetchChurnRiskDistribution,
  });
}

export function useCampaignPerformance() {
  return useQuery({
    queryKey: ["campaign-performance"],
    queryFn: fetchCampaignPerformance,
  });
}

export function useRecentCampaigns() {
  return useQuery({
    queryKey: ["recent-campaigns"],
    queryFn: fetchRecentCampaigns,
  });
}