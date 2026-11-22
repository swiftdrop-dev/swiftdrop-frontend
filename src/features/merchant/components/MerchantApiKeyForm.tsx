import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiKeyIssue } from "../types/merchant.types";
import { apiKeySchema } from "../validation/merchant.schemas";
export function MerchantApiKeyForm({
  disabled,
  pending,
  onSubmit,
}: {
  disabled: boolean;
  pending: boolean;
  onSubmit: (data: ApiKeyIssue) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApiKeyIssue>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "", scopes: [], expiresAt: "" },
  });
  return (
    <form
      noValidate
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          expiresAt: data.expiresAt
            ? new Date(data.expiresAt).toISOString()
            : undefined,
        }),
      )}
    >
      <label className="merchant-field">
        Key name
        <input
          className="form-input"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && <small role="alert">{errors.name.message}</small>}
      </label>
      <fieldset className="merchant-scope">
        <legend>Allowed scopes</legend>
        {(["orders:read", "orders:write"] as const).map((scope) => (
          <label className="merchant-checkbox" key={scope}>
            <input type="checkbox" value={scope} {...register("scopes")} />{" "}
            {scope}
          </label>
        ))}
        {errors.scopes && <small role="alert">{errors.scopes.message}</small>}
      </fieldset>
      <label className="merchant-field">
        Expiration (optional, local time)
        <input
          className="form-input"
          type="datetime-local"
          {...register("expiresAt")}
        />
        {errors.expiresAt && (
          <small role="alert">{errors.expiresAt.message}</small>
        )}
      </label>
      <p>
        Default and maximum lifetime: 90 days. The secret will be shown once.
      </p>
      <button
        className="btn btn-primary"
        disabled={disabled || pending}
        type="submit"
        aria-describedby={disabled ? "merchant-key-disabled" : undefined}
      >
        {pending ? "Generating…" : "Generate API key"}
      </button>
      {disabled && (
        <p id="merchant-key-disabled" className="merchant-muted">
          Generation requires an approved business profile and verified live
          access. Preview is read-only.
        </p>
      )}
    </form>
  );
}
