import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import CampaignsPage from '../pages/CampaignsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="dashboard/campaigns"
        element={
          <ProtectedRoute>
            <CampaignsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
