// src/hooks/useCampaigns.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCampaigns,
  fetchCampaignDetail,
  createCampaign,
  updateCampaign,
  submitCampaign,
  deleteCampaign,
  fetchCampaignAudience,
  fetchCampaignChannels,
  fetchCampaignPerformance,
  fetchCampaignRewards,
  fetchCampaignLogs,
  type CampaignUpsertRequest,
} from "@/services/campaignApi";

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });
}

export function useCampaignDetail(id?: string | number) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchCampaignDetail(id as string | number),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CampaignUpsertRequest) => createCampaign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully");
    },
    onError: (err: Error) => toast.error(`Failed to create campaign: ${err.message}`),
  });
}

export function useUpdateCampaign(id: string | number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CampaignUpsertRequest) => updateCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Campaign updated successfully");
    },
    onError: (err: Error) => toast.error(`Failed to update campaign: ${err.message}`),
  });
}

export function useSubmitCampaign(id: string | number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CampaignUpsertRequest) => submitCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Campaign submitted for approval successfully");
    },
    onError: (err: Error) => toast.error(`Failed to submit campaign: ${err.message}`),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign deleted successfully");
    },
    onError: (err: Error) => toast.error(`Failed to delete campaign: ${err.message}`),
  });
}

// Tabs (sub-resources)
export function useCampaignAudience(id?: string | number) {
  return useQuery({
    queryKey: ["campaign-audience", id],
    queryFn: () => fetchCampaignAudience(id as string | number),
    enabled: !!id,
  });
}

export function useCampaignChannels(id?: string | number) {
  return useQuery({
    queryKey: ["campaign-channels", id],
    queryFn: () => fetchCampaignChannels(id as string | number),
    enabled: !!id,
  });
}

export function useCampaignPerformance(id?: string | number) {
  return useQuery({
    queryKey: ["campaign-performance", id],
    queryFn: () => fetchCampaignPerformance(id as string | number),
    enabled: !!id,
  });
}

export function useCampaignRewards(id?: string | number) {
  return useQuery({
    queryKey: ["campaign-rewards", id],
    queryFn: () => fetchCampaignRewards(id as string | number),
    enabled: !!id,
  });
}

export function useCampaignLogs(id?: string | number) {
  return useQuery({
    queryKey: ["campaign-logs", id],
    queryFn: () => fetchCampaignLogs(id as string | number),
    enabled: !!id,
  });
}