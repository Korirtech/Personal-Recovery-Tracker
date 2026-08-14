import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  BarChart3,
  BrainCircuit,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ClipboardCheck, label: "Check-in", path: "/check-in" },
  { icon: CalendarDays, label: "History", path: "/history" },
  { icon: BrainCircuit, label: "Insights", path: "/insights" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl animate-pulse px-5 py-8">
          <div className="h-10 w-48 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
            Sign in to RecoveryLog
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your check-ins and insights remain private to your secure Manus
            account.
          </p>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="mt-7 w-full"
          >
            Continue with Manus
          </Button>
        </div>
      </div>
    );
  }

  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 md:flex md:flex-col">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-3 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            R
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight">
              RecoveryLog
            </span>
            <span className="block text-[11px] text-slate-500">
              Your pattern, clearly
            </span>
          </span>
        </button>
        <nav aria-label="Main navigation" className="mt-9 space-y-1">
          {menuItems.map(item => {
            const active = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4">
          <button
            onClick={() => setLocation("/profile")}
            className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${location === "/profile" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
          >
            <Settings className="h-4 w-4" />
            Profile & settings
          </button>
          <div className="mt-4 flex items-center gap-3 px-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
              {user?.name ?? "Your account"}
            </span>
            <button
              onClick={logout}
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:ml-64 md:hidden">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-xs font-bold text-white">
            R
          </span>
          RecoveryLog
        </button>
        <button
          onClick={() => setLocation("/profile")}
          className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
        >
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </button>
      </header>
      <main className="min-h-screen px-5 pb-24 md:ml-64 md:px-10 md:pb-10">
        {children}
      </main>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex h-[4.5rem] items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {menuItems.slice(0, 4).map(item => {
          const active = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`grid min-w-14 place-items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${active ? "text-blue-700" : "text-slate-500"}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
