import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/index';

export default function PointsRoot() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
