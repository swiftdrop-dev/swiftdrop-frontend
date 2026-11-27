import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "../validation/merchant.schemas";
import type { MerchantOnboarding } from "../types/merchant.types";
export function MerchantProfileForm({
  initial,
  editing = false,
  disabled,
  pending,
  onSubmit,
}: {
  initial?: MerchantOnboarding;
  editing?: boolean;
  disabled: boolean;
  pending: boolean;
  onSubmit: (data: MerchantOnboarding) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MerchantOnboarding>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: initial,
  });
  const fields: [keyof MerchantOnboarding, string, string?][] = [
    ["businessName", "Business name"],
    ["registrationNumber", "Registration number"],
    ["contactName", "Contact name"],
    ["contactEmail", "Contact email", "email"],
    ["contactPhone", "Contact phone", "tel"],
    ["pickupStreet", "Pickup street"],
    ["pickupCity", "Pickup city"],
    ["pickupDistrict", "Pickup district"],
  ];
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="merchant-form-grid">
        {fields.map(([name, label, type]) => (
          <label key={name} className="merchant-field">
            {label}
            <input
              className="form-input"
              type={type ?? "text"}
              {...register(name)}
              readOnly={
                editing && ["businessName", "registrationNumber"].includes(name)
              }
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? `error-${name}` : undefined}
            />
            {errors[name] && (
              <small className="merchant-field-error" id={`error-${name}`}>
                {errors[name]?.message}
              </small>
            )}
          </label>
        ))}
      </div>
      <p>
        {editing
          ? "Business identity is read-only. Contact and pickup details can be updated only after approval."
          : "Submitting creates a PENDING application. It does not approve your business."}
      </p>
      <button
        className="btn btn-primary"
        type="submit"
        disabled={disabled || pending}
      >
        {pending ? "Saving…" : editing ? "Save profile" : "Submit application"}
      </button>
      {disabled && (
        <p className="merchant-muted">
          Submission is unavailable in this view. You can review the form.
        </p>
      )}
    </form>
  );
}
