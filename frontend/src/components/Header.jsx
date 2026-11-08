import {
  Activity,
  Moon,
  RefreshCw,
  Sun,
  TrendingUp,
} from "lucide-react";

function Header({ onStartPull, isPulling, theme, onThemeToggle }) {
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? "border-slate-800 bg-[#080f1e]/95"
          : "border-slate-200 bg-white/95"
      }`}
    >
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
            <TrendingUp size={23} />
          </div>

          <div className="min-w-0">
            <h1
              className={`truncate text-lg font-bold tracking-tight sm:text-xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              BSE Trades Dashboard
            </h1>

            <p
              className={`mt-0.5 text-xs sm:text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Real-time trade monitoring platform
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full items-center gap-2 md:w-auto">
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              isDark
                ? "border-slate-700 bg-slate-900 text-yellow-400 hover:bg-slate-800"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            onClick={onStartPull}
            disabled={isPulling}
            className="flex min-h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:flex-none"
          >
            {isPulling ? (
              <Activity size={17} className="shrink-0 animate-pulse" />
            ) : (
              <RefreshCw size={17} className="shrink-0" />
            )}

            <span className="truncate">
              {isPulling ? "Pull in Progress..." : "Start Trade Pull"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
