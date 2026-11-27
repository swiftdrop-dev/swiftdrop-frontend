import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMerchantIntegration } from "../integration/merchant-integration";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { useMerchantCredentials } from "../hooks/useMerchantCredentials";
import { MerchantApiKeyForm } from "../components/MerchantApiKeyForm";
import { MerchantSecretReveal } from "../components/MerchantSecretReveal";
import { MerchantDialog } from "../components/MerchantDialog";
import { MerchantPagination } from "../components/MerchantPagination";
import { MerchantRequestState } from "../components/MerchantRequestState";
import { merchantError } from "../services/merchant-api-error";
import type { ApiKeyIssue, ApiKeyMetadata } from "../types/merchant.types";
export default function MerchantApiKeys() {
  const api = useMerchantIntegration();
  const profile = useMerchantProfile();
  const [page, setPage] = useState(0);
  const keys = useMerchantCredentials(page);
  const cache = useQueryClient();
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [confirm, setConfirm] = useState<{
    key: ApiKeyMetadata;
    action: "rotate" | "revoke";
  } | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const approved = profile.data?.status === "APPROVED";
  async function issue(data: ApiKeyIssue) {
    if (!api.managementReady || !approved || pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await api.credentials.issue(data);
      if (mounted.current) setSecret(result.apiKey);
      await cache.invalidateQueries({
        queryKey: ["merchant", api.accountId, "credentials"],
      });
    } catch (cause) {
      if (mounted.current) setError(merchantError(cause));
    } finally {
      if (mounted.current) setPending(false);
    }
  }
  async function act() {
    if (
      !confirm ||
      !api.managementReady ||
      pending ||
      (confirm.action === "rotate" && !approved)
    )
      return;
    setPending(true);
    setError(null);
    try {
      if (confirm.action === "rotate") {
        const result = await api.credentials.rotate(confirm.key.id);
        if (mounted.current) setSecret(result.apiKey);
      } else await api.credentials.revoke(confirm.key.id);
      if (mounted.current) setConfirm(null);
      await cache.invalidateQueries({
        queryKey: ["merchant", api.accountId, "credentials"],
      });
    } catch (cause) {
      if (mounted.current) {
        setError(merchantError(cause));
        setConfirm(null);
      }
    } finally {
      if (mounted.current) setPending(false);
    }
  }
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">API keys</h1>
        <p>
          Manage credentials for your server integrations. Keys cannot
          administer this account.
        </p>
      </div>
      <section className="card card-body">
        <h2>Generate a key</h2>
        <MerchantApiKeyForm
          disabled={!api.managementReady || !approved}
          pending={pending}
          onSubmit={issue}
        />
        {!approved && (
          <p>Merchant approval is required for generation and rotation.</p>
        )}
      </section>
      <MerchantRequestState error={error} />
      {error && (
        <p>
          Do not automatically retry generation or rotation. Refresh metadata,
          identify the new key and revoke/reissue if its one-time response was
          lost.
        </p>
      )}
      <section className="card card-body">
        <h2>Your credentials</h2>
        <p className="merchant-muted" id="merchant-key-actions-help">
          {!api.managementReady
            ? "Rotation and revocation are disabled in this view. Verified live access is required; preview never changes credentials."
            : !approved
              ? "Approval is required to rotate keys. You can still revoke an existing credential."
              : "Rotate replaces an active key immediately. Revoke permanently disables a credential."}
        </p>
        <MerchantRequestState
          loading={keys.isFetching}
          error={keys.error}
          empty={keys.data?.data.length === 0}
        >
          {!keys.data && (
            <p>
              Credential metadata is unavailable until verified access is ready.
            </p>
          )}
          <div className="merchant-key-list">
            {keys.data?.data.map((key) => (
              <article className="merchant-key" key={key.id}>
                <div>
                  <h3>{key.name}</h3>
                  <code>{key.publicId}</code>
                  <p>
                    {key.scopes.join(", ")} · <strong>{key.state}</strong>
                  </p>
                  <p>
                    Created {new Date(key.createdAt).toLocaleDateString()} ·
                    Expires {new Date(key.expiresAt).toLocaleString()}
                  </p>
                </div>
                <div className="merchant-actions">
                  <button
                    className="btn btn-secondary"
                    disabled={
                      !api.managementReady ||
                      !approved ||
                      key.state !== "ACTIVE" ||
                      pending
                    }
                    onClick={() => setConfirm({ key, action: "rotate" })}
                    aria-describedby="merchant-key-actions-help"
                  >
                    Rotate
                  </button>
                  <button
                    className="btn btn-secondary"
                    disabled={
                      !api.managementReady || key.state === "REVOKED" || pending
                    }
                    onClick={() => setConfirm({ key, action: "revoke" })}
                    aria-describedby="merchant-key-actions-help"
                  >
                    Revoke
                  </button>
                </div>
              </article>
            ))}
          </div>
          {keys.data && (
            <MerchantPagination
              page={page}
              size={20}
              total={keys.data.total}
              onPage={setPage}
            />
          )}
        </MerchantRequestState>
      </section>
      {confirm && !secret && (
        <MerchantDialog
          title={`${confirm.action === "rotate" ? "Rotate" : "Revoke"} ${confirm.key.name}?`}
          onClose={() => {
            if (!pending) setConfirm(null);
          }}
        >
          <p>
            {confirm.action === "rotate"
              ? "The old key stops working immediately. The replacement keeps its scopes and defaults to a 90-day lifetime."
              : "This credential will stop authenticating new requests. This action cannot be undone."}
          </p>
          <button
            className="btn btn-primary"
            disabled={pending}
            onClick={() => void act()}
          >
            {pending ? "Working…" : "Confirm"}
          </button>
        </MerchantDialog>
      )}
      {secret && (
        <MerchantSecretReveal
          secret={secret}
          onClose={() => {
            setSecret(null);
            setConfirm(null);
          }}
        />
      )}
    </>
  );
}
