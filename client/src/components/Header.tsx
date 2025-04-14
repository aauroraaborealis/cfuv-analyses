import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/header.css";
import { logout } from "../utils/logout";
import useUserRole from "../hooks/useUserRole";
import { isAuthenticated } from "../utils/auth";
import { useAuth } from "./AuthProvider";



const Header: React.FC = () => {
  const navigate = useNavigate();

  const role = useUserRole();

  // const handleLogout = async () => {
  //   await logout();  
  //   navigate("/login");
  // };

  const { setAccessToken } = useAuth();

  const handleLogout = async () => {
    await logout(setAccessToken); // ← передаём сюда хук
    navigate("/login");

  };

  const token = isAuthenticated();

  return (
    <header>
      <h2>{role === "trainer" ? "Панель тренера" : "Анализы"}</h2>

      <nav style={{ display: "flex", alignItems: "center" }}>
        {!token ? (
          // Для незарегистрированных пользователей
          <>
            <Link className="hoverline" to="/login">
              Вход
            </Link>
            <Link
              className="hoverline"
              to="/register"
              style={{ marginLeft: "20px" }}
            >
              Регистрация
            </Link>
          </>
        ) : role === "trainer" ? (
          // Для тренеров
          <>
            <Link className="hoverline" to="/assign-analysis">
              Назначение анализа
            </Link>
            <Link
              className="hoverline"
              to="/analysis-results"
              style={{ marginLeft: "20px" }}
            >
              Результаты анализов
            </Link>
            <Link
              className="hoverline"
              to="/assignments"
              style={{ marginLeft: "20px" }}
            >
              Назначенные анализы
            </Link>
            <Link
              className="hoverline"
              to="/profile"
              style={{ marginLeft: "20px" }}
            >
              Аккаунт
            </Link>
            <button className="logout-btn hoverline" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          // Для студентов
          <>
            <Link className="hoverline" to="/dashboard">
              Cтатистика
            </Link>
            <Link
              className="hoverline"
              to="/my-analysis"
              style={{ marginLeft: "20px" }}
            >
              Анализы
            </Link>

            <Link
              className="hoverline"
              to="/profile"
              style={{ marginLeft: "20px" }}
            >
              Профиль
            </Link>

            <button className="logout-btn hoverline" onClick={handleLogout}>
              Выйти
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
