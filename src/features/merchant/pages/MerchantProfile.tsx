import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../components/shared/SharedComponents";
import { useQueryClient } from "@tanstack/react-query";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { useMerchantIntegration } from "../integration/merchant-integration";
import { MerchantApprovalBanner } from "../components/MerchantApprovalBanner";
import { MerchantProfileForm } from "../components/MerchantProfileForm";
import { MerchantRequestState } from "../components/MerchantRequestState";
import { merchantError } from "../services/merchant-api-error";
import type { MerchantOnboarding } from "../types/merchant.types";
export default function MerchantProfile() {
  const api = useMerchantIntegration();
  const profile = useMerchantProfile();
  const cache = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [saved, setSaved] = useState(false);
  async function submit(data: MerchantOnboarding) {
    if (!api.managementReady || profile.data?.status !== "APPROVED") return;
    setPending(true);
    setError(null);
    setSaved(false);
    const {
      contactName,
      contactEmail,
      contactPhone,
      pickupStreet,
      pickupCity,
      pickupDistrict,
    } = data;
    try {
      const value = await api.profile.update({
        contactName,
        contactEmail,
        contactPhone,
        pickupStreet,
        pickupCity,
        pickupDistrict,
      });
      cache.setQueryData(["merchant", api.accountId, "profile"], value);
      setSaved(true);
    } catch (cause) {
      setError(merchantError(cause));
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Merchant profile</h1>
        <p>Manage your business contact and pickup information.</p>
      </div>
      <MerchantRequestState loading={profile.isFetching} error={profile.error}>
        {profile.data && <MerchantApprovalBanner profile={profile.data} />}
        {profile.data ? (
          <section className="card card-body">
            <MerchantProfileForm
              key={profile.data.updatedAt}
              initial={profile.data}
              editing
              onSubmit={submit}
              disabled={
                !api.managementReady || profile.data.status !== "APPROVED"
              }
              pending={pending}
            />
          </section>
        ) : (
          <section className="card card-body">
            <EmptyState
              title={
                profile.data === null
                  ? "Register your business"
                  : "Business profile unavailable"
              }
              description={
                profile.data === null
                  ? "Complete onboarding to send your business details for approval."
                  : "Verified live access is not enabled yet. Your business details will appear here once secure integration is available."
              }
              action={
                <Link
                  to={`/merchant/onboarding${api.mode === "preview" ? "?preview=new" : ""}`}
                  className="btn btn-secondary"
                >
                  Open onboarding
                </Link>
              }
            />
          </section>
        )}
      </MerchantRequestState>
      <MerchantRequestState error={error} />
      {saved && <p role="status">Profile saved.</p>}
    </>
  );
}
