import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck2,
  Download,
  FileText,
  Loader2,
  LockKeyhole,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useState } from "react";

type ExportPayload = { fileName: string; mimeType: string; base64: string };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function downloadExport(payload: ExportPayload) {
  const binary = atob(payload.base64);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const url = URL.createObjectURL(
    new Blob([bytes], { type: payload.mimeType })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function AnalyticsSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-5 py-4 sm:py-8"
      aria-busy="true"
      aria-label="Loading analytics"
    >
      <div className="h-3 w-28 animate-pulse rounded-full bg-blue-100" />
      <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm"
            style={{ animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-[2rem] border border-slate-100 bg-white shadow-sm" />
    </div>
  );
}

function AnalyticsError({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <section className="mx-auto max-w-2xl py-10 sm:py-16">
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-red-700 shadow-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-red-950">
          Analytics are taking a pause.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-800">
          We couldn’t retrieve your private analytics right now. Your saved
          check-ins are not affected.
        </p>
        <Button
          className="mt-7 border-red-200 bg-white text-red-800 hover:bg-red-100"
          variant="outline"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      </div>
    </section>
  );
}

export default function Analytics() {
  const analyticsQuery = trpc.recovery.analytics.get.useQuery(undefined, {
    placeholderData: previous => previous,
  });
  const csvExport = trpc.recovery.exports.chartCsv.useMutation();
  const pdfExport = trpc.recovery.exports.chartPdf.useMutation();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  if (analyticsQuery.isLoading && !analyticsQuery.data)
    return <AnalyticsSkeleton />;
  if (analyticsQuery.isError && !analyticsQuery.data)
    return (
      <AnalyticsError
        onRetry={() => void analyticsQuery.refetch()}
        retrying={analyticsQuery.isFetching}
      />
    );
  const data = analyticsQuery.data;
  if (!data)
    return (
      <AnalyticsError
        onRetry={() => void analyticsQuery.refetch()}
        retrying={analyticsQuery.isFetching}
      />
    );
  const { overview, trend } = data;
  const isRefreshing = analyticsQuery.isFetching;
  const isExporting = csvExport.isPending || pdfExport.isPending;
  const requestExport = (format: "csv" | "pdf") => {
    setDownloadError(null);
    const onSuccess = (payload: ExportPayload) => downloadExport(payload);
    if (format === "csv") csvExport.mutate(undefined, { onSuccess });
    else pdfExport.mutate(undefined, { onSuccess });
  };
  const exportError =
    downloadError ?? csvExport.error?.message ?? pdfExport.error?.message;
  const cards = [
    {
      label: "Average",
      value: overview.average ?? "—",
      icon: BarChart3,
      caption: "Last 30 local days",
    },
    {
      label: "Best",
      value: overview.highest ?? "—",
      icon: Trophy,
      caption: "Your highest logged score",
    },
    {
      label: "Lowest",
      value: overview.lowest ?? "—",
      icon: TrendingDown,
      caption: "Your lowest logged score",
    },
    {
      label: "Check-ins",
      value: overview.checkins,
      icon: CalendarCheck2,
      caption: "Actual entries this period",
    },
    {
      label: "Streak",
      value: `${overview.streak} day${overview.streak === 1 ? "" : "s"}`,
      icon: TrendingUp,
      caption: "Consecutive logged dates",
    },
  ];
  const chartData = trend.map(entry => ({
    ...entry,
    label: dateLabel(entry.date),
  }));
  return (
    <section className="mx-auto max-w-6xl py-4 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Your patterns
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            30-day overview
          </h1>
        </div>
        {isRefreshing ? (
          <p
            role="status"
            className="mt-1 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating
          </p>
        ) : null}
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        A private summary of the entries you logged during the last 30 local
        days. Missing days remain missing.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(card => (
          <article
            key={card.label}
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-opacity duration-200 ${isRefreshing ? "opacity-70" : "opacity-100"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <card.icon className="h-4 w-4 text-blue-700" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {card.value}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              {card.caption}
            </p>
          </article>
        ))}
      </div>
      <article
        className={`mt-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-opacity duration-200 sm:p-8 ${isRefreshing ? "opacity-70" : "opacity-100"}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Recovery indicator trend
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Scores from your actual check-ins over this 30-day window.
            </p>
          </div>
          {data.plan === "pro" ? (
            <div
              className="flex flex-wrap items-center gap-2"
              aria-label="Export chart data"
            >
              <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Download className="h-3.5 w-3.5" />
                Export
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => requestExport("csv")}
                disabled={isExporting}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {csvExport.isPending ? "Preparing…" : "CSV"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => requestExport("pdf")}
                disabled={isExporting}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {pdfExport.isPending ? "Preparing…" : "PDF"}
              </Button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
              <LockKeyhole className="h-3.5 w-3.5" />
              Pro export: CSV and PDF
            </div>
          )}
        </div>
        {overview.previousPeriodDifference === null ? (
          <p className="mt-4 text-sm font-medium text-slate-600">
            No prior-period comparison yet
          </p>
        ) : (
          <p className="mt-4 text-sm font-medium text-slate-600">
            {overview.previousPeriodDifference >= 0 ? "+" : ""}
            {overview.previousPeriodDifference} vs. previous period
          </p>
        )}
        {trend.length >= 2 ? (
          <div
            className="mt-7 h-72"
            role="img"
            aria-label="Thirty-day recovery score trend"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="analytics-score-fill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop
                      offset="100%"
                      stopColor="#0d9488"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
                  }}
                  formatter={(value: number) => [
                    `${value}/100`,
                    "Recovery score",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#0d9488"
                  strokeWidth={3}
                  fill="url(#analytics-score-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-7 grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <div>
              <BarChart3 className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-3 font-medium text-slate-800">
                Complete more check-ins to build your longer-term trend.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Analytics will appear only when your own entries support them.
              </p>
            </div>
          </div>
        )}
        {exportError ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            We couldn’t prepare that export. Your data is unchanged; please try
            again.
          </p>
        ) : null}
      </article>
      {analyticsQuery.isError ? (
        <p
          role="alert"
          className="mt-4 inline-flex items-center gap-2 text-xs text-amber-800"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          We couldn’t refresh the latest analytics; showing the last available
          result.
        </p>
      ) : null}
    </section>
  );
}
