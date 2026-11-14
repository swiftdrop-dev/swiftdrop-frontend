import { Link, useSearchParams } from "react-router-dom";
import { Package } from "lucide-react";
import {
  StatCard,
  EmptyState,
} from "../../../components/shared/SharedComponents";
import { MerchantApprovalBanner } from "../components/MerchantApprovalBanner";
import { MerchantRequestState } from "../components/MerchantRequestState";
import { MerchantOrderTable } from "../components/MerchantOrderTable";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { useMerchantOrders } from "../hooks/useMerchantOrders";
export default function MerchantDashboard() {
  const profile = useMerchantProfile();
  const orders = useMerchantOrders({ page: 0, size: 5 });
  const [params] = useSearchParams();
  const link = (path: string) =>
    `${path}${import.meta.env.DEV && params.get("preview") ? `?preview=${params.get("preview")}` : ""}`;
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Merchant overview</h1>
        <p>
          Your business profile, integration credentials and shipments in one
          workspace.
        </p>
      </div>
      <MerchantRequestState loading={profile.isFetching} error={profile.error}>
        <MerchantApprovalBanner profile={profile.data} />
      </MerchantRequestState>
      <div className="merchant-actions">
        <Link
          className="btn btn-primary"
          to={link(profile.data ? "/merchant/profile" : "/merchant/onboarding")}
        >
          {profile.data ? "Manage profile" : "Complete onboarding"}
        </Link>
        <Link className="btn btn-secondary" to={link("/merchant/api-keys")}>
          Manage API keys
        </Link>
        <Link className="btn btn-secondary" to={link("/merchant/orders/new")}>
          New order
        </Link>
        <Link className="btn btn-ghost" to="/merchant/bulk">
          Bulk booking demo
        </Link>
      </div>
      {orders.data && (
        <div className="merchant-summary">
          <StatCard
            icon={<Package size={20} />}
            value={orders.data.total}
            label="Total merchant orders"
            variant="primary"
          />
        </div>
      )}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Recent orders</h2>
          <Link to={link("/merchant/orders")}>View all</Link>
        </div>
        <div className="card-body">
          <MerchantRequestState
            loading={orders.isFetching}
            error={orders.error}
            empty={orders.data?.data.length === 0}
            emptyTitle="Your shipments will appear here"
            emptyDescription="Once your merchant integration is ready, recent orders and their current status will be shown here."
          >
            {orders.data ? (
              <MerchantOrderTable orders={orders.data.data} />
            ) : (
              <EmptyState
                title="Your order workspace is ready"
                description="Live shipments are unavailable while secure integration is being completed. You can review your business profile and credential settings."
                action={
                  <Link
                    className="btn btn-secondary"
                    to={link("/merchant/profile")}
                  >
                    Review business profile
                  </Link>
                }
              />
            )}
          </MerchantRequestState>
        </div>
      </section>
    </>
  );
}
