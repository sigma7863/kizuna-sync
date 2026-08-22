import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import { useI18n } from "./contexts/I18nContext";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { AccessibilityNavigation } from "./components/AccessibilityNavigation";
import Home from "./pages/Home";
import InviteMembers from "./pages/InviteMembers";
import JoinFamily from "./pages/JoinFamily";

const FamilyDetail = lazy(() => import("./pages/FamilyDetail"));

function Router() {
  const { t } = useI18n();
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<main id="main-content" tabIndex={-1} className="min-h-screen bg-slate-950 p-6 text-center text-sm text-slate-200">{t("common.loading")}</main>}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/family/:id"} component={FamilyDetail} />
        <Route path={"/family/:id/invite"} component={InviteMembers} />
        <Route path={"/join/:code"} component={JoinFamily} />
        <Route path={"/join"} component={JoinFamily} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <AccessibilityNavigation />
            <Toaster />
            <OfflineIndicator />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
