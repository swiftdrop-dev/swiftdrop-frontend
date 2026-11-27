import { useQuery } from "@tanstack/react-query";
import { useMerchantIntegration } from "../integration/merchant-integration";
import type { OrderQuery } from "../types/merchant-order.types";
export function useMerchantOrders(query: OrderQuery) {
  const api = useMerchantIntegration();
  return useQuery({
    queryKey: ["merchant", api.accountId, "orders", query],
    queryFn: ({ signal }) => api.orders.list(query, signal),
    enabled: api.ordersReady || api.mode === "preview",
    retry: false,
  });
}
export function useMerchantOrder(id: string) {
  const api = useMerchantIntegration();
  return useQuery({
    queryKey: ["merchant", api.accountId, "order", id],
    queryFn: () => api.orders.detail(id),
    enabled: !!id && (api.ordersReady || api.mode === "preview"),
    retry: false,
  });
}
