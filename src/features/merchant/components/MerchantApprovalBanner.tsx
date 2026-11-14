import type { MerchantProfile } from "../types/merchant.types";
export function MerchantApprovalBanner({
  profile,
}: {
  profile: MerchantProfile | null | undefined;
}) {
  if (!profile)
    return (
      <div className="merchant-notice">
        Business profile not loaded. Complete onboarding after verified access
        is available.
      </div>
    );
  return (
    <section
      className={`merchant-notice merchant-status-${profile.status.toLowerCase()}`}
      aria-label="Merchant approval"
    >
      <strong>{profile.status}</strong>
      <p>
        {profile.status === "APPROVED"
          ? "Your merchant profile is approved."
          : profile.status === "PENDING"
            ? "Your application is awaiting review. New credentials and orders are unavailable."
            : "Your application was rejected. Contact the team for clarification; resubmission is not supported yet."}
      </p>
      {profile.reviewReason && <p>Review reason: {profile.reviewReason}</p>}
    </section>
  );
}
