import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/header.css";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  role: "student" | "trainer";
}

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let role: "student" | "trainer" | null = null;

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      role = decoded.role;
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <button
          className={`burger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${isOpen ? "show" : ""}`}>
          {!token ? (
            <>
              <Link to="/login" className="hoverline" onClick={() => setIsOpen(false)}>
                Вход
              </Link>
              <Link to="/register" className="hoverline" onClick={() => setIsOpen(false)}>
                Регистрация
              </Link>
            </>
          ) : role === "trainer" ? (
            <>
              <Link to="/assign-analysis" className="hoverline" onClick={() => setIsOpen(false)}>
                Назначение анализа
              </Link>
              <Link to="/analysis-results" className="hoverline" onClick={() => setIsOpen(false)}>
                Результаты анализов
              </Link>
              <Link to="/assignments" className="hoverline" onClick={() => setIsOpen(false)}>
                Назначенные анализы
              </Link>
              <Link to="/edit" className="hoverline" onClick={() => setIsOpen(false)}>
                Редактировать данные
              </Link>
              <Link to="/profile" className="hoverline" onClick={() => setIsOpen(false)}>
                Мой аккаунт
              </Link>
              <button className="logout-btn hoverline" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="hoverline" onClick={() => setIsOpen(false)}>
                Статистика
              </Link>
              <Link to="/my-analysis" className="hoverline" onClick={() => setIsOpen(false)}>
                Анализы
              </Link>
              <Link to="/profile" className="hoverline" onClick={() => setIsOpen(false)}>
                Профиль
              </Link>
              <button className="logout-btn hoverline" onClick={handleLogout}>
                Выйти
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
