import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { HomePage } from '@/modules/landing/pages/HomePage';
import { DiscoverPage } from '@/modules/discover/pages/DiscoverPage';
import { RecommendationsPage } from '@/modules/matching/pages/RecommendationsPage';
import { MyActivitiesPage } from '@/modules/meetups/pages/MyActivitiesPage';
import { MessagesPage } from '@/modules/messaging/pages/MessagesPage';
import { SafetyGuidelinesPage } from '@/modules/safety/pages/SafetyGuidelinesPage';
import { CreateActivityPage } from '@/modules/activities/pages/CreateActivityPage';
import { ActivityDetailPage } from '@/modules/activities/pages/ActivityDetailPage';
import { LoginPage } from '@/modules/authentication/pages/LoginPage';
import { RegisterPage } from '@/modules/authentication/pages/RegisterPage';
import { OnboardingPage } from '@/modules/onboarding/pages/OnboardingPage';
import { ProfilePage } from '@/modules/user-profile/pages/ProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<DiscoverPage />} />
        <Route path="/activities" element={<Navigate to="/explore" replace />} />
        <Route path="/activities/:id" element={<ActivityDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/safety" element={<SafetyGuidelinesPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />

        {/* Protected Onboarding Route (requires auth, but not onboarded profile) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarded={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Authenticated & Onboarded Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-activities"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MyActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities/create"
          element={
            <ProtectedRoute requireOnboarded={true}>
              <CreateActivityPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
