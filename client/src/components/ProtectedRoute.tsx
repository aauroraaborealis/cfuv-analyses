import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserRole from "../hooks/useUserRole"; // Используем хук
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode; // 🔥 Добавляем поддержку children
}

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
//   const userRole = useUserRole(); // Получаем роль пользователя

//   const { accessToken, isInitialized } = useAuth();

//   // ⏳ Пока токен не подтянулся — ничего не рендерим
//   if (!isInitialized) {
//     return null; // или можно показать <Loading />
//   }

//   if (!userRole) {
//     // Если роль не определена (токен отсутствует или невалиден), перенаправляем на /login
//     console.log('no role');
//     return <Navigate to="/login" />;
//   }

//   if (!allowedRoles.includes(userRole)) {
//     // Если роль пользователя не входит в список разрешенных, перенаправляем на /not-found
//     return <Navigate to="/not-found" />;
//   }

//   // Если проверка прошла успешно, рендерим дочерние элементы или Outlet
//   return children ? <>{children}</> : <Outlet />;
// };


// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
//   const { accessToken, isInitialized } = useAuth();
//   const userRole = useUserRole();

//   // ⏳ Пока токен не подтянулся — ничего не рендерим
//   if (!isInitialized) {
//     return null; // или можно показать <Loading />
//   }

//   if (!userRole) {
//     console.log('❌ No role → redirecting to /login');
//     return <Navigate to="/login" />;
//   }

//   if (!allowedRoles.includes(userRole)) {
//     console.log('⚠️ Role not allowed → redirecting to /not-found');
//     return <Navigate to="/not-found" />;
//   }

//   return children ? <>{children}</> : <Outlet />;
// };

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { accessToken, isInitialized } = useAuth();
  const userRole = useUserRole();

  console.log("🔐 ProtectedRoute → accessToken:", accessToken);
  console.log("🔐 ProtectedRoute → isInitialized:", isInitialized);
  console.log("🔐 ProtectedRoute → userRole:", userRole);

  if (!isInitialized) return null; // пока не получили accessToken

  if (!userRole) {
    console.warn("❌ No role → redirecting to login");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.warn("⛔ Role not allowed → redirecting to not-found");
    return <Navigate to="/not-found" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;