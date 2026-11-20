import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MerchantIntegrationContext,
  previewIntegration,
  type MerchantIntegration,
} from "./integration/merchant-integration";
export function merchantTestWrapper(
  api: MerchantIntegration = previewIntegration("approved"),
  route = "/merchant",
) {
  const cache = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={cache}>
          <MerchantIntegrationContext.Provider value={api}>
            {children}
          </MerchantIntegrationContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }
  return { Wrapper, cache };
}
