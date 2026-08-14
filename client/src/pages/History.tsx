import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  CalendarDays,
  ChevronRight,
  PencilLine,
  Save,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Mood } from "../../../shared/recovery";

type EntryForm = {
  sleepQuality: number;
  energy: number;
  stress: number;
  soreness: number;
  mood: Mood;
  sleepDurationHours?: number;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

function dateFromDatabase(value: Date) {
  return new Date(`${value.toISOString().slice(0, 10)}T12:00:00`);
}

export default function History() {
  const historyQuery = trpc.recovery.history.list.useQuery();
  const updateEntry = trpc.recovery.history.update.useMutation({
    onSuccess: () => void historyQuery.refetch(),
  });
  const deleteEntry = trpc.recovery.history.delete.useMutation({
    onSuccess: () => void historyQuery.refetch(),
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const form = useForm<EntryForm>();
  const entries = historyQuery.data ?? [];
  const selected =
    entries.find(entry => entry.id === selectedId) ?? entries[0] ?? null;
  const calendarDates = useMemo(
    () => entries.map(entry => dateFromDatabase(entry.localDate)),
    [entries]
  );

  const selectEntry = (entryId: number) => {
    const entry = entries.find(candidate => candidate.id === entryId);
    if (!entry) return;
    setSelectedId(entryId);
    setEditing(false);
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
  };

  const startEditing = () => {
    if (!selected) return;
    selectEntry(selected.id);
    setEditing(true);
  };

  const save = form.handleSubmit(values => {
    if (!selected) return;
    updateEntry.mutate(
      {
        id: selected.id,
        sleepQuality: Number(values.sleepQuality),
        energy: Number(values.energy),
        stress: Number(values.stress),
        soreness: Number(values.soreness),
        mood: values.mood,
        sleepDurationHours: Number.isFinite(values.sleepDurationHours)
          ? values.sleepDurationHours
          : undefined,
      },
      { onSuccess: () => setEditing(false) }
    );
  });

  const remove = () => {
    if (
      !selected ||
      !window.confirm("Delete this check-in? This cannot be undone.")
    )
      return;
    deleteEntry.mutate(
      { id: selected.id },
      {
        onSuccess: () => {
          setSelectedId(null);
          setEditing(false);
        },
      }
    );
  };

  if (historyQuery.isLoading)
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-5 py-8">
        <div className="h-8 w-36 rounded bg-slate-200" />
        <div className="h-96 rounded-3xl bg-slate-100" />
      </div>
    );
  if (historyQuery.isError)
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-7">
        <h1 className="font-semibold text-red-950">
          We couldn’t load your history.
        </h1>
        <p className="mt-2 text-sm text-red-800">
          Please refresh and try again.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => void historyQuery.refetch()}
        >
          Try again
        </Button>
      </div>
    );

  return (
    <section className="mx-auto max-w-6xl py-4 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Your record
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        Check-in history
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Review only the days you logged. Select a recorded date to see the
        details or make a correction.
      </p>
      {entries.length === 0 ? (
        <div className="mt-8 grid min-h-80 place-items-center rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center">
          <div>
            <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">
              Your recovery history will appear here once you start checking in.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              RecoveryLog never invents entries or fills missing dates.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-sm font-semibold text-slate-950">
              Recorded days
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Blue dates have a check-in.
            </p>
            <Calendar
              mode="single"
              selected={
                selected ? dateFromDatabase(selected.localDate) : undefined
              }
              onSelect={day => {
                if (!day) return;
                const entry = entries.find(
                  candidate =>
                    dateFromDatabase(candidate.localDate).toDateString() ===
                    day.toDateString()
                );
                if (entry) selectEntry(entry.id);
              }}
              modifiers={{ logged: calendarDates }}
              modifiersClassNames={{
                logged:
                  "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100",
              }}
              className="mt-5 rounded-2xl border border-slate-100 p-3"
            />
            <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                All logged entries
              </p>
              {entries.map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectEntry(entry.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${selected?.id === entry.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {entry.recoveryScore}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900">
                      {new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(entry.localDate)}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Recovery indicator
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {selected ? (
              <>
                {editing ? (
                  <form onSubmit={save}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          Editing entry
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                          {formatDate(selected.localDate)}
                        </h2>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          "sleepQuality",
                          "energy",
                          "stress",
                          "soreness",
                        ] as const
                      ).map(field => (
                        <div key={field}>
                          <Label htmlFor={field} className="capitalize">
                            {field === "sleepQuality" ? "Sleep quality" : field}
                          </Label>
                          <select
                            id={field}
                            className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                            {...form.register(field, { valueAsNumber: true })}
                          >
                            {[1, 2, 3, 4, 5].map(value => (
                              <option value={value} key={value}>
                                {value} / 5
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                      <div>
                        <Label htmlFor="mood">Mood</Label>
                        <select
                          id="mood"
                          className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                          {...form.register("mood")}
                        >
                          <option value="good">Good</option>
                          <option value="okay">Okay</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="sleepDurationHours">
                          Sleep duration (optional)
                        </Label>
                        <Input
                          id="sleepDurationHours"
                          type="number"
                          min="0"
                          max="24"
                          step="0.25"
                          className="mt-2 h-11 rounded-xl"
                          {...form.register("sleepDurationHours", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                    {updateEntry.isError ? (
                      <p
                        role="alert"
                        className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                      >
                        We couldn’t update this entry. Please try again.
                      </p>
                    ) : null}
                    <div className="mt-7 flex justify-end">
                      <Button type="submit" disabled={updateEntry.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {updateEntry.isPending ? "Saving…" : "Save changes"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          Logged entry
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                          {formatDate(selected.localDate)}
                        </h2>
                      </div>
                      <div className="rounded-2xl bg-blue-50 px-4 py-2 text-center">
                        <span className="block text-2xl font-semibold tracking-tight text-blue-800">
                          {selected.recoveryScore}
                        </span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                          Score
                        </span>
                      </div>
                    </div>
                    <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs text-slate-500">Sleep</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-950">
                          {selected.sleepQuality}/5
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs text-slate-500">Energy</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-950">
                          {selected.energy}/5
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs text-slate-500">Stress</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-950">
                          {selected.stress}/5
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs text-slate-500">Soreness</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-950">
                          {selected.soreness}/5
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs text-slate-500">Mood</dt>
                        <dd className="mt-1 text-lg font-semibold capitalize text-slate-950">
                          {selected.mood}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs text-slate-500">
                          Sleep duration
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-950">
                          {selected.sleepDurationHours === null
                            ? "—"
                            : `${selected.sleepDurationHours}h`}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
                      <Button variant="outline" onClick={startEditing}>
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit entry
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={remove}
                        disabled={deleteEntry.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deleteEntry.isPending ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                    {deleteEntry.isError ? (
                      <p
                        role="alert"
                        className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                      >
                        We couldn’t delete this entry. Please try again.
                      </p>
                    ) : null}
                  </>
                )}
              </>
            ) : null}
          </article>
        </div>
      )}
    </section>
  );
}
