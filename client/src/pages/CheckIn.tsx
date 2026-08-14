import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MoonStar,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import type { Mood } from "../../../shared/recovery";

type CheckinForm = {
  sleepQuality?: number;
  energy?: number;
  stress?: number;
  soreness?: number;
  mood?: Mood;
  sleepDurationHours?: number;
};

const steps = [
  {
    id: "sleepQuality",
    title: "How did you sleep?",
    helper: "Think about the overall quality of your rest.",
    labels: ["Very poor", "Poor", "Okay", "Good", "Excellent"],
  },
  {
    id: "energy",
    title: "How is your energy?",
    helper: "Choose the level that best reflects how you feel right now.",
    labels: ["Very low", "Low", "Moderate", "Good", "Excellent"],
  },
  {
    id: "stress",
    title: "How stressed do you feel?",
    helper:
      "There is no right answer—this helps surface your personal patterns.",
    labels: ["Very low", "Low", "Moderate", "High", "Very high"],
  },
  {
    id: "soreness",
    title: "How sore does your body feel?",
    helper: "Consider general physical soreness, not a medical assessment.",
    labels: ["None", "Mild", "Moderate", "High", "Very high"],
  },
] as const;

const moods: Array<{ value: Mood; label: string; hint: string }> = [
  { value: "good", label: "Good", hint: "Feeling positive" },
  { value: "okay", label: "Okay", hint: "Feeling steady" },
  { value: "low", label: "Low", hint: "Not at my best" },
];

function NumericStep({
  title,
  helper,
  labels,
  value,
  onChange,
}: {
  title: string;
  helper: string;
  labels: readonly string[];
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <section aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Morning check-in
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">{helper}</p>
      <div className="mt-9 grid gap-3" role="radiogroup" aria-label={title}>
        {labels.map((label, index) => {
          const option = index + 1;
          const selected = value === option;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={`group flex min-h-16 w-full items-center rounded-2xl border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"}`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"}`}
              >
                {option}
              </span>
              <span className="ml-4 text-base font-medium text-slate-900">
                {label}
              </span>
              {selected ? (
                <Check
                  className="ml-auto h-5 w-5 text-blue-700"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function CheckIn() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [editingExisting, setEditingExisting] = useState(false);
  const todayQuery = trpc.recovery.checkins.getToday.useQuery();
  const saveCheckin = trpc.recovery.checkins.saveToday.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      void todayQuery.refetch();
    },
  });
  const form = useForm<CheckinForm>({ mode: "onChange" });

  useEffect(() => {
    const entry = todayQuery.data?.checkin;
    if (!entry) return;
    form.reset({
      sleepQuality: entry.sleepQuality,
      energy: entry.energy,
      stress: entry.stress,
      soreness: entry.soreness,
      mood: entry.mood,
      sleepDurationHours:
        entry.sleepDurationHours === null
          ? undefined
          : Number(entry.sleepDurationHours),
    });
  }, [form, todayQuery.data?.checkin]);

  const values = form.watch();
  const activeStep = step < steps.length ? steps[step] : null;
  const totalSteps = 6;
  const progressValue = ((step + 1) / totalSteps) * 100;
  const existing = Boolean(todayQuery.data?.checkin);

  const canMoveForward = () => {
    if (activeStep) return Boolean(values[activeStep.id]);
    if (step === 4) return Boolean(values.mood);
    return true;
  };

  const submit = () => {
    const data = form.getValues();
    if (
      !data.sleepQuality ||
      !data.energy ||
      !data.stress ||
      !data.soreness ||
      !data.mood
    )
      return;
    saveCheckin.mutate({
      sleepQuality: data.sleepQuality,
      energy: data.energy,
      stress: data.stress,
      soreness: data.soreness,
      mood: data.mood,
      sleepDurationHours: data.sleepDurationHours,
    });
  };

  if (todayQuery.isLoading) {
    return (
      <div className="mx-auto max-w-xl animate-pulse space-y-5 py-8">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-10 w-80 rounded bg-slate-200" />
        <div className="h-64 rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (todayQuery.isError) {
    return (
      <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-red-200 bg-red-50 p-7">
        <h1 className="text-lg font-semibold text-red-950">
          We couldn’t load today’s check-in.
        </h1>
        <p className="mt-2 text-sm text-red-800">
          Please refresh and try again. Your saved entries are not affected.
        </p>
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => void todayQuery.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (existing && !editingExisting && !submitted) {
    return (
      <section className="mx-auto max-w-xl py-6 sm:py-12">
        <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white">
            <Check className="h-7 w-7" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Today is already logged
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            You’ve already completed today’s check-in.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
            You can review your personal recovery indicator or update the
            responses you saved for this local day.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => setLocation("/dashboard")}>
              View today’s results
            </Button>
            <Button variant="outline" onClick={() => setEditingExisting(true)}>
              Edit today’s check-in
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (submitted) {
    const score = saveCheckin.data?.score;
    return (
      <section className="mx-auto max-w-xl py-6 sm:py-12">
        <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-600 text-white">
            <Check className="h-7 w-7" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Check-in saved
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            A clearer picture of today.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Your personal recovery indicator is ready. It reflects only the
            information you logged today.
          </p>
          {score ? (
            <div className="mx-auto mt-7 w-fit rounded-2xl border border-emerald-100 bg-white px-6 py-4">
              <span className="block text-4xl font-semibold tracking-tight text-slate-950">
                {score.score}
              </span>
              <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {score.category}
              </span>
            </div>
          ) : null}
          <Button className="mt-8" onClick={() => setLocation("/dashboard")}>
            View dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl py-1 sm:py-6">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Today’s check-in
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {todayQuery.data?.localDate} · {todayQuery.data?.timezone}
          </p>
        </div>
        {existing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
            <PencilLine className="h-3.5 w-3.5" /> Editing saved entry
          </span>
        ) : null}
      </div>
      <Progress
        value={progressValue}
        aria-label={`Step ${step + 1} of ${totalSteps}`}
        className="h-2 bg-slate-100"
      />
      <p className="mt-3 text-right text-xs font-medium text-slate-500">
        Step {step + 1} of {totalSteps}
      </p>
      <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {activeStep ? (
          <NumericStep
            {...activeStep}
            value={values[activeStep.id]}
            onChange={value =>
              form.setValue(activeStep.id, value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        ) : null}
        {step === 4 ? (
          <section aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Morning check-in
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              How do you feel today?
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              A simple mood check can help you spot changes over time.
            </p>
            <div
              className="mt-9 grid gap-3"
              role="radiogroup"
              aria-label="Mood"
            >
              {moods.map(mood => {
                const selected = values.mood === mood.value;
                return (
                  <button
                    key={mood.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() =>
                      form.setValue("mood", mood.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`flex min-h-20 items-center rounded-2xl border px-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${selected ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}
                  >
                    <span>
                      <span className="block font-medium text-slate-900">
                        {mood.label}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {mood.hint}
                      </span>
                    </span>
                    {selected ? (
                      <Check className="ml-auto h-5 w-5 text-blue-700" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
        {step === 5 ? (
          <section aria-live="polite">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <MoonStar className="h-6 w-6" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Optional detail
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              How long did you sleep?
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              If you know it, adding sleep duration can make future pattern
              insights more useful.
            </p>
            <div className="mt-9 max-w-xs">
              <Label htmlFor="sleepDuration">Hours slept</Label>
              <Input
                id="sleepDuration"
                min="0"
                max="24"
                step="0.25"
                type="number"
                inputMode="decimal"
                placeholder="e.g. 7.5"
                className="mt-2 h-12 rounded-xl"
                {...form.register("sleepDurationHours", {
                  valueAsNumber: true,
                  min: 0,
                  max: 24,
                })}
              />
              <p className="mt-2 text-xs text-slate-500">
                Leave blank to skip. Values must be between 0 and 24.
              </p>
            </div>
          </section>
        ) : null}
      </div>
      {saveCheckin.isError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          We couldn’t save your check-in. Your answers are still here—please try
          again.
        </p>
      ) : null}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep(current => Math.max(0, current - 1))}
          disabled={step === 0 || saveCheckin.isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step < totalSteps - 1 ? (
          <Button
            type="button"
            onClick={() =>
              setStep(current => Math.min(totalSteps - 1, current + 1))
            }
            disabled={!canMoveForward() || saveCheckin.isPending}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={saveCheckin.isPending}
          >
            <Sparkles className="mr-2 h-4 w-4" />{" "}
            {saveCheckin.isPending
              ? "Saving check-in…"
              : existing
                ? "Update check-in"
                : "Save check-in"}
          </Button>
        )}
      </div>
    </section>
  );
}
