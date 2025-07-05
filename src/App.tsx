import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Opportunities from "./pages/Opportunities";
import Scholarships from "./pages/Scholarships";
import Submit from "./pages/Submit";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import OpportunityDetail from "./pages/OpportunityDetail";
import Blog from "./pages/Blog";
import ResumeBuilder from "./pages/ResumeBuilder";
import UserDashboard from "./pages/UserDashboard";
import AdvertiserDashboard from "./pages/AdvertiserDashboard";

// Moderator Pages
import ModeratorDashboard from "./pages/ModeratorDashboard";
import ModeratorPending from "./pages/ModeratorPending";
import ModeratorApproved from "./pages/ModeratorApproved";
import ModeratorUsers from "./pages/ModeratorUsers";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import AdminExpired from "./pages/AdminExpired";
import AdminNotifications from "./pages/AdminNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              
              {/* Protected Routes */}
              <Route 
                path="/opportunities" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Opportunities />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/scholarships" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Scholarships />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/opportunities/:id" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <OpportunityDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* User Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/submit" 
                element={
                  <ProtectedRoute>
                    <Submit />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookmarks" 
                element={
                  <ProtectedRoute>
                    <Bookmarks />
                  </ProtectedRoute>
                } 
              />

              {/* Advertiser Routes */}
              <Route 
                path="/advertiser/dashboard" 
                element={
                  <ProtectedRoute requireAdvertiser>
                    <AdvertiserDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Moderator Routes */}
              <Route 
                path="/moderator/dashboard" 
                element={
                  <ProtectedRoute requireModerator>
                    <ModeratorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/moderator/pending" 
                element={
                  <ProtectedRoute requireModerator>
                    <ModeratorPending />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/moderator/approved" 
                element={
                  <ProtectedRoute requireModerator>
                    <ModeratorApproved />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/moderator/users" 
                element={
                  <ProtectedRoute requireModerator>
                    <ModeratorUsers />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requireAdmin>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/expired" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminExpired />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/notifications" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminNotifications />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
