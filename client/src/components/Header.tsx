// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "../styles/header.css";

// const Header: React.FC = () => {
//   const [isCoachMode, setIsCoachMode] = useState(false); // Состояние для режима тренера
//   const [isLoggedIn, setIsLoggedIn] = useState(false); // Состояние для проверки авторизации
//   const navigate = useNavigate();

//   // Проверяем наличие токена в localStorage при загрузке компонента
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsLoggedIn(!!token); // Если токен есть, устанавливаем isLoggedIn в true
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token"); // Удаляем токен
//     setIsLoggedIn(false); // Обновляем состояние
//     navigate("/"); // Перенаправляем на главную страницу
//   };

//   const handleToggleCoachMode = () => {
//     if (isCoachMode) {
//       navigate("/"); // Перенаправление на главную при выходе из режима тренера
//     }
//     setIsCoachMode(!isCoachMode); // Переключение режима
//   };

//   return (
//     <header className="headerStyle">
//       <nav className="header-nav">
//         <Link to="/" className="h-link">
//           Главная
//         </Link>
//         {!isLoggedIn ? (
//           <>
//             <Link to="/login" className="h-link">
//               Войти
//             </Link>
//             <Link to="/register" className="h-link">
//               Зарегестрироваться
//             </Link>
//           </>
//         ) : (
//           <button onClick={handleLogout} className="logout">
//             Выйти
//           </button>
//         )}
//         {!isCoachMode ? (
//           <button onClick={handleToggleCoachMode} className="trainer-btn">
//             Зайти как тренер
//           </button>
//         ) : (
//           <>
//             <button onClick={handleToggleCoachMode} className="trainer-btn">
//               Выйти из режима тренера
//             </button>
//             <Link to="/assign-analysis">Управление анализами</Link>
//           </>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Header;


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

      <nav>
        {!token ? (
          // Для незарегистрированных
          <>
            <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
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
