import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { BellRing, Check, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type ProfileForm = {
  displayName: string;
  timezone: string;
  reminderEnabled: boolean;
  localReminderTime: string;
};

export default function Profile() {
  const profileQuery = trpc.recovery.profile.get.useQuery();
  const updateProfile = trpc.recovery.profile.update.useMutation({
    onSuccess: () => void profileQuery.refetch(),
  });
  const deleteRecoveryData =
    trpc.recovery.privacy.deleteRecoveryData.useMutation();
  const [saved, setSaved] = useState(false);
  const [dataDeleted, setDataDeleted] = useState(false);
  const form = useForm<ProfileForm>({
    defaultValues: {
      displayName: "",
      timezone: "UTC",
      reminderEnabled: false,
      localReminderTime: "08:00",
    },
  });
  const timezones = useMemo(
    () =>
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : ["UTC"],
    []
  );

  useEffect(() => {
    const profile = profileQuery.data?.profile;
    if (!profile) return;
    form.reset({
      displayName: profile.displayName ?? profileQuery.data?.accountName ?? "",
      timezone: profile.timezone,
      reminderEnabled: Boolean(profile.reminderEnabled),
      localReminderTime: profile.localReminderTime ?? "08:00",
    });
  }, [form, profileQuery.data]);

  const onSubmit = form.handleSubmit(values => {
    setSaved(false);
    updateProfile.mutate(values, { onSuccess: () => setSaved(true) });
  });

  const deleteData = () => {
    if (
      !window.confirm(
        "Delete all RecoveryLog check-ins, insights, preferences, and plan data? This cannot be undone."
      )
    )
      return;
    deleteRecoveryData.mutate(undefined, {
      onSuccess: () => {
        setDataDeleted(true);
        window.setTimeout(() => window.location.assign("/"), 900);
      },
    });
  };

  if (profileQuery.isLoading)
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-5 py-8">
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="h-80 rounded-3xl bg-slate-100" />
      </div>
    );
  if (profileQuery.isError)
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-7">
        <h1 className="font-semibold text-red-950">
          We couldn’t load your profile.
        </h1>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => void profileQuery.refetch()}
        >
          Try again
        </Button>
      </div>
    );

  const email = profileQuery.data?.email ?? "Not available";
  const plan = profileQuery.data?.profile?.plan ?? "free";
  return (
    <section className="mx-auto max-w-2xl py-2 sm:py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Preferences
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        Your profile
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
        Set the local time that anchors your daily check-in and, if you choose,
        your gentle reminder.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold text-slate-950">
            Account details
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                className="mt-2 h-11 rounded-xl"
                maxLength={120}
                {...form.register("displayName")}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Account email</Label>
              <Input
                id="email"
                className="mt-2 h-11 rounded-xl bg-slate-50 text-slate-600"
                value={email}
                readOnly
              />
              <p className="mt-2 text-xs text-slate-500">
                Your account email is managed securely through Manus.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                {...form.register("timezone")}
              >
                {timezones.map(timezone => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Your timezone determines which local day a check-in belongs to.
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Daily reminder
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                A brief prompt to check in at your chosen local time. You can
                turn this off at any time.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <Label
                htmlFor="reminderEnabled"
                className="text-sm font-medium text-slate-900"
              >
                Enable daily reminder
              </Label>
              <p className="mt-1 text-xs text-slate-500">
                No health alerts or urgent language.
              </p>
            </div>
            <Switch
              id="reminderEnabled"
              checked={form.watch("reminderEnabled")}
              onCheckedChange={checked =>
                form.setValue("reminderEnabled", checked, { shouldDirty: true })
              }
            />
          </div>
          <div className="mt-5 max-w-xs">
            <Label htmlFor="localReminderTime">Reminder time</Label>
            <Input
              id="localReminderTime"
              type="time"
              className="mt-2 h-11 rounded-xl"
              {...form.register("localReminderTime")}
            />
          </div>
        </section>
        <section className="rounded-[1.6rem] border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <h2 className="font-semibold text-slate-950">
                Private by design
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Your logged wellness data is kept private to your account.
                RecoveryLog is an informational tracking tool and does not
                provide medical advice or diagnosis.
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-[1.6rem] border border-red-100 bg-red-50/70 p-5 sm:p-6">
          <h2 className="font-semibold text-slate-950">
            Delete RecoveryLog data
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700">
            This permanently deletes your RecoveryLog profile, check-ins,
            insights, preferences, and plan records. It does not delete your
            Manus identity account.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
            onClick={deleteData}
            disabled={deleteRecoveryData.isPending || dataDeleted}
          >
            {deleteRecoveryData.isPending
              ? "Deleting data…"
              : dataDeleted
                ? "Data deleted"
                : "Delete my RecoveryLog data"}
          </Button>
          {dataDeleted ? (
            <p role="status" className="mt-3 text-sm text-emerald-800">
              Your RecoveryLog data has been deleted. Returning to the homepage…
            </p>
          ) : null}
          {deleteRecoveryData.isError ? (
            <p role="alert" className="mt-3 text-sm text-red-800">
              We couldn’t delete your data. Please try again.
            </p>
          ) : null}
        </section>
        {updateProfile.isError ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            We couldn’t save your preferences. Please check the values and try
            again.
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Current plan:{" "}
            <span className="font-semibold capitalize text-slate-700">
              {plan}
            </span>
          </p>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              "Save preferences"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
