import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Package,
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { trackingApi, type PublicTrackingData, type TrackingTimelineItem } from "../api/tracking.api";
import type { ParcelStatus } from "../../../types/global.types";
import {
  StatusBadge,
  StatusTimeline,
} from "../../../components/shared/SharedComponents";

function mapStatus(backendStatus: string): ParcelStatus {
  if (!backendStatus) return "pending";
  const s = backendStatus.toLowerCase();
  if (s === "created") return "pending";
  if (s === "assigned") return "assigned";
  if (s === "picked_up" || s === "pickedup") return "picked_up";
  if (s === "in_transit") return "in_transit";
  if (s === "out_for_delivery") return "out_for_delivery";
  if (s === "delivered") return "delivered";
  if (s === "failed" || s === "delivery_failed") return "failed";
  if (s === "cancelled") return "cancelled";
  if (s === "returned") return "returned";
  return "pending";
}

interface PublicTrackingResult {
  trackingNumber: string;
  status: ParcelStatus;
  pickupCity: string;
  pickupDistrict: string;
  deliveryCity: string;
  deliveryDistrict: string;
  timeline: TrackingTimelineItem[];
  statusHistory: {
    status: ParcelStatus;
    timestamp: string;
    note?: string;
    location?: string;
  }[];
}

const PublicTracking: React.FC = () => {
  const [params] = useSearchParams();

  const initialQuery = params.get("q")?.trim() ?? "";

  const [trackingNum, setTrackingNum] = useState(initialQuery);
  const [result, setResult] = useState<PublicTrackingResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const performLookup = useCallback(async (num: string, isSilent = false) => {
    if (!num.trim()) {
      setResult(null);
      setNotFound(false);
      return;
    }

    try {
      if (!isSilent) {
        setLoading(true);
        setNotFound(false);
      }
      const res: PublicTrackingData = await trackingApi.getPublicTracking(num.trim());
      if (res && res.trackingNumber) {
        const status = mapStatus(res.status);
        const history = (res.timeline || []).map((t) => ({
          status: mapStatus(t.status),
          timestamp: t.timestamp,
          note: t.description || t.title,
          location: t.location || undefined,
        }));

        setResult({
          trackingNumber: res.trackingNumber,
          status,
          pickupCity: res.pickupCity || "Origin Hub",
          pickupDistrict: res.pickupDistrict || "",
          deliveryCity: res.deliveryCity || "Destination Area",
          deliveryDistrict: res.deliveryDistrict || "",
          timeline: res.timeline || [],
          statusHistory: history.length > 0 ? history : [
            {
              status,
              timestamp: new Date().toISOString(),
              note: `Status: ${res.status}`,
            },
          ],
        });
        setNotFound(false);
      } else {
        if (!isSilent) {
          setResult(null);
          setNotFound(true);
        }
      }
    } catch {
      if (!isSilent) {
        setResult(null);
        setNotFound(true);
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performLookup(initialQuery);
    }
  }, [initialQuery, performLookup]);

  // Automatic HTTP polling for active non-terminal parcels with cleanup on unmount
  useEffect(() => {
    if (!result?.trackingNumber) return;
    const isTerminal = ["delivered", "cancelled", "returned"].includes(result.status);
    if (isTerminal) return;

    const intervalId = setInterval(() => {
      performLookup(result.trackingNumber, true);
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [result?.trackingNumber, result?.status, performLookup]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    performLookup(trackingNum.trim());
  };

  return (
    <div className="tracking-hero">
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="dot-grid" />
      </div>

      {/* Navbar */}
      <div className="tracking-nav">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <Package size={17} strokeWidth={2.25} />
          </div>

          <div>
            <span className="brand-word">
              Swift<span>Drop</span>
            </span>
            <span className="brand-sub">Public tracking</span>
          </div>
        </Link>

        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </div>

      {/* Search box */}
      <div className="tracking-box animate-scale-in">
        <div style={{ marginBottom: 26 }}>
          <p
            className="section-label"
            style={{ marginBottom: 16 }}
          >
            <MapPin size={13} />
            Parcel tracking
          </p>

          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 42px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 8,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
            }}
          >
            Track your{" "}
            <span className="gradient-text">parcel</span>
          </h1>

          <p
            style={{
              fontSize: 14.5,
              color: "var(--text-secondary)",
            }}
          >
            Enter your tracking number to check delivery progress and status.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              flex: "1 1 180px",
              minWidth: 0,
              position: "relative",
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />

            <input
              type="text"
              className="form-input"
              aria-label="Tracking number"
              style={{
                paddingLeft: 40,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
                height: 50,
                width: "100%",
              }}
              placeholder="e.g. SWF-2026-001234"
              value={trackingNum}
              onChange={(event) =>
                setTrackingNum(event.target.value)
              }
              required
              pattern=".*\S.*"
              title="Enter a tracking number"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ minWidth: 104 }}
          >
            Track
          </button>
        </form>

        {loading && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 14,
            }}
          >
            Searching for parcel...
          </div>
        )}

        {notFound && (
          <div
            role="alert"
            style={{
              marginTop: 16,
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: 10,
              padding: "12px 16px",
              textAlign: "center",
              color: "var(--danger)",
              fontSize: 14,
            }}
          >
            No parcel found with this tracking number.
            Please double-check and try again.
          </div>
        )}
      </div>

      {/* Tracking result */}
      {result && (
        <div className="tracking-result">
          <div className="card">
            <div
              className="card-header"
              style={{
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                    overflowWrap: "anywhere",
                  }}
                >
                  {result.trackingNumber}
                </p>

                <StatusBadge status={result.status} />
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShieldCheck size={14} color="var(--success)" />
                <span>Verified SwiftDrop Delivery</span>
              </div>
            </div>

            <div
              className="card-body"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                gap: 24,
              }}
            >
              {/* Route details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  minWidth: 0,
                  overflowWrap: "anywhere",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Route Overview
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      fontSize: 14,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      <MapPin
                        size={14}
                        style={{
                          color: "var(--text-muted)",
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />

                      <div>
                        <p style={{ color: "var(--text-muted)", fontSize: 11 }}>
                          From
                        </p>
                        <p style={{ color: "var(--text-secondary)" }}>
                          {result.pickupCity}
                          {result.pickupDistrict ? `, ${result.pickupDistrict}` : ""}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <MapPin
                        size={14}
                        style={{
                          color: "var(--primary-light)",
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />

                      <div>
                        <p style={{ color: "var(--text-muted)", fontSize: 11 }}>
                          To
                        </p>
                        <p style={{ color: "var(--text-secondary)" }}>
                          {result.deliveryCity}
                          {result.deliveryDistrict ? `, ${result.deliveryDistrict}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy note */}
                <div
                  style={{
                    background: "var(--bg-overlay)",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 12,
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    <ShieldCheck size={14} /> Public Privacy Protection
                  </p>
                  Recipient name, phone, and detailed street addresses are masked for security. Full parcel details are accessible via the customer portal.
                </div>

                {/* Event history list */}
                {result.timeline.length > 0 && (
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        marginBottom: 10,
                      }}
                    >
                      Recent Activity
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[...result.timeline].reverse().slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
                          <Clock size={13} style={{ color: "var(--primary-light)", marginTop: 3, flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                              {item.title}
                            </p>
                            {item.description && (
                              <p style={{ color: "var(--text-secondary)", fontSize: 12, margin: "2px 0 0" }}>
                                {item.description}
                              </p>
                            )}
                            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                              {new Date(item.timestamp).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" })}
                              {item.location && ` · ${item.location}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Timeline */}
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                    marginBottom: 16,
                  }}
                >
                  Delivery Progress
                </p>

                <StatusTimeline
                  history={result.statusHistory}
                  currentStatus={result.status}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTracking;