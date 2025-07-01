import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Page imports
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Submit from '@/pages/Submit';
import Bookmarks from '@/pages/Bookmarks';
import Profile from '@/pages/Profile';

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
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected user routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/submit" element={
              <ProtectedRoute requireAuth>
                <Submit />
              </ProtectedRoute>
            } />
            <Route path="/bookmarks" element={
              <ProtectedRoute requireAuth>
                <Bookmarks />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requireAuth>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
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
            
            {/* Moderator routes */}
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
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
