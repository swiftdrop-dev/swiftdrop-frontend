import type { ReactNode } from "react";
import { EmptyState } from "../../../components/shared/SharedComponents";
export function MerchantRequestState({
  loading,
  error,
  empty,
  children,
  emptyTitle = "No records found",
  emptyDescription = "Try different filters or return when your integration is available.",
  emptyAction,
}: {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  children?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}) {
  if (loading)
    return (
      <div className="merchant-loading" role="status">
        Loading merchant information…
      </div>
    );
  if (error)
    return (
      <div className="merchant-error" role="alert">
        {error.message}
      </div>
    );
  if (empty)
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  return <>{children}</>;
}
