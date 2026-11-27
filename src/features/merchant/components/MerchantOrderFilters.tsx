import { useState } from "react";
import { ORDER_STATUSES } from "../types/merchant-order.types";
export interface OrderFilters {
  status: string;
  merchantOrderRef: string;
  trackingNumber: string;
  createdFrom: string;
  createdTo: string;
}
export function MerchantOrderFilters({
  values,
  onApply,
}: {
  values: OrderFilters;
  onApply: (filters: OrderFilters) => void;
}) {
  const [draft, setDraft] = useState(values);
  const [error, setError] = useState("");
  function update(name: keyof OrderFilters, value: string) {
    setDraft((d) => ({ ...d, [name]: value }));
  }
  return (
    <form
      className="merchant-filters"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          draft.createdFrom &&
          draft.createdTo &&
          draft.createdFrom > draft.createdTo
        ) {
          setError("The start date must be before the end date.");
          return;
        }
        setError("");
        onApply(draft);
      }}
    >
      <label className="merchant-field">
        Status
        <select
          className="form-input"
          value={draft.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <label className="merchant-field">
        Merchant reference
        <input
          className="form-input"
          maxLength={100}
          value={draft.merchantOrderRef}
          onChange={(e) => update("merchantOrderRef", e.target.value)}
        />
      </label>
      <label className="merchant-field">
        Tracking number
        <input
          className="form-input"
          maxLength={100}
          value={draft.trackingNumber}
          onChange={(e) => update("trackingNumber", e.target.value)}
        />
      </label>
      <label className="merchant-field">
        Created from (local time)
        <input
          type="datetime-local"
          className="form-input"
          value={draft.createdFrom}
          onChange={(e) => update("createdFrom", e.target.value)}
        />
      </label>
      <label className="merchant-field">
        Created to (local time)
        <input
          type="datetime-local"
          className="form-input"
          value={draft.createdTo}
          onChange={(e) => update("createdTo", e.target.value)}
        />
      </label>
      <div className="merchant-filter-actions">
        <button className="btn btn-primary" type="submit">
          Apply filters
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            const empty = {
              status: "",
              merchantOrderRef: "",
              trackingNumber: "",
              createdFrom: "",
              createdTo: "",
            };
            setDraft(empty);
            onApply(empty);
          }}
        >
          Clear filters
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
