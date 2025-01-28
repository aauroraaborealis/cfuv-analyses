import React from "react";
import { Link, useNavigate } from "react-router-dom";

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
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: isAdmin ? "#ac0d0d" : "#008000", // Красный для коуча, зеленый для остальных
        color: "white",
      }}
    >
      <h1>{isAdmin ? "Панель тренера" : "Анализы"}</h1>

      <nav style={{ display: "flex", alignItems: "center"}} >
        {!token ? (
          // Для незарегистрированных
          <>
            <Link to="/login" style={{ color: "white", textDecoration: "none"}}>
              Вход
            </Link>
            <Link to="/register" style={{ color: "white", textDecoration: "none", marginLeft: "20px" }}>
              Регистрация
            </Link>
          </>
        ) : isAdmin ? (
          // Для админов/коучей
          <>
            <Link
              to="/assign-analysis"
              style={{ color: "white", textDecoration: "none" }}
            >
               Назначение анализа
            </Link>
            <Link
              to="/analysis-results"
              style={{ color: "white", textDecoration: "none", marginLeft: "20px"  }}
            >
              Результаты анализов
            </Link>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                margin: "0"
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          // Для обычных зарегистрированных пользователей
          <>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Главная
            </Link>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                margin: "0"
              }}
            >
              Выйти
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
