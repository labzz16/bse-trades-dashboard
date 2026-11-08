import { Radio, Wifi, WifiOff } from "lucide-react";

function ConnectionStatus({ isConnected, theme }) {
  const isDark = theme === "dark";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${
        isDark
          ? "border-slate-700 bg-slate-800/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {isConnected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            isConnected ? "bg-emerald-400" : "bg-red-400"
          }`}
        />
      </span>

      <span
        className={`text-xs font-semibold ${
          isDark ? "text-slate-200" : "text-slate-700"
        }`}
      >
        {isConnected ? "Live Connected" : "Disconnected"}
      </span>

      {isConnected ? (
        <Wifi size={14} className="text-emerald-400" />
      ) : (
        <WifiOff size={14} className="text-red-400" />
      )}
    </div>
  );
}

export default ConnectionStatus;