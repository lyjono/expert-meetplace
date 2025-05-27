import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServicesPage from "./pages/services/ServicesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PricingPage from "./pages/PricingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import ProviderDashboard from "./pages/dashboard/ProviderDashboard";
import DashboardRedirect from "./pages/dashboard/DashboardRedirect";
import FindExperts from "./pages/dashboard/client/FindExperts";
import ClientAppointments from "./pages/dashboard/client/Appointments";
import ClientMessages from "./pages/dashboard/client/Messages";
import ClientDocuments from "./pages/dashboard/client/Documents";
import ClientProfile from "./pages/dashboard/client/Profile";
import ClientSettings from "./pages/dashboard/client/Settings";
import ExpertProfile from "./pages/dashboard/client/ExpertProfile";
import ProviderLeads from "./pages/dashboard/provider/Leads";
import ProviderAppointments from "./pages/dashboard/provider/Appointments";
import ProviderMessages from "./pages/dashboard/provider/Messages";
import ProviderDocuments from "./pages/dashboard/provider/Documents";
import ProviderProfile from "./pages/dashboard/provider/Profile";
import ProviderSettings from "@/pages/dashboard/provider/Settings";
import ProviderPricing from "@/pages/dashboard/provider/Pricing";
import PublicBooking from "@/pages/booking/PublicBooking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Client dashboard routes */}
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="/dashboard/find-experts" element={<FindExperts />} />
          <Route path="/dashboard/appointments" element={<ClientAppointments />} />
          <Route path="/dashboard/messages" element={<ClientMessages />} />
          <Route path="/dashboard/documents" element={<ClientDocuments />} />
          <Route path="/dashboard/profile" element={<ClientProfile />} />
          <Route path="/dashboard/settings" element={<ClientSettings />} />
          <Route path="/dashboard/expert/:expertId" element={<ExpertProfile />} />

          {/* Provider dashboard routes */}
          <Route path="/dashboard/provider" element={<ProviderDashboard />} />
          <Route path="/dashboard/provider/leads" element={<ProviderLeads />} />
          <Route path="/dashboard/provider/appointments" element={<ProviderAppointments />} />
          <Route path="/dashboard/provider/messages" element={<ProviderMessages />} />
          <Route path="/dashboard/provider/documents" element={<ProviderDocuments />} />
          <Route path="/dashboard/provider/profile" element={<ProviderProfile />} />
          <Route path="/dashboard/provider/pricing" element={<ProviderPricing />} />
          <Route path="/dashboard/provider/settings" element={<ProviderSettings />} />
          <Route path="/book/:providerId" element={<PublicBooking />} />

          {/* Service routes */}
          <Route path="/services/:serviceType" element={<ServicesPage />} />

          {/* Other main routes */}
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/privacy" element={<NotFound />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;