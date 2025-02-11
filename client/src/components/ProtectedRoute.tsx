import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Интерфейс для декодированного токена
interface DecodedToken {
  id: string;
  email: string;
  name: string;
  role: "student" | "trainer";
}

const ProtectedRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (!allowedRoles.includes(decoded.role)) {
      return <Navigate to="/not-found" />;
    }
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
