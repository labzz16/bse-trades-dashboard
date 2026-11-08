
import {
  Activity,
  BarChart3,
  IndianRupee,
  Layers3,
} from "lucide-react";

function StatsCards({ stats, theme }) {
  const isDark = theme === "dark";

  const cards = [
    {
      title: "Total Trades",
      value: stats.totalTrades.toLocaleString("en-IN"),
      description: "Stored transactions",
      icon: Activity,
      iconColor: "text-blue-400",
      iconBackground: isDark
        ? "bg-blue-500/10"
        : "bg-blue-50",
      accent: "from-blue-500 to-cyan-400",
    },
    {
      title: "Total Quantity",
      value: stats.totalQuantity.toLocaleString("en-IN"),
      description: "Shares traded",
      icon: Layers3,
      iconColor: "text-purple-400",
      iconBackground: isDark
        ? "bg-purple-500/10"
        : "bg-purple-50",
      accent: "from-purple-500 to-fuchsia-400",
    },
    {
      title: "Average Price",
      value: `₹${stats.averagePrice.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      description: "Average trade value",
      icon: IndianRupee,
      iconColor: "text-emerald-400",
      iconBackground: isDark
        ? "bg-emerald-500/10"
        : "bg-emerald-50",
      accent: "from-emerald-500 to-teal-400",
    },
    {
      title: "Unique Symbols",
      value: stats.symbolCount.toLocaleString("en-IN"),
      description: "Distinct instruments",
      icon: BarChart3,
      iconColor: "text-orange-400",
      iconBackground: isDark
        ? "bg-orange-500/10"
        : "bg-orange-50",
      accent: "from-orange-500 to-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className={`group relative min-w-0 overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 ${
              isDark
                ? "border-slate-800 bg-[#101a2c] hover:border-slate-700"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {card.title}
                </p>

                <p
                  title={card.value}
                  className={`mt-3 wrap-break-word text-2xl font-bold tracking-tight sm:text-3xl ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {card.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBackground}`}
              >
                <Icon size={21} className={card.iconColor} />
              </div>
            </div>

            <p
              className={`mt-3 text-xs ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {card.description}
            </p>

            <div
              className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-linear-to-r ${card.accent} opacity-70`}
            />
          </article>
        );
      })}
    </div>
  );
}

export default StatsCards;
