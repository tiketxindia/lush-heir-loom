import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";
import Index from "./pages/Index";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { MenuManagement } from "./pages/admin/MenuManagement";
import { HeaderSettings } from "./pages/admin/HeaderSettings";
import { CarouselManagement } from "./pages/admin/CarouselManagement";
import { HelpManagement } from "./pages/admin/HelpManagement";
import { CustomerSignIn } from "./pages/CustomerSignIn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/new-featured" element={<ProductListing />} />
            <Route path="/family" element={<ProductListing />} />
            <Route path="/memories" element={<ProductListing />} />
            <Route path="/emotions" element={<ProductListing />} />
            <Route path="/customize" element={<ProductListing />} />
            <Route path="/sale" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            
            {/* Customer Authentication */}
            <Route path="/signin" element={<CustomerSignIn />} />
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="header-settings" element={<HeaderSettings />} />
              <Route path="carousel" element={<CarouselManagement />} />
              <Route path="help" element={<HelpManagement />} />
              <Route path="products" element={<div>Products Management (Coming Soon)</div>} />
              <Route path="users" element={<div>User Management (Coming Soon)</div>} />
              <Route path="analytics" element={<div>Analytics (Coming Soon)</div>} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
