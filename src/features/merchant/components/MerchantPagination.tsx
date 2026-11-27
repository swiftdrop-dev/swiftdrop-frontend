export function MerchantPagination({
  page,
  size,
  total,
  onPage,
}: {
  page: number;
  size: number;
  total: number;
  onPage: (value: number) => void;
}) {
  return (
    <nav className="merchant-pagination" aria-label="Pagination">
      <button
        className="btn btn-secondary"
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span aria-live="polite">
        {total === 0
          ? "No records"
          : `${page * size + 1}–${Math.min((page + 1) * size, total)} of ${total} records`}{" "}
        · Page {page + 1}
      </span>
      <button
        className="btn btn-secondary"
        disabled={(page + 1) * size >= total}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
