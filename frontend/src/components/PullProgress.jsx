
import {
  AlertCircle,
  CheckCircle2,
  Database,
  LoaderCircle,
  Clock3,
} from "lucide-react";

function PullProgress({
  pullStatus,
  progress = 0,
  processedRecords = 0,
  totalRecords = 0,
  theme,
}) {
  const isDark = theme === "dark";

  const isRunning =
    pullStatus === "running" || pullStatus === "pending";

  const isCompleted = pullStatus === "completed";
  const isFailed = pullStatus === "failed";

  const safeProgress = Math.min(
    100,
    Math.max(0, Number(progress) || 0)
  );

  const statusConfig = isCompleted
    ? {
        label: "Completed",
        icon: CheckCircle2,
        color: "text-emerald-400",
        background: "bg-emerald-500/10",
      }
    : isFailed
      ? {
          label: "Failed",
          icon: AlertCircle,
          color: "text-red-400",
          background: "bg-red-500/10",
        }
      : isRunning
        ? {
            label: "In Progress",
            icon: LoaderCircle,
            color: "text-blue-400",
            background: "bg-blue-500/10",
          }
        : {
            label: "Waiting",
            icon: Clock3,
            color: "text-slate-400",
            background: "bg-slate-500/10",
          };

  const StatusIcon = statusConfig.icon;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${
        isDark
          ? "border-slate-800 bg-[#101a2c]"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isDark
                ? "bg-blue-500/10 text-blue-400"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Database size={21} />
          </div>

          <div className="min-w-0">
            <h3
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Trade Pull Status
            </h3>

            <p
              className={`mt-1 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {isCompleted
                ? "All trades have been fetched and stored successfully."
                : isFailed
                  ? "The trade synchronization encountered an error."
                  : isRunning
                    ? "Fetching and synchronizing market transactions."
                    : "Waiting for the next trade synchronization."}
            </p>
          </div>
        </div>

        {/* Status */}
        <div
          className={`flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig.background} ${statusConfig.color}`}
        >
          <StatusIcon
            size={15}
            className={isRunning ? "animate-spin" : ""}
          />
          {statusConfig.label}
        </div>
      </div>

      {/* Progress information */}
      <div
        className={`mt-7 rounded-xl border p-4 sm:p-5 ${
          isDark
            ? "border-slate-800 bg-slate-950/50"
            : "border-slate-100 bg-slate-50"
        }`}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Records synchronized
            </p>

            <p
              className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {safeProgress.toFixed(0)}%
            </p>
          </div>

          <div className="text-right">
            <p
              className={`text-xs ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Records processed
            </p>

            <p
              className={`mt-1 text-sm font-semibold tabular-nums ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              {processedRecords.toLocaleString("en-IN")}
              <span className="font-normal text-slate-500">
                {" "} / {totalRecords.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className={`mt-5 h-3 w-full overflow-hidden rounded-full ${
            isDark ? "bg-slate-800" : "bg-slate-200"
          }`}
          role="progressbar"
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Trade synchronization progress"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isFailed
                ? "bg-linear-to-rrom-red-600 to-red-400"
                : isCompleted
                  ? "bg-linear-to-r from-emerald-600 to-teal-400"
                  : "bg-linear-to-r from-blue-600 via-blue-500 to-cyan-400"
            } ${isRunning ? "progress-shimmer" : ""}`}
            style={{ width: `${safeProgress}%` }}
          />
        </div>

        {/* Footer details */}
        <div className="mt-4 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p
            className={`font-medium ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {processedRecords.toLocaleString("en-IN")} of{" "}
            {totalRecords.toLocaleString("en-IN")} trades processed
          </p>

          <p
            className={
              isCompleted
                ? "text-emerald-400"
                : isFailed
                  ? "text-red-400"
                  : isRunning
                    ? "text-blue-400"
                    : isDark
                      ? "text-slate-500"
                      : "text-slate-400"
            }
          >
            {isCompleted
              ? "Synchronization finished"
              : isFailed
                ? "Synchronization stopped"
                : isRunning
                  ? "Synchronization in progress"
                  : "Ready to synchronize"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default PullProgress;
