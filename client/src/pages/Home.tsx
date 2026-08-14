import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  MoonStar,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useLocation } from "wouter";

const features = [
  {
    icon: MoonStar,
    title: "A calm daily check-in",
    text: "Log sleep, energy, stress, soreness, mood, and optional sleep duration in about a minute.",
  },
  {
    icon: TrendingUp,
    title: "Your pattern, not a diagnosis",
    text: "See a consistent personal recovery indicator and trends from the information you choose to log.",
  },
  {
    icon: BrainCircuit,
    title: "Safe pattern insights",
    text: "When there is enough history, private AI summaries help you notice associations in your own entries.",
  },
  {
    icon: LockKeyhole,
    title: "Private by design",
    text: "Your wellness entries remain linked to your secure account and are never used as a public profile.",
  },
];

const faqs = [
  {
    question: "What is RecoveryLog?",
    answer:
      "RecoveryLog is a private wellbeing tracker for logging how you feel and observing your own patterns over time.",
  },
  {
    question: "How is the indicator calculated?",
    answer:
      "The score is calculated with a fixed formula that weights your sleep quality, energy, stress, soreness, and mood responses. Stress and soreness are reverse-scored.",
  },
  {
    question: "Is this medical advice?",
    answer:
      "No. RecoveryLog does not diagnose conditions, measure medical recovery, or replace professional medical advice.",
  },
  {
    question: "How does AI work?",
    answer:
      "AI sees only a minimal, structured summary of your logged patterns. Outputs are validated before display and presented as informational observations, not medical claims.",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const startTracking = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
      return;
    }
    startLogin();
  };

  return (
    <div className="min-h-screen bg-[#fbfcfe] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#fbfcfe]/90 backdrop-blur">
        <div className="mx-auto flex h-17 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a
            href="#top"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              R
            </span>
            <span className="text-base font-semibold tracking-tight">
              RecoveryLog
            </span>
          </a>
          <nav
            aria-label="Landing navigation"
            className="hidden items-center gap-6 text-sm text-slate-600 md:flex"
          >
            <a href="#how-it-works" className="hover:text-slate-950">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-950">
              Features
            </a>
            <a href="#pricing" className="hover:text-slate-950">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-950">
              FAQ
            </a>
          </nav>
          <Button onClick={startTracking} size="sm" disabled={loading}>
            {isAuthenticated ? "Open dashboard" : "Start tracking"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div
            aria-hidden="true"
            className="absolute -right-36 top-0 h-120 w-120 rounded-full bg-blue-100/60 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -left-44 bottom-0 h-96 w-96 rounded-full bg-teal-100/70 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5" /> A private daily wellbeing
                practice
              </p>
              <h1 className="mt-7 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
                Understand your patterns.
                <span className="block text-blue-600">Recover smarter.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                A simple daily recovery tracker that helps you see how sleep,
                energy, stress, soreness, and mood relate in <em>your</em> life.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={startTracking} disabled={loading}>
                  {isAuthenticated
                    ? "Open your dashboard"
                    : "Start tracking free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <a href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    See how it works
                  </Button>
                </a>
              </div>
              <p className="mt-5 text-xs text-slate-500">
                For personal reflection only. Not medical advice or a diagnosis.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden="true"
                className="absolute inset-x-12 -bottom-8 h-16 rounded-full bg-blue-900/10 blur-2xl"
              />
              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-24px_rgba(15,23,42,0.24)] sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                      Your morning
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                      A minute for yourself
                    </p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                    <MoonStar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Today’s check-in
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    How did you sleep?
                  </p>
                  <div
                    className="mt-5 grid grid-cols-5 gap-2"
                    aria-hidden="true"
                  >
                    {[1, 2, 3, 4, 5].map(value => (
                      <span
                        key={value}
                        className={`grid aspect-square place-items-center rounded-xl border text-sm font-medium ${value === 4 ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-slate-600">
                    Simple inputs. A clearer personal picture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-slate-200 bg-white px-5 py-20 sm:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                A quiet routine with a useful record.
              </h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                [
                  "01",
                  "Check in",
                  "Take a moment each morning to log how you slept and feel.",
                ],
                [
                  "02",
                  "Get your indicator",
                  "See a deterministic personal score based on your own responses.",
                ],
                [
                  "03",
                  "Notice patterns",
                  "Build a private trend that makes changes easier to recognize.",
                ],
              ].map(([number, title, text]) => (
                <article
                  key={number}
                  className="border-t-2 border-slate-100 pt-6"
                >
                  <span className="text-sm font-semibold text-blue-700">
                    {number}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Built for self-awareness
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  A little clarity, without the noise.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-600">
                Designed for a fast morning routine on your phone, with space
                for deeper reflection over time.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {features.map(feature => (
                <article
                  key={feature.title}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-6 transition-shadow hover:shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-5 py-20 text-white sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
                AI, kept in context
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Pattern observations, not a chatbot.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
                When you have enough history, RecoveryLog first summarizes
                relevant patterns in your own entries. AI then turns that
                structured evidence into an easy-to-read observation.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-700 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-white">
                Safety is part of the product.
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                <li className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  Insights use your logged patterns; they do not claim medical
                  certainty.
                </li>
                <li className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  Only validated structured output can be stored or shown.
                </li>
                <li className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  Your email and unnecessary identifying information stay out of
                  AI summaries.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Simple pricing
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with the essentials.
            </h2>
            <div className="mt-11 grid gap-5 text-left md:grid-cols-2">
              <article className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
                <p className="text-sm font-semibold text-slate-600">Free</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  $0{" "}
                  <span className="text-sm font-medium text-slate-500">
                    to start
                  </span>
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  A focused daily tracking practice.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    "Daily check-in",
                    "Personal recovery indicator",
                    "Seven-day history",
                    "Basic dashboard",
                  ].map(item => (
                    <li key={item} className="flex gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-8 w-full"
                  onClick={startTracking}
                >
                  Get started
                </Button>
              </article>
              <article className="rounded-[1.75rem] border border-blue-600 bg-blue-600 p-7 text-white shadow-lg shadow-blue-200">
                <p className="text-sm font-semibold text-blue-100">Pro</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  Coming soon
                </p>
                <p className="mt-4 text-sm leading-6 text-blue-100">
                  Deeper history and considered pattern analysis when you are
                  ready.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white">
                  {[
                    "Unlimited history",
                    "AI-powered pattern insights",
                    "30- and 90-day analytics",
                    "Data export architecture",
                  ].map(item => (
                    <li key={item} className="flex gap-2">
                      <Check className="h-4 w-4 text-teal-200" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  className="mt-8 w-full"
                  onClick={startTracking}
                >
                  Start with Free
                </Button>
              </article>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="border-t border-slate-200 bg-white px-5 py-20 sm:px-8"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                FAQ
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                A few clear answers.
              </h2>
            </div>
            <div className="divide-y divide-slate-200">
              {faqs.map(faq => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-slate-900">
                    <span>{faq.question}</span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="max-w-2xl pt-3 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} RecoveryLog. Personal reflection, not
            medical advice.
          </p>
          <div className="flex gap-5">
            <a href="#faq" className="hover:text-slate-900">
              Privacy
            </a>
            <a href="#faq" className="hover:text-slate-900">
              Terms
            </a>
            <a
              href="mailto:hello@recoverylog.app"
              className="hover:text-slate-900"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
