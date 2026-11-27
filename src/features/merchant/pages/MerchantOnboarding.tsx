import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { useMerchantIntegration } from "../integration/merchant-integration";
import { MerchantProfileForm } from "../components/MerchantProfileForm";
import { MerchantApprovalBanner } from "../components/MerchantApprovalBanner";
import { MerchantRequestState } from "../components/MerchantRequestState";
import { merchantError } from "../services/merchant-api-error";
import type { MerchantOnboarding as Onboarding } from "../types/merchant.types";
export default function MerchantOnboarding() {
  const api = useMerchantIntegration();
  const profile = useMerchantProfile();
  const cache = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  async function submit(data: Onboarding) {
    if (!api.managementReady) return;
    setPending(true);
    setError(null);
    try {
      const value = await api.profile.onboard(data);
      cache.setQueryData(["merchant", api.accountId, "profile"], value);
    } catch (cause) {
      setError(merchantError(cause));
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Merchant onboarding</h1>
        <p>Register your business after your account has been verified.</p>
      </div>
      <MerchantRequestState loading={profile.isFetching} error={profile.error}>
        {profile.data ? (
          <>
            <MerchantApprovalBanner profile={profile.data} />
            <Link className="btn btn-secondary" to="/merchant/profile">
              View profile
            </Link>
          </>
        ) : (
          <section className="card card-body">
            <MerchantProfileForm
              onSubmit={submit}
              pending={pending}
              disabled={!api.managementReady}
            />
          </section>
        )}
      </MerchantRequestState>
      <MerchantRequestState error={error} />
    </>
  );
}
