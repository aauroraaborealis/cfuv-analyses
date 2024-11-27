import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/header.css";

const Header: React.FC = () => {
  const [isCoachMode, setIsCoachMode] = useState(false); // Состояние для режима тренера
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Состояние для проверки авторизации
  const navigate = useNavigate();

  // Проверяем наличие токена в localStorage при загрузке компонента
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Если токен есть, устанавливаем isLoggedIn в true
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Удаляем токен
    setIsLoggedIn(false); // Обновляем состояние
    navigate("/"); // Перенаправляем на главную страницу
  };

  const handleToggleCoachMode = () => {
    if (isCoachMode) {
      navigate("/"); // Перенаправление на главную при выходе из режима тренера
    }
    setIsCoachMode(!isCoachMode); // Переключение режима
  };

  return (
    <header className="headerStyle">
      <nav className="header-nav">
        <Link to="/" className="h-link">
          Главная
        </Link>
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="h-link">
              Войти
            </Link>
            <Link to="/register" className="h-link">
              Зарегестрироваться
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="logout">
            Выйти
          </button>
        )}
        {!isCoachMode ? (
          <button onClick={handleToggleCoachMode} className="trainer-btn">
            Зайти как тренер
          </button>
        ) : (
          <>
            <button onClick={handleToggleCoachMode} className="trainer-btn">
              Выйти из режима тренера
            </button>
            <Link to="/assign-analysis">Управление анализами</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;