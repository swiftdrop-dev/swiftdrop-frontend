import { useQuery } from "@tanstack/react-query";
import { useMerchantIntegration } from "../integration/merchant-integration";
export function useMerchantProfile() {
  const api = useMerchantIntegration();
  return useQuery({
    queryKey: ["merchant", api.accountId, "profile"],
    queryFn: api.profile.get,
    enabled: api.managementReady || api.mode === "preview",
    retry: false,
  });
}
