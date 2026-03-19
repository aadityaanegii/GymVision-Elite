/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { WorkoutCamera } from './pages/WorkoutCamera';
import { Chatbot } from './pages/Chatbot';
import { Nutrition } from './pages/Nutrition';
import { Onboarding } from './pages/Onboarding';
import { PerformanceTracker } from './pages/PerformanceTracker';
import { WorkoutCycles } from './pages/WorkoutCycles';
import { Profile } from './pages/Profile';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // If user is logged in but hasn't completed onboarding, force them to /onboarding
  if (userProfile && !userProfile.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  // If user has completed onboarding and tries to access /onboarding, redirect to dashboard
  if (userProfile && userProfile.onboardingCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="camera" element={<WorkoutCamera />} />
              <Route path="chat" element={<Chatbot />} />
              <Route path="nutrition" element={<Nutrition />} />
              <Route path="performance" element={<PerformanceTracker />} />
              <Route path="cycles" element={<WorkoutCycles />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
