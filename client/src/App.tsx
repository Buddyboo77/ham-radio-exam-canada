import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import FrequenciesPage from "@/pages/FrequenciesPage";
import ScannerPage from "@/pages/ScannerPage";
import RepeatersPage from "@/pages/RepeatersPage";
import LogbookPage from "@/pages/LogbookPage";
import ReferencePage from "@/pages/ReferencePage";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import { useState } from "react";

function Router() {
  const [activeTab, setActiveTab] = useState("frequencies");

  return (
    <div className="flex flex-col h-screen max-w-screen-lg mx-auto">
      <Header />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={() => <FrequenciesPage />} />
          <Route path="/frequencies" component={() => <FrequenciesPage />} />
          <Route path="/scanner" component={() => <ScannerPage />} />
          <Route path="/repeaters" component={() => <RepeatersPage />} />
          <Route path="/logbook" component={() => <LogbookPage />} />
          <Route path="/reference" component={() => <ReferencePage />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
