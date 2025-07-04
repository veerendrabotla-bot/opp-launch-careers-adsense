
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Page imports
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Submit from '@/pages/Submit';
import Bookmarks from '@/pages/Bookmarks';
import Profile from '@/pages/Profile';
import Opportunities from '@/pages/Opportunities';
import Scholarships from '@/pages/Scholarships';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Tailor from '@/pages/Tailor';
import OpportunityDetail from '@/pages/OpportunityDetail';
import AdminExpired from '@/pages/AdminExpired';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Admin pages
import AdminDashboard from '@/pages/AdminDashboard';
import Admin from '@/pages/Admin';
import UserManagement from '@/pages/UserManagement';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminMonetization from '@/pages/AdminMonetization';
import AdminSettings from '@/pages/AdminSettings';

// Moderator pages
import ModeratorDashboard from '@/pages/ModeratorDashboard';
import ModeratorUsers from '@/pages/ModeratorUsers';
import ModeratorApproved from '@/pages/ModeratorApproved';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/opportunities" element={<Layout><Opportunities /></Layout>} />
            <Route path="/opportunity/:id" element={<Layout><OpportunityDetail /></Layout>} />
            <Route path="/bookmarks" element={
              <ProtectedRoute>
                <Layout><Bookmarks /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/submit" element={
              <ProtectedRoute>
                <Layout><Submit /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/tailor" element={
              <ProtectedRoute>
                <Layout><Tailor /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout><Admin /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/expired" element={
              <ProtectedRoute>
                <Layout><AdminExpired /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/opportunities" element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requireAdmin>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/monetization" element={
              <ProtectedRoute requireAdmin>
                <AdminMonetization />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/moderator" element={
              <ProtectedRoute requireModerator>
                <ModeratorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/moderator/opportunities" element={
              <ProtectedRoute requireModerator>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/moderator/approved" element={
              <ProtectedRoute requireModerator>
                <ModeratorApproved />
              </ProtectedRoute>
            } />
            <Route path="/moderator/users" element={
              <ProtectedRoute requireModerator>
                <ModeratorUsers />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
