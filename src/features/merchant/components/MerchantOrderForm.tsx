import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema } from "../validation/merchant-order.schemas";
import type { MerchantOrderCreate } from "../types/merchant-order.types";
import type { MerchantProfile } from "../types/merchant.types";
export function MerchantOrderForm({
  profile,
  disabled,
  locked,
  pending,
  onSubmit,
}: {
  profile?: MerchantProfile | null;
  disabled: boolean;
  locked: boolean;
  pending: boolean;
  onSubmit: (data: MerchantOrderCreate) => Promise<void>;
}) {
  const { register, handleSubmit, getFieldState, formState } =
    useForm<MerchantOrderCreate>({
      resolver: zodResolver(orderSchema),
      defaultValues: {
        merchantOrderRef: "",
        recipient: { name: "", phone: "" },
        pickupAddress: {
          street: profile?.pickupStreet ?? "",
          city: profile?.pickupCity ?? "",
          district: profile?.pickupDistrict ?? "",
        },
        deliveryAddress: { street: "", city: "", district: "" },
        description: "",
        weightKg: 1,
        size: "SM",
        fragile: false,
        paymentMethod: "COD",
      },
    });
  function field(
    name: FieldPath<MerchantOrderCreate>,
    label: string,
    type = "text",
    numeric = false,
  ) {
    const error = getFieldState(name, formState).error;
    return (
      <label className="merchant-field" key={name}>
        {label}
        <input
          className="form-input"
          type={type}
          step={numeric ? (name === "weightKg" ? "0.001" : "0.01") : undefined}
          {...register(
            name,
            numeric
              ? {
                  setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
                }
              : {},
          )}
          aria-invalid={!!error}
        />
        {error && (
          <small className="merchant-field-error" role="alert">
            {error.message}
          </small>
        )}
      </label>
    );
  }
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={locked || pending} className="merchant-form-fieldset">
        <legend>Shipment details</legend>
        <div className="merchant-form-grid merchant-shipment-contact">
          {field("merchantOrderRef", "Merchant order reference")}
          {field("recipient.name", "Recipient name")}
          {field("recipient.phone", "Recipient phone", "tel")}
        </div>
        {(["pickupAddress", "deliveryAddress"] as const).map((group) => (
          <section
            className="merchant-form-section"
            key={group}
            aria-label={
              group === "pickupAddress" ? "Pickup address" : "Delivery address"
            }
          >
            <h3>
              {group === "pickupAddress"
                ? "Pickup address"
                : "Delivery address"}
            </h3>
            <div className="merchant-form-grid">
              {field(`${group}.street`, "Street")}
              {field(`${group}.city`, "City")}
              {field(`${group}.district`, "District")}
              {field(`${group}.postalCode`, "Postal code (optional)")}
            </div>
          </section>
        ))}
        <section
          className="merchant-form-section"
          aria-label="Package and payment"
        >
          <h3>Package and payment</h3>
          <div className="merchant-form-grid">
            {field("description", "Parcel description")}
            {field("weightKg", "Weight (kg)", "number", true)}
            {field(
              "declaredValue",
              "Declared value (optional)",
              "number",
              true,
            )}
            <label className="merchant-field">
              Package size
              <select className="form-input" {...register("size")}>
                {["XS", "SM", "MD", "LG", "XL"].map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </label>
            <label className="merchant-field">
              Payment method
              <select className="form-input" {...register("paymentMethod")}>
                <option value="COD">Cash on delivery</option>
                <option value="ONLINE">Online</option>
              </select>
            </label>
            {field("specialInstructions", "Special instructions (optional)")}
            <label className="merchant-checkbox">
              <input type="checkbox" {...register("fragile")} /> Fragile parcel
            </label>
          </div>
        </section>
      </fieldset>
      <div className="merchant-form-footer">
        <p>
          Tracking and fees are assigned by the parcel service after creation.
          Selecting online payment does not collect payment here.
        </p>
        <button
          className="btn btn-primary"
          disabled={disabled || locked || pending}
          type="submit"
        >
          {pending ? "Submitting…" : "Create order"}
        </button>
        {disabled && (
          <p className="merchant-muted" role="note">
            Order submission requires approval and an approved browser
            authentication integration.
          </p>
        )}
      </div>
    </form>
  );
}
