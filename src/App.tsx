
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
          
          {/* Provider dashboard routes */}
          <Route path="/dashboard/provider" element={<ProviderDashboard />} />
          <Route path="/dashboard/provider/leads" element={<NotFound />} />
          <Route path="/dashboard/provider/appointments" element={<NotFound />} />
          <Route path="/dashboard/provider/messages" element={<NotFound />} />
          <Route path="/dashboard/provider/documents" element={<NotFound />} />
          
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
