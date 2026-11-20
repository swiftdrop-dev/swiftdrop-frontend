import { useQuery } from "@tanstack/react-query";
import { useMerchantIntegration } from "../integration/merchant-integration";
export function useMerchantCredentials(page: number) {
  const api = useMerchantIntegration();
  return useQuery({
    queryKey: ["merchant", api.accountId, "credentials", page],
    queryFn: () => api.credentials.list(page, 20),
    enabled: api.managementReady || api.mode === "preview",
    retry: false,
  });
}
