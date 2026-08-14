import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  BrainCircuit,
  CheckCircle2,
  LockKeyhole,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function Insights() {
  const insightQuery = trpc.recovery.insights.get.useQuery();
  const generateInsight = trpc.recovery.insights.generate.useMutation({
    onSuccess: () => void insightQuery.refetch(),
  });
  if (insightQuery.isLoading)
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-5 py-8">
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="h-72 rounded-3xl bg-slate-100" />
      </div>
    );
  if (insightQuery.isError)
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-7">
        <h1 className="font-semibold text-red-950">
          We couldn’t load your insights.
        </h1>
        <p className="mt-2 text-sm text-red-800">
          Please refresh and try again.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => void insightQuery.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  const data = insightQuery.data;
  if (!data) return null;
  const remaining = Math.max(0, data.requiredCheckins - data.checkinCount);
  const isPro = data.plan === "pro";
  return (
    <section className="mx-auto max-w-4xl py-4 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Private pattern review
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        AI insights
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        RecoveryLog analyzes a minimal, structured summary of your own
        entries—not a conversation transcript or personal account details.
      </p>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {data.insight ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                    Latest pattern
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {data.insight.title}
                  </h2>
                </div>
                <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold capitalize text-teal-800">
                  {data.insight.confidence} confidence
                </div>
              </div>
              <p className="mt-6 text-base leading-7 text-slate-700">
                {data.insight.observation}
              </p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  From your entries
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {data.insight.evidence}
                </p>
              </div>
              {isPro && data.checkinCount >= data.requiredCheckins ? (
                <Button
                  className="mt-7"
                  variant="outline"
                  onClick={() => generateInsight.mutate()}
                  disabled={generateInsight.isPending}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generateInsight.isPending
                    ? "Refreshing insight…"
                    : "Refresh insight"}
                </Button>
              ) : null}
            </>
          ) : (
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                {isPro ? (
                  <BrainCircuit className="mx-auto h-9 w-9 text-blue-700" />
                ) : (
                  <LockKeyhole className="mx-auto h-9 w-9 text-blue-700" />
                )}
                {data.checkinCount < data.requiredCheckins ? (
                  <>
                    <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                      Keep checking in.
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                      Complete {remaining} more{" "}
                      {remaining === 1 ? "check-in" : "check-ins"} and we’ll
                      have enough history to look for meaningful patterns.
                    </p>
                    <div className="mx-auto mt-6 h-2 max-w-xs overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(100, (data.checkinCount / data.requiredCheckins) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      {data.checkinCount} of {data.requiredCheckins} check-ins
                      recorded
                    </p>
                  </>
                ) : !isPro ? (
                  <>
                    <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                      A Pro feature, ready when you are.
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                      Your account has enough check-in history. AI pattern
                      insights will become available after Pro access is
                      activated.
                    </p>
                    <span className="mt-6 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      No payment flow is enabled in this MVP
                    </span>
                  </>
                ) : (
                  <>
                    <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                      Your pattern review is ready.
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                      Generate one concise observation from your actual recovery
                      history.
                    </p>
                    <Button
                      className="mt-6"
                      onClick={() => generateInsight.mutate()}
                      disabled={generateInsight.isPending}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {generateInsight.isPending
                        ? "Generating…"
                        : "Generate insight"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </article>
        <aside className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6 sm:p-7">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
            Designed with limits
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
              The backend detects patterns before the model is called.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
              Only schema-validated, safety-checked text can be shown.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
              Generated insights are cached until your underlying data changes.
            </li>
          </ul>
        </aside>
      </div>
      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
        <p className="text-sm leading-6 text-amber-950">
          Insights are based on your logged patterns and are for informational
          purposes only. They are not medical advice or a diagnosis.
        </p>
      </div>
      {generateInsight.isError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          AI insights are temporarily unavailable. Your check-ins are still
          saved and private.
        </p>
      ) : null}
    </section>
  );
}
