import { Navigate, useLocation } from "react-router-dom";
export default function MerchantParcels() {
  const { search } = useLocation();
  return <Navigate to={`/merchant/orders${search}`} replace />;
}
