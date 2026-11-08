import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  User,
  Phone,
  Weight,
  Info,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Mail,
  Briefcase,
  Archive,
  Boxes,
} from "lucide-react";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import { useToast } from "../../../components/shared/SharedComponents";
import { useAuth } from "../../auth/context/AuthContext";
import { saveParcel } from "../services/parcel-store";

import type {
  Parcel,
  ParcelSize,
} from "../../../types/global.types";

import "../customer.css";

const SIZES: {
  value: ParcelSize;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "xs",
    label: "Extra Small",
    desc: "Under 0.5 kg / Envelope",
    icon: <Mail size={20} strokeWidth={1.6} />,
  },
  {
    value: "sm",
    label: "Small",
    desc: "0.5–2 kg / Shoebox",
    icon: <Package size={20} strokeWidth={1.6} />,
  },
  {
    value: "md",
    label: "Medium",
    desc: "2–5 kg / Laptop bag",
    icon: <Briefcase size={20} strokeWidth={1.6} />,
  },
  {
    value: "lg",
    label: "Large",
    desc: "5–15 kg / Moving box",
    icon: <Archive size={20} strokeWidth={1.6} />,
  },
  {
    value: "xl",
    label: "Extra Large",
    desc: "15 kg+ / Bulk cargo",
    icon: <Boxes size={20} strokeWidth={1.6} />,
  },
];

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

function calcFee(
  weight: number,
  size: ParcelSize,
  fragile: boolean,
  toDistrict: string,
) {
  const baseMap: Record<ParcelSize, number> = {
    xs: 150,
    sm: 250,
    md: 350,
    lg: 550,
    xl: 850,
  };

  const farDistricts = [
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Hambantota",
    "Batticaloa",
    "Trincomalee",
    "Ampara",
  ];

  const base = baseMap[size];

  const validWeight =
    Number.isFinite(weight) && weight > 0 ? weight : 0;

  const weightFee = Math.ceil(validWeight) * 50;

  const distanceFee = farDistricts.includes(toDistrict)
    ? 300
    : toDistrict === "Colombo"
      ? 0
      : 100;

  const fragileFee = fragile ? 75 : 0;

  const days = farDistricts.includes(toDistrict)
    ? 3
    : toDistrict === "Colombo"
      ? 1
      : 2;

  return {
    base,
    weight: weightFee,
    distance: distanceFee,
    fragile: fragileFee,
    total: base + weightFee + distanceFee + fragileFee,
    days,
  };
}

const BookParcel: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submittingRef = useRef(false);

  const [form, setForm] = useState({
    recipientName: "",
    recipientPhone: "",
    pickupStreet: "",
    pickupCity: "Colombo",
    pickupDistrict: "Colombo",
    deliveryStreet: "",
    deliveryCity: "",
    deliveryDistrict: "Colombo",
    description: "",
    weight: 1,
    size: "sm" as ParcelSize,
    declaredValue: "",
    fragile: false,
    specialInstructions: "",
    paymentMethod: "cod" as "cod" | "online",
  });

  const fee = calcFee(
    form.weight,
    form.size,
    form.fragile,
    form.deliveryDistrict,
  );

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    if (!user) {
      setError("Please log in before booking a parcel.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const createdAt = new Date().toISOString();

      const newParcel: Parcel = {
        id: crypto.randomUUID(),

        trackingNumber: `SWF-${new Date().getFullYear()}-${crypto
          .randomUUID()
          .replaceAll("-", "")
          .slice(0, 12)
          .toUpperCase()}`,

        status: "pending",

        senderId: user.id,
        senderName: user.name,
        senderPhone: user.phone ?? "",
        senderType:
          user.role === "merchant" ? "merchant" : "customer",

        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.replace(/[-\s]/g, "").trim(),

        recipientAddress: {
          street: form.deliveryStreet.trim(),
          city: form.deliveryCity.trim(),
          district: form.deliveryDistrict,
        },

        pickupAddress: {
          street: form.pickupStreet.trim(),
          city: form.pickupCity.trim(),
          district: form.pickupDistrict,
        },

        description: form.description.trim(),
        weight: form.weight,
        size: form.size,

        declaredValue: form.declaredValue
          ? Number(form.declaredValue)
          : undefined,

        fragile: form.fragile,
        specialInstructions: form.specialInstructions.trim(),

        deliveryFee: fee.total,
        totalFee: fee.total,

        paymentStatus: "pending",
        paymentMethod: form.paymentMethod,

        createdAt,

        estimatedDeliveryDate: new Date(
          Date.now() + fee.days * 86400000,
        )
          .toISOString()
          .slice(0, 10),

        statusHistory: [
          {
            status: "pending",
            timestamp: createdAt,
            note: "Booking confirmed",
          },
        ],
      };

      saveParcel(newParcel);

      showToast(
        `Parcel booked successfully! ${newParcel.trackingNumber}`,
        "success",
      );

      navigate(
        user.role === "merchant"
          ? "/merchant/parcels"
          : "/customer/parcels",
        {
          state: {
            bookedTracking: newParcel.trackingNumber,
          },
        },
      );
    } catch {
      setError(
        "Your booking could not be saved. Check browser storage and try again.",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: "Addresses" },
    { id: 2, label: "Package" },
    { id: 3, label: "Review" },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Book a Parcel</h1>
        <p className="page-subtitle">
          Fill in the details to create a new delivery booking
        </p>
      </div>

      {/* Step indicator */}
      <div
        className="step-indicator"
        style={{ maxWidth: 480, marginBottom: 28 }}
      >
        {steps.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="step-item">
              <div
                className={`step-circle ${
                  step > item.id
                    ? "done"
                    : step === item.id
                      ? "active"
                      : ""
                }`}
              >
                {step > item.id ? (
                  <CheckCircle size={14} />
                ) : (
                  item.id
                )}
              </div>

              <span
                className={`step-label ${
                  step > item.id
                    ? "done"
                    : step === item.id
                      ? "active"
                      : ""
                }`}
                aria-current={
                  step === item.id ? "step" : undefined
                }
              >
                {item.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`step-line ${
                  step > item.id ? "done" : ""
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="customer-booking-grid">
        <div className="card">
          <form
            className="card-body customer-booking-form"
            onSubmit={(event) => {
              event.preventDefault();

              if (step < 3) {
                setError("");
                setStep((current) => current + 1);
              } else {
                void handleSubmit();
              }
            }}
          >
            {error && (
              <p role="alert" className="customer-error">
                {error}
              </p>
            )}

            {/* Step 1: Addresses */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 20,
                  }}
                >
                  Pickup & Delivery Addresses
                </h3>

                <div
                  style={{
                    borderLeft: "3px solid var(--primary)",
                    paddingLeft: 16,
                    marginBottom: 24,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--primary-light)",
                      marginBottom: 12,
                    }}
                  >
                    Pickup Location
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="pickupStreet"
                      >
                        Street Address *
                      </label>

                      <input
                        id="pickupStreet"
                        className="form-input"
                        placeholder="12 Kandy Road"
                        value={form.pickupStreet}
                        onChange={(event) =>
                          update("pickupStreet", event.target.value)
                        }
                        required
                        pattern=".*\S.*"
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="pickupCity"
                        >
                          City *
                        </label>

                        <input
                          id="pickupCity"
                          className="form-input"
                          placeholder="Colombo"
                          value={form.pickupCity}
                          onChange={(event) =>
                            update("pickupCity", event.target.value)
                          }
                          required
                          pattern=".*\S.*"
                        />
                      </div>

                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="pickupDistrict"
                        >
                          District *
                        </label>

                        <select
                          id="pickupDistrict"
                          className="form-input"
                          value={form.pickupDistrict}
                          onChange={(event) =>
                            update(
                              "pickupDistrict",
                              event.target.value,
                            )
                          }
                        >
                          {DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderLeft: "3px solid var(--success)",
                    paddingLeft: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--success)",
                      marginBottom: 12,
                    }}
                  >
                    Delivery Details
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="recipientName"
                        >
                          Recipient Name *
                        </label>

                        <div className="form-input-icon">
                          <User className="icon" size={16} />

                          <input
                            id="recipientName"
                            className="form-input"
                            placeholder="Full name"
                            value={form.recipientName}
                            onChange={(event) =>
                              update(
                                "recipientName",
                                event.target.value,
                              )
                            }
                            required
                            pattern=".*\S.*"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="recipientPhone"
                        >
                          Recipient Phone *
                        </label>

                        <div className="form-input-icon">
                          <Phone className="icon" size={16} />

                          <input
                            id="recipientPhone"
                            type="tel"
                            className="form-input"
                            placeholder="0771234567 or 077-1234567"
                            pattern="(?:0\d{2}[-\s]?\d{3}[-\s]?\d{4}|0\d{9}|\+94\d{2}[-\s]?\d{3}[-\s]?\d{4}|\+94\d{9})"
                            title="Enter 10 digits (e.g. 0771234567 or 077-1234567), or +94 followed by 9 digits"
                            value={form.recipientPhone}
                            onChange={(event) =>
                              update(
                                "recipientPhone",
                                event.target.value,
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="deliveryStreet"
                      >
                        Delivery Street Address *
                      </label>

                      <input
                        id="deliveryStreet"
                        className="form-input"
                        placeholder="45 Galle Road"
                        value={form.deliveryStreet}
                        onChange={(event) =>
                          update(
                            "deliveryStreet",
                            event.target.value,
                          )
                        }
                        required
                        pattern=".*\S.*"
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="deliveryCity"
                        >
                          City *
                        </label>

                        <input
                          id="deliveryCity"
                          className="form-input"
                          placeholder="Kandy"
                          value={form.deliveryCity}
                          onChange={(event) =>
                            update(
                              "deliveryCity",
                              event.target.value,
                            )
                          }
                          required
                          pattern=".*\S.*"
                        />
                      </div>

                      <div className="form-group">
                        <label
                          className="form-label"
                          htmlFor="deliveryDistrict"
                        >
                          District *
                        </label>

                        <select
                          id="deliveryDistrict"
                          className="form-input"
                          value={form.deliveryDistrict}
                          onChange={(event) =>
                            update(
                              "deliveryDistrict",
                              event.target.value,
                            )
                          }
                        >
                          {DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Package details */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 20,
                  }}
                >
                  Package Details
                </h3>

                <div
                  className="form-group"
                  style={{ marginBottom: 20 }}
                >
                  <label
                    className="form-label"
                    htmlFor="description"
                  >
                    Package Description *
                  </label>

                  <div className="form-input-icon">
                    <Package className="icon" size={16} />

                    <input
                      id="description"
                      className="form-input"
                      placeholder="e.g. Electronics – Laptop"
                      value={form.description}
                      onChange={(event) =>
                        update("description", event.target.value)
                      }
                      required
                      pattern=".*\S.*"
                    />
                  </div>
                </div>

                <div
                  className="form-group"
                  style={{ marginBottom: 20 }}
                >
                  <p className="form-label" id="packageSizeLabel">
                    Package Size *
                  </p>

                  <div
                    className="customer-size-grid"
                    role="group"
                    aria-labelledby="packageSizeLabel"
                  >
                    {SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        aria-pressed={form.size === size.value}
                        onClick={() => update("size", size.value)}
                        style={{
                          padding: "12px 8px",
                          borderRadius: 14,
                          textAlign: "center",
                          border: `2px solid ${
                            form.size === size.value
                              ? "var(--primary)"
                              : "var(--border-strong)"
                          }`,
                          background:
                            form.size === size.value
                              ? "var(--primary-tint)"
                              : "var(--bg-overlay)",
                          cursor: "pointer",
                          transition: "all 200ms",
                          fontFamily: "inherit",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: 6,
                            color: "var(--text-primary)",
                          }}
                        >
                          {size.icon}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                              form.size === size.value
                                ? "var(--primary-light)"
                                : "var(--text-secondary)",
                            marginTop: 6,
                          }}
                        >
                          {size.label}
                        </div>

                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {size.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div className="form-group">
                    <label
                      className="form-label"
                      htmlFor="weight"
                    >
                      Weight (kg) *
                    </label>

                    <div className="form-input-icon">
                      <Weight className="icon" size={16} />

                      <input
                        id="weight"
                        type="number"
                        min={0.1}
                        max={1000}
                        step={0.1}
                        className="form-input"
                        value={form.weight}
                        onChange={(event) =>
                          update(
                            "weight",
                            event.target.value === ""
                              ? 0
                              : Number(event.target.value),
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label
                      className="form-label"
                      htmlFor="declaredValue"
                    >
                      Declared Value (Rs.)
                    </label>

                    <input
                      id="declaredValue"
                      type="number"
                      min={0}
                      max={10000000}
                      step="any"
                      className="form-input"
                      placeholder="Optional"
                      value={form.declaredValue}
                      onChange={(event) =>
                        update(
                          "declaredValue",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div className="form-group">
                    <label
                      className="form-label"
                      htmlFor="paymentMethod"
                    >
                      Payment Method
                    </label>

                    <select
                      id="paymentMethod"
                      className="form-input"
                      value={form.paymentMethod}
                      onChange={(event) =>
                        update(
                          "paymentMethod",
                          event.target.value as "cod" | "online",
                        )
                      }
                    >
                      <option value="cod">Cash on Delivery</option>
                      <option value="online">
                        Online Payment (Demo)
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label
                      className="form-label"
                      htmlFor="fragile"
                    >
                      Fragile Package?
                    </label>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                      }}
                    >
                      <label className="toggle-switch">
                        <input
                          id="fragile"
                          type="checkbox"
                          checked={form.fragile}
                          onChange={(event) =>
                            update(
                              "fragile",
                              event.target.checked,
                            )
                          }
                        />
                        <span className="toggle-track" />
                      </label>

                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {form.fragile
                          ? "Requires careful handling"
                          : "Standard handling"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label
                    className="form-label"
                    htmlFor="specialInstructions"
                  >
                    Special Instructions
                  </label>

                  <textarea
                    id="specialInstructions"
                    className="form-input"
                    placeholder="e.g. Call before delivery, leave at gate..."
                    value={form.specialInstructions}
                    onChange={(event) =>
                      update(
                        "specialInstructions",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 20,
                  }}
                >
                  Review & Confirm
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-overlay)",
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        marginBottom: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Addresses
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: 11,
                            marginBottom: 4,
                          }}
                        >
                          PICKUP FROM
                        </p>

                        <p
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 500,
                          }}
                        >
                          {form.pickupStreet}
                        </p>

                        <p
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {form.pickupCity}, {form.pickupDistrict}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: 11,
                            marginBottom: 4,
                          }}
                        >
                          DELIVER TO
                        </p>

                        <p
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 500,
                          }}
                        >
                          {form.recipientName}
                        </p>

                        <p
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {form.deliveryStreet}, {form.deliveryCity}
                        </p>

                        <p
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {form.deliveryDistrict}
                        </p>

                        <p
                          style={{
                            color: "var(--text-muted)",
                            marginTop: 4,
                          }}
                        >
                          {form.recipientPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--bg-overlay)",
                      borderRadius: 14,
                      padding: 16,
                      fontSize: 13,
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontSize: 11,
                      }}
                    >
                      Package
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          Description
                        </p>

                        <p
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {form.description}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          Size / Weight
                        </p>

                        <p
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {form.size.toUpperCase()} /{" "}
                          {form.weight}kg
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          Payment
                        </p>

                        <p
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {form.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Online (Demo)"}
                        </p>
                      </div>
                    </div>

                    {form.declaredValue && (
                      <p
                        style={{
                          marginTop: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Declared value: Rs.{" "}
                        {Number(
                          form.declaredValue,
                        ).toLocaleString()}
                      </p>
                    )}

                    {form.fragile && (
                      <p
                        style={{
                          marginTop: 10,
                          color: "var(--warning)",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Info size={12} />
                        Fragile — handled with care (+Rs. 75)
                      </p>
                    )}

                    {form.specialInstructions.trim() && (
                      <p
                        style={{
                          marginTop: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Instructions: {form.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 28,
                gap: 12,
              }}
            >
              {step > 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={submitting}
                  onClick={() => {
                    setError("");
                    setStep((current) => current - 1);
                  }}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div
                        className="spinner"
                        style={{
                          width: 16,
                          height: 16,
                          borderWidth: 2,
                        }}
                      />
                      Booking…
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Booking
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Fee estimate */}
        <div className="customer-fee-sidebar">
          <div className="fee-box">
            <p
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Fee Estimate
            </p>

            <p className="customer-note">
              Demo pricing. Final rates will come from the
              pricing API. Online payments are simulated.
            </p>

            <div className="fee-row">
              <span>Base rate ({form.size.toUpperCase()})</span>
              <span>Rs. {fee.base}</span>
            </div>

            <div className="fee-row">
              <span>Weight ({form.weight}kg)</span>
              <span>Rs. {fee.weight}</span>
            </div>

            <div className="fee-row">
              <span>Distance ({form.deliveryDistrict})</span>
              <span>Rs. {fee.distance}</span>
            </div>

            {form.fragile && (
              <div className="fee-row">
                <span>Fragile handling</span>
                <span>Rs. {fee.fragile}</span>
              </div>
            )}

            <div className="fee-row-total">
              <span>Total Fee</span>
              <span>Rs. {fee.total.toLocaleString()}</span>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "var(--success-bg)",
                border: "1px solid var(--success-border)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--success)",
                fontWeight: 500,
              }}
            >
              Est. delivery in{" "}
              <strong>
                {fee.days} {fee.days === 1 ? "day" : "days"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookParcel;