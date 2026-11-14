import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../../../components/shared/SharedComponents";
import {
  MerchantOrderFilters,
  type OrderFilters,
} from "../components/MerchantOrderFilters";
import { MerchantOrderTable } from "../components/MerchantOrderTable";
import { MerchantPagination } from "../components/MerchantPagination";
import { MerchantRequestState } from "../components/MerchantRequestState";
import { useMerchantOrders } from "../hooks/useMerchantOrders";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "../types/merchant-order.types";
export default function MerchantOrders() {
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get("page") ?? "0");
  const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const rawSize = Number(params.get("size") ?? "20");
  const size = [10, 20, 50, 100].includes(rawSize) ? rawSize : 20;
  const rawStatus = params.get("status") ?? "";
  const status = ORDER_STATUSES.includes(rawStatus as OrderStatus)
    ? (rawStatus as OrderStatus)
    : undefined;
  const values: OrderFilters = {
    status: status ?? "",
    merchantOrderRef: params.get("merchantOrderRef") ?? "",
    trackingNumber: params.get("trackingNumber") ?? "",
    createdFrom: params.get("createdFrom") ?? "",
    createdTo: params.get("createdTo") ?? "",
  };
  const date = (value: string) =>
    value && Number.isFinite(Date.parse(value))
      ? new Date(value).toISOString()
      : undefined;
  const orders = useMerchantOrders({
    page,
    size,
    status,
    merchantOrderRef: values.merchantOrderRef || undefined,
    trackingNumber: values.trackingNumber || undefined,
    createdFrom: date(values.createdFrom),
    createdTo: date(values.createdTo),
  });
  function apply(filters: OrderFilters) {
    const next = new URLSearchParams(params);
    Object.entries(filters).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    next.set("page", "0");
    setParams(next);
  }
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Merchant orders</h1>
        <p>Filter and browse canonical shipments from the parcel service.</p>
      </div>
      <section className="card card-body">
        <MerchantOrderFilters
          key={params.toString()}
          values={values}
          onApply={apply}
        />
        <div className="merchant-results-toolbar">
          <h2>Shipments</h2>
          <label className="merchant-field merchant-page-size">
            Rows per page
            <select
              className="form-input"
              value={size}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                next.set("size", e.target.value);
                next.set("page", "0");
                setParams(next);
              }}
            >
              {[10, 20, 50, 100].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <MerchantRequestState
          loading={orders.isFetching}
          error={orders.error}
          empty={orders.data?.data.length === 0}
          emptyDescription="No shipments match these filters. Try clearing the filters or adjusting the date range."
        >
          {orders.data ? (
            <MerchantOrderTable orders={orders.data.data} />
          ) : (
            <EmptyState
              title="Order access is not available yet"
              description="Secure merchant authentication and parcel integration must be activated before shipments can load. Filters are ready to use when access is enabled."
            />
          )}
        </MerchantRequestState>
        {orders.data && (
          <MerchantPagination
            page={page}
            size={size}
            total={orders.data.total}
            onPage={(value) => {
              const next = new URLSearchParams(params);
              next.set("page", String(value));
              setParams(next);
            }}
          />
        )}
      </section>
    </>
  );
}
