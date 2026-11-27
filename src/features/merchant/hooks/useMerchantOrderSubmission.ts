import { useRef, useState } from "react";
import { useMerchantIntegration } from "../integration/merchant-integration";
import {
  MerchantApiError,
  merchantError,
} from "../services/merchant-api-error";
import type {
  MerchantOrder,
  MerchantOrderCreate,
} from "../types/merchant-order.types";
export function useMerchantOrderSubmission() {
  const api = useMerchantIntegration();
  const [attempt, setAttempt] = useState<{ key: string; payload: MerchantOrderCreate } | null>(
    null,
  );
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<MerchantApiError | null>(null);
  const [result, setResult] = useState<MerchantOrder | null>(null);
  const [locked, setLocked] = useState(false);
  async function submit(payload: MerchantOrderCreate) {
    if (busy.current || result || !api.ordersReady) return;
    if (
      error &&
      [
        "OUTCOME_UNCERTAIN",
        "IDEMPOTENCY_CONFLICT",
        "PARCEL_REQUEST_REJECTED",
      ].includes(error.code)
    )
      return;
    const activeAttempt = attempt ?? {
        key: crypto.randomUUID(),
        payload: structuredClone(payload),
      };
    if (!attempt) setAttempt(activeAttempt);
    busy.current = true;
    setPending(true);
    setLocked(true);
    setError(null);
    try {
      setResult(
        await api.orders.create(activeAttempt.payload, activeAttempt.key),
      );
    } catch (cause) {
      setError(merchantError(cause));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  // Explicit retries use the frozen payload/key. Ambiguous results cannot start a fresh attempt.
  function retry() {
    if (attempt) void submit(attempt.payload);
  }
  return {
    submit,
    retry,
    pending,
    error,
    result,
    locked,
    requestReference: attempt?.key,
    retryAllowed:
      error?.code === "REQUEST_IN_PROGRESS" ||
      (!!error &&
        ![
          "OUTCOME_UNCERTAIN",
          "IDEMPOTENCY_CONFLICT",
          "PARCEL_REQUEST_REJECTED",
        ].includes(error.code)),
  };
}
