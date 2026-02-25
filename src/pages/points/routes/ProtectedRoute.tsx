import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Uik from '@reef-chain/ui-kit';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Uik.Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/points/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
