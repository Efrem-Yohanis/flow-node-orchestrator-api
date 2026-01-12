import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReports, fetchReportDetail, createReport, updateReport, deleteReport } from "@/services/reportApi";
import type { ReportCreateRequest, ReportUpdateRequest } from "@/services/reportApi";
import { toast } from "@/hooks/use-toast";

export function useReports(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  sourceType?: string,
  exportFormat?: string
) {
  return useQuery({
    queryKey: ["reports", page, pageSize, search, sourceType, exportFormat],
    queryFn: () => fetchReports(page, pageSize, search, sourceType, exportFormat),
  });
}

export function useReportDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReportDetail(id!),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReportCreateRequest) => createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Report Created",
        description: "The report has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the report.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReportUpdateRequest }) => updateReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      toast({
        title: "Report Updated",
        description: "The report has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the report.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Report Deleted",
        description: "The report has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the report.",
        variant: "destructive",
      });
    },
  });
}
