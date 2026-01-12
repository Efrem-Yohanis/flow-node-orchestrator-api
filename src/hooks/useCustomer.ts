import { useQuery } from "@tanstack/react-query";
import { fetchCustomer360, Customer360Response } from "@/services/customerApi";

export function useCustomer360(msisdn: string | null) {
  return useQuery<Customer360Response>({
    queryKey: ["customer360", msisdn],
    queryFn: () => fetchCustomer360(msisdn!),
    enabled: !!msisdn,
  });
}
