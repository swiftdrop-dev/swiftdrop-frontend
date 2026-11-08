import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Package, FileText, Download, Star } from "lucide-react";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  StatusBadge,
  EmptyState,
  Modal,
  StatusTimeline,
  useToast,
} from "../../../components/shared/SharedComponents";

import { useAuth } from "../../auth/context/AuthContext";
import { useParcels, saveParcel } from "../services/parcel-store";
import { downloadReceipt } from "../services/receipt";

import type { Parcel } from "../../../types/global.types";
import "../customer.css";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Failed", value: "failed" },
  { label: "Returned", value: "returned" },
];

const MyParcels: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [selectedParcel, setSelectedParcel] =
    useState<Parcel | null>(null);

  const [showReceipt, setShowReceipt] =
    useState<Parcel | null>(null);

  const [receiptError, setReceiptError] = useState("");

  const { showToast } = useToast();
  const [feedbackParcel, setFeedbackParcel] = useState<Parcel | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");

  const myParcels = useParcels().filter(
    (parcel) => parcel.senderId === user?.id,
  );

  const filtered = myParcels
    .filter((parcel) => {
      const query = search.toLowerCase();

      const matchSearch =
        !search ||
        parcel.trackingNumber.toLowerCase().includes(query) ||
        parcel.recipientName.toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "in_progress" &&
          [
            "assigned",
            "picked_up",
            "in_transit",
            "out_for_delivery",
          ].includes(parcel.status)) ||
        parcel.status === statusFilter;

      const date = parcel.createdAt.slice(0, 10);

      return (
        matchSearch &&
        matchStatus &&
        (!fromDate || date >= fromDate) &&
        (!toDate || date <= toDate)
      );
    })
    .sort((a, b) =>
      sort === "oldest"
        ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
        : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

  const pages = Math.max(1, Math.ceil(filtered.length / 5));
  const currentPage = Math.min(page, pages);

  const visible = filtered.slice(
    (currentPage - 1) * 5,
    currentPage * 5,
  );

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setSort("newest");
    setPage(1);
  }

  async function handleReceiptDownload() {
    if (!showReceipt) return;

    try {
      setReceiptError("");
      await downloadReceipt(showReceipt);
    } catch {
      setReceiptError(
        "Unable to download receipt. Please try again.",
      );
    }
  }

  function handleFeedbackSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!feedbackParcel) return;

    const updated: Parcel = {
      ...feedbackParcel,
      rating: ratingVal,
      feedbackComment: feedbackComment.trim() || undefined,
      feedbackSubmittedAt: new Date().toISOString(),
    };

    saveParcel(updated);
    showToast("Thank you! Your feedback has been recorded.", "success");
    setFeedbackParcel(null);
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Parcels</h1>
        <p className="page-subtitle">
          All your bookings and shipments
        </p>

        {location.state?.bookedTracking && (
          <p role="status" className="customer-success">
            Booking confirmed:{" "}
            <strong>{location.state.bookedTracking}</strong>.
            Your parcel is awaiting assignment.
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          className="tabs customer-status-tabs"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`tab-btn ${
                statusFilter === filter.value ? "active" : ""
              }`}
              aria-pressed={statusFilter === filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="customer-history-search">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              aria-label="Search bookings"
              placeholder="Search by tracking #, recipient..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <Link
            to="/customer/book"
            className="btn btn-primary btn-sm"
          >
            <Package size={14} />
            New Booking
          </Link>
        </div>
      </div>

      <div className="customer-history-tools">
        <label>
          From date
          <input
            type="date"
            className="form-input"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(1);
            }}
          />
        </label>

        <label>
          To date
          <input
            type="date"
            className="form-input"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
          />
        </label>

        <label>
          Sort by
          <select
            className="form-input"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <button
          className="btn btn-secondary btn-sm"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {filtered.length === 0 ? (
            <EmptyState
              title="No parcels found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>To</th>
                  <th>Size/Weight</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((parcel) => (
                  <tr key={parcel.id}>
                    <td>
                      <strong
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--primary-light)",
                        }}
                      >
                        {parcel.trackingNumber}
                      </strong>
                    </td>

                    <td>
                      <p style={{ fontWeight: 600 }}>
                        {parcel.recipientName}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        {parcel.recipientPhone}
                      </p>
                    </td>

                    <td>
                      {parcel.recipientAddress.city},{" "}
                      {parcel.recipientAddress.district}
                    </td>

                    <td>
                      {parcel.size.toUpperCase()} ·{" "}
                      {parcel.weight}kg
                    </td>

                    <td>
                      <StatusBadge status={parcel.status} />
                    </td>

                    <td
                      style={{
                        color: "var(--success)",
                        fontWeight: 600,
                      }}
                    >
                      Rs. {parcel.totalFee.toLocaleString()}
                    </td>

                    <td>
                      <div>
                        {new Date(
                          parcel.createdAt,
                        ).toLocaleDateString("en-LK")}
                      </div>
                      {[
                        "pending",
                        "assigned",
                        "picked_up",
                        "in_transit",
                        "out_for_delivery",
                      ].includes(parcel.status) &&
                        parcel.estimatedDeliveryDate && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--primary-light)",
                              fontWeight: 600,
                              marginTop: 2,
                            }}
                          >
                            Est: {parcel.estimatedDeliveryDate}
                          </div>
                        )}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setSelectedParcel(parcel)
                          }
                        >
                          Track
                        </button>

                        {parcel.status === "delivered" && (
                          <>
                            <button
                              className={`btn btn-sm ${
                                parcel.rating
                                  ? "btn-ghost"
                                  : "btn-secondary"
                              }`}
                              style={{
                                color: parcel.rating
                                  ? "#d97706"
                                  : "var(--text-secondary)",
                                gap: 4,
                                padding: "4px 8px",
                              }}
                              onClick={() => {
                                setFeedbackParcel(parcel);
                                setRatingVal(parcel.rating ?? 5);
                                setFeedbackComment(
                                  parcel.feedbackComment ?? "",
                                );
                              }}
                              title={
                                parcel.rating
                                  ? `Rated ${parcel.rating}★`
                                  : "Rate this delivery"
                              }
                            >
                              <Star
                                size={12}
                                fill={
                                  parcel.rating
                                    ? "#f59e0b"
                                    : "none"
                                }
                                color={
                                  parcel.rating
                                    ? "#f59e0b"
                                    : "currentColor"
                                }
                              />
                              {parcel.rating
                                ? `${parcel.rating}★`
                                : "Rate"}
                            </button>

                            <button
                              className="btn btn-ghost btn-sm"
                              aria-label={`View receipt for ${parcel.trackingNumber}`}
                              onClick={() => {
                                setReceiptError("");
                                setShowReceipt(parcel);
                              }}
                            >
                              <FileText size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <nav
        className="customer-pagination"
        aria-label="Booking history pages"
      >
        <span role="status">
          {filtered.length} bookings · Page {currentPage} of{" "}
          {pages}
        </span>

        <div>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>{" "}

          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </nav>

      <Modal
        isOpen={!!selectedParcel}
        onClose={() => setSelectedParcel(null)}
        title={`Tracking: ${
          selectedParcel?.trackingNumber ?? ""
        }`}
        size="lg"
      >
        {selectedParcel && (
          <>
            <div className="customer-note">
              <strong>{selectedParcel.description}</strong>

              <p>
                Pickup: {selectedParcel.pickupAddress.street},{" "}
                {selectedParcel.pickupAddress.city}
              </p>

              <p>
                Delivery:{" "}
                {selectedParcel.recipientAddress.street},{" "}
                {selectedParcel.recipientAddress.city}
              </p>

              <p>
                Estimated delivery:{" "}
                {selectedParcel.estimatedDeliveryDate ??
                  "Awaiting estimate"}
              </p>
            </div>

            <StatusTimeline
              history={selectedParcel.statusHistory}
              currentStatus={selectedParcel.status}
            />
          </>
        )}
      </Modal>

      <Modal
        isOpen={!!showReceipt}
        onClose={() => setShowReceipt(null)}
        title="Delivery Receipt"
        footer={
          <button
            className="btn btn-primary btn-sm"
            onClick={handleReceiptDownload}
          >
            <Download size={14} />
            Download PDF
          </button>
        }
      >
        {showReceipt && (
          <div className="receipt">
            {receiptError && (
              <p role="alert" className="customer-error">
                {receiptError}
              </p>
            )}

            <div className="receipt-header">
              <p>SwiftDrop — Delivery Receipt</p>
              <strong>{showReceipt.trackingNumber}</strong>
              <p>Delivered Successfully</p>
            </div>

            <div className="receipt-body">
              {[
                ["Recipient", showReceipt.recipientName],
                ["Phone", showReceipt.recipientPhone],
                [
                  "Address",
                  `${showReceipt.recipientAddress.street}, ${showReceipt.recipientAddress.city}`,
                ],
                ["Package", showReceipt.description],
                ["Weight", `${showReceipt.weight} kg`],
                ["Courier", showReceipt.courierName ?? "—"],
                [
                  "Delivered",
                  showReceipt.deliveredAt
                    ? new Date(
                        showReceipt.deliveredAt,
                      ).toLocaleString("en-LK")
                    : "—",
                ],
                [
                  "Payment",
                  showReceipt.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online",
                ],
                [
                  "Delivery Fee",
                  `Rs. ${showReceipt.totalFee.toLocaleString()}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="receipt-row">
                  <span className="receipt-row-label">
                    {label}
                  </span>
                  <span className="receipt-row-value">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={!!feedbackParcel}
        onClose={() => setFeedbackParcel(null)}
        title="Delivery Feedback & Rating"
        size="md"
      >
        {feedbackParcel && (
          <form
            onSubmit={handleFeedbackSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>
                How was your delivery for {feedbackParcel.trackingNumber}?
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                Delivered to {feedbackParcel.recipientName} (
                {feedbackParcel.recipientAddress.city})
              </p>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Rating (1 - 5 Stars)
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active =
                    (hoverRating ?? ratingVal) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        color: active
                          ? "#f59e0b"
                          : "var(--border)",
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={() =>
                        setHoverRating(star)
                      }
                      onMouseLeave={() =>
                        setHoverRating(null)
                      }
                      onClick={() => setRatingVal(star)}
                      aria-label={`${star} star`}
                    >
                      <Star
                        size={26}
                        fill={active ? "#f59e0b" : "none"}
                      />
                    </button>
                  );
                })}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginLeft: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  {hoverRating ?? ratingVal} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="feedback-comment"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Comments (Optional)
              </label>
              <textarea
                id="feedback-comment"
                className="form-input"
                rows={3}
                placeholder="Share your experience (e.g. Courier was on time, package arrived safely)..."
                value={feedbackComment}
                onChange={(e) =>
                  setFeedbackComment(e.target.value)
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setFeedbackParcel(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default MyParcels;