import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useSearchParams, NavLink } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import {
  MerchantIntegrationContext,
  previewIntegration,
  useMerchantIntegration,
} from "../integration/merchant-integration";
import "../merchant.css";
function MerchantScope({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
  );
  useEffect(
    () => () => {
      client.clear();
    },
    [client],
  );
  const [params] = useSearchParams();
  const location = useLocation();
  const inherited = useMerchantIntegration();
  const state = params.get("preview");
  const preview =
    import.meta.env.DEV &&
    state &&
    ["new", "pending", "approved", "rejected"].includes(state);
  const integration = preview ? previewIntegration(state) : inherited;
  return (
    <QueryClientProvider client={client}>
      <MerchantIntegrationContext.Provider value={integration}>
        <DashboardLayout title="Merchant workspace">
          <div className="merchant-module">
            <div
              className={`merchant-notice ${preview ? "merchant-preview" : ""}`}
              role="status"
            >
              {preview
                ? "Read-only development preview · sample data · all submissions disabled"
                : "Live merchant integration is unavailable until M1 authentication, backend HTTP activation and M2 integration are ready."}
            </div>
            <nav className="merchant-subnav" aria-label="Merchant pages">
              {[
                ["/merchant", "Overview"],
                ["/merchant/onboarding", "Onboarding"],
                ["/merchant/profile", "Profile"],
                ["/merchant/api-keys", "API keys"],
                ["/merchant/orders/new", "New order"],
                ["/merchant/orders", "Orders"],
              ].map(([path, label]) => (
                <NavLink
                  key={path}
                  to={`${path}${preview ? `?preview=${state}` : ""}`}
                  end={path === "/merchant"}
                  className={({ isActive }) =>
                    isActive &&
                    !(
                      path === "/merchant/orders" &&
                      location.pathname.replace(/\/+$/, "") ===
                        "/merchant/orders/new"
                    )
                      ? "active"
                      : ""
                  }
                  aria-current={
                    path === "/merchant/orders" &&
                    location.pathname.replace(/\/+$/, "") ===
                      "/merchant/orders/new"
                      ? false
                      : undefined
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            {children}
          </div>
        </DashboardLayout>
      </MerchantIntegrationContext.Provider>
    </QueryClientProvider>
  );
}
export default function MerchantModuleBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();
  const integration = useMerchantIntegration();
  // A separate cache per page/account prevents personal data surviving account changes.
  return (
    <MerchantScope
      key={`${user?.id ?? "none"}:${integration.accountId}:${location.pathname}:${new URLSearchParams(location.search).get("preview") ?? ""}`}
    >
      {children}
    </MerchantScope>
  );
}
