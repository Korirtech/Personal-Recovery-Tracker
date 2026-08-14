import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BatteryMedium,
  Brain,
  CheckCircle2,
  ClipboardPlus,
  MoonStar,
  TrendingUp,
  Waves,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "wouter";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
    new Date(`${value}T12:00:00`)
  );
}

const metricConfig = [
  {
    key: "sleep",
    label: "Sleep",
    icon: MoonStar,
    description: "Sleep quality",
  },
  {
    key: "energy",
    label: "Energy",
    icon: BatteryMedium,
    description: "Energy level",
  },
  {
    key: "stress",
    label: "Stress",
    icon: Brain,
    description: "Lower stress supports the score",
  },
  {
    key: "soreness",
    label: "Soreness",
    icon: Waves,
    description: "Lower soreness supports the score",
  },
] as const;

export default function Dashboard() {
  const dashboardQuery = trpc.recovery.dashboard.get.useQuery();
  const profileQuery = trpc.recovery.profile.get.useQuery();
  const dashboard = dashboardQuery.data;
  const name =
    profileQuery.data?.profile?.displayName ||
    profileQuery.data?.accountName?.split(" ")[0] ||
    "there";

  if (dashboardQuery.isLoading || profileQuery.isLoading)
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-5 py-8">
        <div className="h-8 w-56 rounded bg-slate-200" />
        <div className="h-72 rounded-3xl bg-slate-100" />
        <div className="h-48 rounded-3xl bg-slate-100" />
      </div>
    );
  if (dashboardQuery.isError || profileQuery.isError)
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-7">
        <h1 className="font-semibold text-red-950">
          We couldn’t load your dashboard.
        </h1>
        <p className="mt-2 text-sm text-red-800">
          Please refresh and try again. Your saved check-ins are not affected.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => {
            void dashboardQuery.refetch();
            void profileQuery.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );

  if (!dashboard?.today) {
    return (
      <section className="mx-auto max-w-4xl py-4 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Good morning, {name}
        </p>
        <div className="mt-5 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-7 shadow-sm sm:p-10">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
            <ClipboardPlus className="h-6 w-6" />
          </div>
          <h1 className="mt-7 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Start with a one-minute check-in.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
            Log how you feel this morning to see your personal recovery
            indicator and begin building your private trend.
          </p>
          <Link href="/check-in">
            <Button className="mt-8">
              Complete today’s check-in <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  const { today, trend, suggestion } = dashboard;
  const hasTrend = trend.length >= 2;
  const chartData = trend.map(point => ({
    ...point,
    label: dateLabel(point.date),
  }));

  return (
    <section className="mx-auto max-w-5xl py-4 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Good morning, {name}
      </p>
      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Your recovery, in context.
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {dashboard.localDate} · {dashboard.timezone}
          </p>
        </div>
        <Link href="/check-in">
          <Button variant="outline">Edit today’s check-in</Button>
        </Link>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Personal recovery indicator
              </p>
              <p className="mt-3 text-7xl font-semibold tracking-[-0.07em] text-slate-950">
                {today.score}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                {today.category}
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-7 border-t border-slate-100 pt-5">
            <p className="text-sm leading-6 text-slate-600">{suggestion}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Your indicator reflects only the responses you logged. It is not a
              medical measurement, diagnosis, or treatment recommendation.
            </p>
          </div>
        </article>
        <article className="rounded-[2rem] border border-teal-100 bg-teal-50 p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-teal-700 shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-950">
                Today’s score context
              </p>
              <p className="mt-0.5 text-xs text-teal-800">
                Each item is shown on a 10-point personal scale.
              </p>
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {metricConfig.map(metric => {
              const Icon = metric.icon;
              const value = today.metrics[metric.key];
              return (
                <div key={metric.key} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Icon className="h-4 w-4 text-teal-700" />
                      {metric.label}
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-slate-950">
                      {value}/10
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {metric.description}
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </div>
      <article className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Seven-day trend
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Your personal recovery indicator across the last seven local days.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {trend.length} logged {trend.length === 1 ? "day" : "days"}
          </span>
        </div>
        {hasTrend ? (
          <div
            className="mt-7 h-64"
            role="img"
            aria-label="Seven-day recovery score trend"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="recovery-score-fill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
                    <stop
                      offset="100%"
                      stopColor="#2563EB"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
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
                  labelStyle={{ color: "#475569" }}
                  formatter={(value: number) => [
                    `${value}/100`,
                    "Recovery score",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fill="url(#recovery-score-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-7 grid min-h-50 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <div>
              <TrendingUp className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-3 font-medium text-slate-800">
                Complete more check-ins to build your recovery trend.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                We’ll show only your actual logged days—never invented values.
              </p>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
