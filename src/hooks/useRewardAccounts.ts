// src/hooks/useRewardAccounts.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchRewardAccounts,
  fetchRewardAccountDetail,
  createRewardAccount,
  updateRewardAccount,
  deleteRewardAccount,
  type RewardAccountCreateRequest,
  type RewardAccountUpdateRequest,
} from "@/services/rewardAccountApi";

export function useRewardAccounts() {
  return useQuery({
    queryKey: ["reward-accounts"],
    queryFn: fetchRewardAccounts,
  });
}

export function useRewardAccountDetail(id?: number | string) {
  return useQuery({
    queryKey: ["reward-account", id],
    queryFn: () => fetchRewardAccountDetail(id as number | string),
    enabled: !!id,
  });
}

export function useCreateRewardAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RewardAccountCreateRequest) => createRewardAccount(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reward-accounts"] });
      toast.success("Reward account created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create reward account: ${error.message}`);
    },
  });
}

export function useUpdateRewardAccount(id: number | string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RewardAccountUpdateRequest) => updateRewardAccount(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reward-accounts"] });
      qc.invalidateQueries({ queryKey: ["reward-account", id] });
      toast.success("Reward account updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update reward account: ${error.message}`);
    },
  });
}

export function useDeleteRewardAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteRewardAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reward-accounts"] });
      toast.success("Reward account deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete reward account: ${error.message}`);
    },
  });
}