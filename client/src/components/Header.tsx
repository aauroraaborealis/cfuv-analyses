import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/header.css'

const Header: React.FC = () => {
  const [isCoachMode, setIsCoachMode] = useState(false); // Состояние для режима тренера
  const navigate = useNavigate();

  const handleToggleCoachMode = () => {
    if (isCoachMode) {
      navigate("/"); // Перенаправление на главную при выходе из режима тренера
    }
    setIsCoachMode(!isCoachMode); // Переключение режима
  };

  return (
    <header className="headerStyle">
      <nav>
        <Link to="/">Главная</Link>
        {!isCoachMode ? (
          <button onClick={handleToggleCoachMode}>Зайти как тренер</button>
        ) : (
          <>
            <button onClick={handleToggleCoachMode}>Выйти из режима тренера</button>
            <Link to="/assign-analysis">Управление анализами</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
