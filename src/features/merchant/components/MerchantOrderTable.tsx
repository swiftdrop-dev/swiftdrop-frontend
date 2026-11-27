import { Link, useSearchParams } from "react-router-dom";
import { StatusBadge } from "../../../components/shared/SharedComponents";
import type { ParcelStatus } from "../../../types/global.types";
import type { MerchantOrder } from "../types/merchant-order.types";
export function MerchantOrderTable({ orders }: { orders: MerchantOrder[] }) {
  const [params] = useSearchParams();
  const preview = import.meta.env.DEV ? params.get("preview") : null;
  return (
    <div className="table-wrapper">
      <table className="table merchant-table">
        <caption className="merchant-sr-only">Merchant orders</caption>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Tracking</th>
            <th>Recipient</th>
            <th>Status</th>
            <th>Total fee</th>
            <th>Created</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.merchantOrderRef}</td>
              <td>
                <code>{order.trackingNumber}</code>
              </td>
              <td>{order.details.recipient.name}</td>
              <td>
                <StatusBadge
                  status={order.status.toLowerCase() as ParcelStatus}
                />
              </td>
              <td>
                {order.currency}{" "}
                {order.totalFee.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <Link
                  to={`/merchant/orders/${order.id}${preview ? `?preview=${preview}` : ""}`}
                  aria-label={`View ${order.merchantOrderRef}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
