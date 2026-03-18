import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ReferencePage from "@/pages/ReferencePage";
import EnhancedLearningPage from "@/pages/EnhancedLearningPage";
import MorseCodePage from "@/pages/MorseCodePage";
import AuthPage from "@/pages/AuthPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { useEffect } from "react";
import { Radio, BookOpen, BookOpenCheck, Power } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

function Router() {
  const [location, setLocation] = useLocation();
  const isOnline = useOnlineStatus();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (location === "/" && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [location, setLocation, isAuthenticated]);

  const tabs = [
    { path: "/learning", label: "Exams", icon: <BookOpenCheck size={22} /> },
    { path: "/morse-code", label: "Morse", icon: <Radio size={22} /> },
    { path: "/reference", label: "Study Guide", icon: <BookOpen size={22} /> },
  ];

  const isAuthPage = location === "/auth";

  return (
    /*
     * Layout uses dynamic viewport height (dvh) so the app fills the screen
     * correctly on mobile browsers where the address bar collapses/expands.
     * Falls back to 100vh for older browsers.
     * Safe-area insets handle iPhone notch/Dynamic Island and home indicator,
     * and Android gesture/button navigation bars.
     */
    <div
      className="flex flex-col mx-auto max-w-md relative bg-gray-950 overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* Top bar — padded for iPhone notch / Dynamic Island */}
      {!isAuthPage && (
        <div
          className="flex justify-between items-center px-3 bg-gray-900 border-b border-gray-800 shrink-0"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 6px)', paddingBottom: '6px' }}
        >
          <div className="flex items-center gap-1.5">
            <Power size={11} className={isOnline ? "text-green-400" : "text-red-400"} />
            <span className="text-gray-400 font-mono text-[10px]">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-blue-300 tracking-widest">
            HAM RADIO EXAM CANADA
          </span>
          <button
            onClick={() => { logout(); setLocation("/auth"); }}
            className="text-[10px] text-gray-500 hover:text-red-400 font-mono px-1"
          >
            LOGOUT
          </button>
        </div>
      )}

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/auth" component={AuthPage} />

          <ProtectedRoute path="/">
            <EnhancedLearningPage />
          </ProtectedRoute>

          <ProtectedRoute path="/learning">
            <EnhancedLearningPage />
          </ProtectedRoute>

          <ProtectedRoute path="/morse-code">
            <MorseCodePage />
          </ProtectedRoute>

          <ProtectedRoute path="/reference">
            <ReferencePage />
          </ProtectedRoute>

          <Route path="/privacy" component={PrivacyPolicyPage} />
          <Route path="/terms" component={TermsOfServicePage} />

          <Route component={NotFound} />
        </Switch>
      </div>

      {/*
       * Bottom tab bar — padded for iPhone home indicator and Android nav bar.
       * env(safe-area-inset-bottom) is 0 on devices without a home indicator
       * so this is safe to apply everywhere.
       */}
      {!isAuthPage && (
        <nav
          className="shrink-0 border-t border-gray-800 bg-gray-900 grid grid-cols-3"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {tabs.map(tab => {
            const isActive =
              location === tab.path || (tab.path === "/learning" && location === "/");
            return (
              <Link key={tab.path} href={tab.path}>
                <div
                  className={`flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                    isActive
                      ? "text-blue-400 bg-blue-950 bg-opacity-40"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {tab.icon}
                  <span className="text-[11px] font-medium">{tab.label}</span>
                  {isActive && (
                    <div className="w-5 h-0.5 bg-blue-400 rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
