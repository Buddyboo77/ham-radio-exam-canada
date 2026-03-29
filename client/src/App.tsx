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
import SupportPage from "@/pages/SupportPage";
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
    <div
      className="flex bg-gray-950 overflow-hidden w-full"
      style={{ height: '100dvh' }}
    >
      {/* iPad/tablet sidebar navigation */}
      {!isAuthPage && (
        <aside className="hidden md:flex flex-col shrink-0 w-52 bg-gray-900 border-r border-gray-800"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="px-4 py-5 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Power size={12} className={isOnline ? "text-green-400" : "text-red-400"} />
              <span className="text-gray-400 font-mono text-[10px]">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-blue-300 tracking-widest leading-tight block">
              HAM RADIO EXAM CANADA
            </span>
          </div>

          <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
            {tabs.map(tab => {
              const isActive =
                location === tab.path || (tab.path === "/learning" && location === "/");
              return (
                <Link key={tab.path} href={tab.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "text-blue-400 bg-blue-950 bg-opacity-60"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-800">
            <button
              onClick={() => { logout(); setLocation("/auth"); }}
              className="text-[11px] text-gray-500 hover:text-red-400 font-mono w-full text-left"
            >
              LOGOUT
            </button>
          </div>
        </aside>
      )}

      {/* Main content column */}
      <div
        className={`flex flex-col flex-1 overflow-hidden ${!isAuthPage ? 'md:max-w-none max-w-md mx-auto w-full' : 'w-full'}`}
      >
        {/* Top bar — phone only */}
        {!isAuthPage && (
          <div
            className="md:hidden flex justify-between items-center px-3 bg-gray-900 border-b border-gray-800 shrink-0"
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
            <Route path="/support" component={SupportPage} />

            <Route component={NotFound} />
          </Switch>
        </div>

        {/* Bottom tab bar — phone only */}
        {!isAuthPage && (
          <nav
            className="md:hidden shrink-0 border-t border-gray-800 bg-gray-900 grid grid-cols-3"
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
