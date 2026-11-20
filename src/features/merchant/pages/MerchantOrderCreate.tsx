import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMerchantIntegration } from "../integration/merchant-integration";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { useMerchantOrderSubmission } from "../hooks/useMerchantOrderSubmission";
import { MerchantOrderForm } from "../components/MerchantOrderForm";
import { MerchantRequestState } from "../components/MerchantRequestState";
export default function MerchantOrderCreate() {
  const api = useMerchantIntegration();
  const profile = useMerchantProfile();
  const submission = useMerchantOrderSubmission();
  useEffect(() => {
    if (!submission.locked || submission.result) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const warnNavigation = (event: MouseEvent) => {
      if (
        (event.target as HTMLElement)?.closest("a") &&
        !window.confirm(
          "This request may already have created a shipment. Save the request reference before leaving. Leave this page?",
        )
      )
        event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", warnNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", warnNavigation, true);
    };
  }, [submission.locked, submission.result]);
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">New merchant order</h1>
        <p>Create one shipment using the merchant orders contract.</p>
      </div>
      <MerchantRequestState loading={profile.isFetching} error={profile.error}>
        <section className="card card-body">
          <MerchantOrderForm
            key={profile.data?.id ?? "unavailable"}
            profile={profile.data}
            disabled={!api.ordersReady || profile.data?.status !== "APPROVED"}
            locked={submission.locked}
            pending={submission.pending}
            onSubmit={submission.submit}
          />
        </section>
      </MerchantRequestState>
      <MerchantRequestState error={submission.error} />
      {submission.locked && !submission.result && (
        <section className="merchant-notice">
          <h2>Keep this request reference</h2>
          <code>{submission.requestReference}</code>
          <p>
            The payload is locked to this request. Do not submit a new order
            after a timeout. Leaving this page loses in-memory retry
            information; save this reference for reconciliation.
          </p>
          {submission.error?.code === "OUTCOME_UNCERTAIN" ? (
            <p>
              Contact the team to reconcile the outcome. Automatic resubmission
              is blocked.
            </p>
          ) : (
            submission.retryAllowed && (
              <button
                className="btn btn-secondary"
                disabled={submission.pending}
                onClick={submission.retry}
              >
                Retry original request
              </button>
            )
          )}
        </section>
      )}
      {submission.result && (
        <section className="merchant-notice" role="status">
          <h2>Order created</h2>
          <p>Tracking: {submission.result.trackingNumber}</p>
          <p>
            Fee: {submission.result.currency}{" "}
            {submission.result.totalFee.toFixed(2)}
          </p>
          <Link
            className="btn btn-primary"
            to={`/merchant/orders/${submission.result.id}`}
          >
            View order
          </Link>
        </section>
      )}
    </>
  );
}
