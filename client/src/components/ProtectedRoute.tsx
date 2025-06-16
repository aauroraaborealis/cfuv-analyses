import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserRole from "../hooks/useUserRole";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const userRole = useUserRole();

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/not-found" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
