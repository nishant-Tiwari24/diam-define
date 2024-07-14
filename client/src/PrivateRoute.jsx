import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({
  isAuthenticated,
  children,
  redirect = '/',
}) => {
  if (!isAuthenticated) return <Navigate to={redirect} />;

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
