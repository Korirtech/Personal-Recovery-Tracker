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
  BarChart3,
  CalendarCheck2,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export default function Analytics() {
  const analyticsQuery = trpc.recovery.analytics.get.useQuery();
  if (analyticsQuery.isLoading)
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-5 py-8">
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="h-40 rounded-3xl bg-slate-100" />
        <div className="h-72 rounded-3xl bg-slate-100" />
      </div>
    );
  if (analyticsQuery.isError)
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-7">
        <h1 className="font-semibold text-red-950">
          We couldn’t load your analytics.
        </h1>
        <p className="mt-2 text-sm text-red-800">
          Please refresh and try again.
        </p>
      </div>
    );
  const data = analyticsQuery.data;
  if (!data) return null;
  const { overview, trend } = data;
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Your patterns
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        30-day overview
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        A private summary of the entries you logged during the last 30 local
        days. Missing days remain missing.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(card => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
      <article className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Recovery indicator trend
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Scores from your actual check-ins over this 30-day window.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-600">
            {overview.previousPeriodDifference === null
              ? "No prior-period comparison yet"
              : `${overview.previousPeriodDifference >= 0 ? "+" : ""}${overview.previousPeriodDifference} vs. previous period`}
          </p>
        </div>
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
      </article>
    </section>
  );
}
