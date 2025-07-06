
import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const LazyAdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
export const LazyAdminSettings = lazy(() => import('@/pages/AdminSettings'));
export const LazyModeratorDashboard = lazy(() => import('@/pages/ModeratorDashboard'));
export const LazyResumeBuilder = lazy(() => import('@/pages/ResumeBuilder'));
export const LazyPerformanceMonitor = lazy(() => import('@/components/PerformanceMonitor'));
export const LazySecurityAudit = lazy(() => import('@/components/SecurityAudit'));
