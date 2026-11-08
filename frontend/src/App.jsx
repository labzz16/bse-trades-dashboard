
import { useEffect, useRef, useState } from "react";

import Header from "./components/Header";
import ConnectionStatus from "./components/ConnectionStatus";
import StatsCards from "./components/StatsCards";
import PullProgress from "./components/PullProgress";
import TradesTable from "./components/TradesTable";

import {
  getTrades,
  getTradeStats,
  startPull,
  getLatestPull,
} from "./services/api";

import { connectWebSocket } from "./services/websocket";

import {
  Activity,
  BarChart3,
  Database,
  TrendingUp,
} from "lucide-react";

const PAGE_SIZE = 10;

const emptyStats = {
  totalTrades: 0,
  totalQuantity: 0,
  averagePrice: 0,
  totalValue: 0,
  symbolCount: 0,
};

function mergeTrades(existing, incoming) {
  const tradeMap = new Map();

  [...incoming, ...existing].forEach((trade) => {
    tradeMap.set(trade.tradeId, trade);
  });

  return Array.from(tradeMap.values())
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )
    .slice(0, PAGE_SIZE);
}

function App() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(emptyStats);

  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isConnected, setIsConnected] = useState(false);

  const [pullStatus, setPullStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processedRecords, setProcessedRecords] = useState(0);
  const [totalPullRecords, setTotalPullRecords] = useState(0);

  const [error, setError] = useState("");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("dashboard-theme") || "dark";
  });

  const initialLoadComplete = useRef(false);
  const pendingTrades = useRef([]);
  const pageRef = useRef(1);

  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("dashboard-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((previous) =>
      previous === "light" ? "dark" : "light"
    );
  };

  const loadTrades = async (selectedPage = 1) => {
    try {
      setLoading(true);

      const data = await getTrades(selectedPage, PAGE_SIZE);

      setTrades(data.trades);
      setTotalRecords(data.totalRecords);
      setError("");
    } catch (err) {
      setError("Unable to load trades. Please check the backend.");
      console.error("Trade loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getTradeStats();
      setStats(data.stats);
    } catch (err) {
      console.error("Statistics loading failed:", err);
    }
  };

  useEffect(() => {
    const socket = connectWebSocket((data) => {
      if (data.type === "NEW_TRADES") {
        if (!initialLoadComplete.current) {
          pendingTrades.current.push(...data.trades);
        } else if (pageRef.current === 1) {
          setTrades((previous) =>
            mergeTrades(previous, data.trades)
          );
        }
      }

      if (data.type === "PULL_STARTED") {
        setPullStatus("running");
        setProgress(0);
        setProcessedRecords(0);
        setTotalPullRecords(data.totalRecords);
      }

      if (data.type === "PULL_PROGRESS") {
        setPullStatus("running");
        setProgress(data.progress);
        setProcessedRecords(data.processedRecords);
        setTotalPullRecords(data.totalRecords);
      }

      if (data.type === "PULL_COMPLETED") {
        setPullStatus("completed");
        setProgress(100);
        setProcessedRecords(data.processedRecords);
        setTotalPullRecords(data.totalRecords);

        loadStats();
        loadTrades(pageRef.current);
      }

      if (data.type === "PULL_FAILED") {
        setPullStatus("failed");
        setError(`Trade pull failed: ${data.error}`);
      }
    }, setIsConnected);

    const initializeDashboard = async () => {
      try {
        const [latestPull] = await Promise.all([
          getLatestPull(),
          loadTrades(1),
          loadStats(),
        ]);

        if (latestPull.job) {
          const job = latestPull.job;

          setPullStatus(job.status);
          setProgress(latestPull.progress);
          setProcessedRecords(job.processedRecords);
          setTotalPullRecords(job.totalRecords);
        }

        initialLoadComplete.current = true;

        if (pendingTrades.current.length > 0) {
          setTrades((previous) =>
            mergeTrades(previous, pendingTrades.current)
          );

          pendingTrades.current = [];
        }
      } catch (err) {
        console.error("Dashboard initialization failed:", err);
        initialLoadComplete.current = true;
      }
    };

    initializeDashboard();

    return () => {
      socket.close();
    };
  }, []);

  const handleStartPull = async () => {
    try {
      setError("");

      const data = await startPull();

      setPullStatus(data.status);
      setProgress(0);
      setProcessedRecords(0);
      setTotalPullRecords(0);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to start the trade pull.";

      setError(message);
      console.error("Starting trade pull failed:", err);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > Math.max(totalPages, 1)) {
      return;
    }

    pageRef.current = newPage;
    setPage(newPage);

    await loadTrades(newPage);
  };

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#080f1e] text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Header
        onStartPull={handleStartPull}
        isPulling={
          pullStatus === "pending" || pullStatus === "running"
        }
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <main className="mx-auto w-full max-w-360 space-y-9 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">

        {/* Dashboard overview */}
        <section
          className={`animate-dashboard rounded-2xl border p-5 sm:p-7 ${
            isDark
              ? "border-slate-800 bg-[#101a2c]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div
                className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                <Activity size={15} />
                Market Operations
              </div>

              <h2
                className={`text-2xl font-bold tracking-tight sm:text-3xl ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Trading Overview
              </h2>

              <p
                className={`mt-2 max-w-2xl text-sm leading-6 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Monitor trade activity, track data synchronization,
                and view market transactions in real time.
              </p>
            </div>

            <div className="shrink-0">
              <ConnectionStatus
                isConnected={isConnected}
                theme={theme}
              />
            </div>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className={`rounded-xl border px-5 py-4 text-sm ${
              isDark
                ? "border-red-900/70 bg-red-950/50 text-red-300"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Market summary */}
        <section className="animate-dashboard-delayed space-y-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDark
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <BarChart3 size={20} />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Market Summary
              </h3>

              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Overview of stored trade activity
              </p>
            </div>
          </div>

          <StatsCards stats={stats} theme={theme} />
        </section>

        {/* Data synchronization */}
        <section className="animate-dashboard-delayed space-y-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDark
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "bg-cyan-50 text-cyan-600"
              }`}
            >
              <Database size={20} />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Data Synchronization
              </h3>

              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Monitor the progress of BSE trade imports
              </p>
            </div>
          </div>

          <PullProgress
            pullStatus={pullStatus}
            progress={progress}
            processedRecords={processedRecords}
            totalRecords={totalPullRecords}
            theme={theme}
          />
        </section>

        {/* Transactions */}
        <section className="animate-dashboard-late space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={19}
                  className={isDark ? "text-blue-400" : "text-blue-600"}
                />

                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Trade Transactions
                </h3>
              </div>

              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Latest transactions received from the BSE API
              </p>
            </div>

            <p
              className={`text-xs ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {totalRecords.toLocaleString("en-IN")} records available
            </p>
          </div>

          <TradesTable
            trades={trades}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
            theme={theme}
          />
        </section>

        {/* Footer */}
        <footer
          className={`flex flex-col gap-2 border-t py-6 text-xs sm:flex-row sm:items-center sm:justify-between ${
            isDark
              ? "border-slate-800 text-slate-500"
              : "border-slate-200 text-slate-400"
          }`}
        >
          <span>
            BSE Trades Dashboard · Real-time data synchronization
          </span>

          <span>
            Powered by React, Node.js, MongoDB and WebSockets
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
