
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Radio,
} from "lucide-react";

function TradesTable({
  trades,
  page,
  totalPages,
  onPageChange,
  loading,
  theme,
}) {
  const isDark = theme === "dark";

  const panelClass = isDark
    ? "border-slate-800 bg-[#101a2c]"
    : "border-slate-200 bg-white";

  const headingClass = isDark ? "text-white" : "text-slate-900";
  const mutedClass = isDark ? "text-slate-400" : "text-slate-500";

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border ${panelClass}`}
    >
      {/* Table heading */}
      <div
        className={`flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-base font-semibold ${headingClass}`}>
              Recent Trades
            </h3>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isDark
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <Radio size={12} />
              Live Data
            </span>
          </div>

          <p className={`mt-1.5 text-sm ${mutedClass}`}>
            Latest transactions received from the BSE API
          </p>
        </div>

        <div
          className={`flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
            isDark
              ? "border-slate-700 bg-slate-900 text-slate-300"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <Clock3 size={14} />
          Page {page} of {Math.max(totalPages, 1)}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-212.5 border-collapse text-left">
          <thead>
            <tr
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isDark
                  ? "bg-slate-900/80 text-slate-400"
                  : "bg-slate-50 text-slate-500"
              }`}
            >
              <th className="px-5 py-4">Trade ID</th>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Symbol</th>
              <th className="px-5 py-4 text-right">Quantity</th>
              <th className="px-5 py-4 text-right">Price</th>
              <th className="px-5 py-4">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <LoaderCircle
                      size={25}
                      className="animate-spin text-blue-500"
                    />
                    <span className={`text-sm ${mutedClass}`}>
                      Loading trade transactions...
                    </span>
                  </div>
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowUpRight
                      size={25}
                      className={mutedClass}
                    />
                    <p className={`text-sm font-medium ${headingClass}`}>
                      No trades available
                    </p>
                    <p className={`text-xs ${mutedClass}`}>
                      Start a trade pull to fetch market transactions.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              trades.map((trade, index) => (
                <tr
                  key={trade.tradeId || `${trade.symbol}-${index}`}
                  className={`border-t transition-colors ${
                    isDark
                      ? "border-slate-800/80 hover:bg-slate-800/50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <td
                    className={`whitespace-nowrap px-5 py-4 text-sm font-medium ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    {trade.tradeId}
                  </td>

                  <td
                    className={`whitespace-nowrap px-5 py-4 text-sm ${mutedClass}`}
                  >
                    {trade.client}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {trade.symbol}
                    </span>
                  </td>

                  <td
                    className={`whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {formatNumber(trade.quantity)}
                  </td>

                  <td
                    className={`whitespace-nowrap px-5 py-4 text-right text-sm font-semibold tabular-nums ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {formatPrice(trade.price)}
                  </td>

                  <td
                    className={`whitespace-nowrap px-5 py-4 text-xs tabular-nums ${mutedClass}`}
                  >
                    {formatDate(trade.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <p className={`text-xs ${mutedClass}`}>
          Showing{" "}
          <span className={`font-semibold ${headingClass}`}>
            {trades.length}
          </span>{" "}
          transactions on this page
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious || loading}
            className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isDark
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <span
            className={`min-w-16 text-center text-xs font-semibold tabular-nums ${headingClass}`}
          >
            {page} / {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext || loading}
            className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isDark
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default TradesTable;
