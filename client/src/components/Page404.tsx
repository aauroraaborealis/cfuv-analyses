import React from "react";
import { useNavigate } from "react-router-dom";

const Page404: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
      navigate("/"); // Если истории нет, перекинуть на главную
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 className="mb">404</h1>
      <p className="mb">Страница не найдена или у вас недостаточно прав для её просмотра</p>
      <button 
        onClick={handleGoBack} 
      >
        Назад
      </button>
    </div>
  );
};

export default Page404;
