import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMerchantOrder } from "../hooks/useMerchantOrders";
import { MerchantRequestState } from "../components/MerchantRequestState";
export default function MerchantOrderDetail() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const order = useMerchantOrder(id);
  const value = order.data;
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Order details</h1>
        <Link
          to={`/merchant/orders${import.meta.env.DEV && params.get("preview") ? `?preview=${params.get("preview")}` : ""}`}
        >
          Back to orders
        </Link>
      </div>
      <MerchantRequestState loading={order.isFetching} error={order.error}>
        {value ? (
          <section className="card card-body">
            <h2>{value.merchantOrderRef}</h2>
            <dl className="merchant-details">
              <dt>Canonical parcel ID</dt>
              <dd>{value.id}</dd>
              <dt>Tracking</dt>
              <dd>{value.trackingNumber}</dd>
              <dt>Status</dt>
              <dd>{value.status}</dd>
              <dt>Created</dt>
              <dd>{new Date(value.createdAt).toLocaleString()}</dd>
              <dt>Recipient</dt>
              <dd>
                {value.details.recipient.name} · {value.details.recipient.phone}
              </dd>
              <dt>Package</dt>
              <dd>
                {value.details.description} · {value.details.weightKg} kg ·{" "}
                {value.details.size}
              </dd>
              <dt>Pickup</dt>
              <dd>
                {Object.values(value.details.pickupAddress)
                  .filter(Boolean)
                  .join(", ")}
              </dd>
              <dt>Destination</dt>
              <dd>
                {Object.values(value.details.deliveryAddress)
                  .filter(Boolean)
                  .join(", ")}
              </dd>
              <dt>Delivery fee</dt>
              <dd>
                {value.currency} {value.deliveryFee.toFixed(2)}
              </dd>
              <dt>Total fee</dt>
              <dd>
                {value.currency} {value.totalFee.toFixed(2)}
              </dd>
              <dt>Payment method</dt>
              <dd>{value.details.paymentMethod}</dd>
            </dl>
            <p>
              Current status comes from the parcel service. Payment confirmation
              and a tracking timeline are not supplied by this contract.
            </p>
          </section>
        ) : (
          <p>
            Order details are unavailable until secure integration is ready.
          </p>
        )}
      </MerchantRequestState>
    </>
  );
}
