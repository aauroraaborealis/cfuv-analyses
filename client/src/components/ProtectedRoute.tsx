import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserRole from "./hooks/useUserRole"; // Используем хук

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode; // 🔥 Добавляем поддержку children
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const userRole = useUserRole(); // Получаем роль пользователя

  if (!userRole) {
    // Если роль не определена (токен отсутствует или невалиден), перенаправляем на /login
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Если роль пользователя не входит в список разрешенных, перенаправляем на /not-found
    return <Navigate to="/not-found" />;
  }

  // Если проверка прошла успешно, рендерим дочерние элементы или Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;