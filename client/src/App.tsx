import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const History = lazy(() => import("./pages/History"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Insights = lazy(() => import("./pages/Insights"));
const Profile = lazy(() => import("./pages/Profile"));

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function RouteLoader() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-5 py-8">
      <div className="h-8 w-52 rounded bg-slate-200" />
      <div className="h-72 rounded-3xl bg-slate-100" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        <Suspense fallback={<RouteLoader />}>
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        </Suspense>
      </Route>
      <Route path="/check-in">
        <Suspense fallback={<RouteLoader />}>
          <ProtectedPage>
            <CheckIn />
          </ProtectedPage>
        </Suspense>
      </Route>
      <Route path="/history">
        <Suspense fallback={<RouteLoader />}>
          <ProtectedPage>
            <History />
          </ProtectedPage>
        </Suspense>
      </Route>
      <Route path="/analytics">
        <Suspense fallback={<RouteLoader />}>
          <ProtectedPage>
            <Analytics />
          </ProtectedPage>
        </Suspense>
      </Route>
      <Route path="/insights">
        <Suspense fallback={<RouteLoader />}>
          <ProtectedPage>
            <Insights />
          </ProtectedPage>
        </Suspense>
      </Route>
      <Route path="/profile">
        <Suspense fallback={<RouteLoader />}>
          <ProtectedPage>
            <Profile />
          </ProtectedPage>
        </Suspense>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
