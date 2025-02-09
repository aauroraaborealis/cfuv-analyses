import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("admin") === "true";
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <header>
      <h2>{isAdmin ? "Панель тренера" : "Анализы"}</h2>

      <nav style={{ display: "flex", alignItems: "center" }}>
        {!token ? (
          // Для незарегистрированных
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register" style={{ marginLeft: "20px" }}>
              Регистрация
            </Link>
          </>
        ) : isAdmin ? (
          // Для админов/коучей
          <>
            <Link to="/assign-analysis">Назначение анализа</Link>
            <Link to="/analysis-results" style={{ marginLeft: "20px" }}>
              Результаты анализов
            </Link>
            <Link to="/assignments" style={{ marginLeft: "20px" }}>
              Назначенные анализы
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          // Для обычных зарегистрированных пользователей
          <>
            <Link to="/">Главная</Link>
            <button className="logout-btn" onClick={handleLogout}>
              Выйти
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
