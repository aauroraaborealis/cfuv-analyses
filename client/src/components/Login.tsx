import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Очистка ошибок перед отправкой

    try {
      // Проверка локально для admin/admin
      if (email === "admin@admin" && password === "admin@admin") {
        localStorage.setItem("token", "adminToken");
        localStorage.setItem("admin", "true");
        navigate("/analysis-results"); // Перенаправление для администратора
        return;
      }

      // Если это не админ, выполняем запрос к серверу
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка входа");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // Сохраняем токен в localStorage
      localStorage.removeItem("admin"); // Удаляем статус администратора
      navigate("/"); // Перенаправление на главную страницу
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    }
  };

  return (
    <div className="login-form">
      <h2>Вход</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="column">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="css-13cymwt-control"
          />
        </div>
        <div className="column">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="css-13cymwt-control"
          />
        </div>
        <button type="submit" className="submit-button">
          Войти
        </button>
      </form>
    </div>
  );
};

export default Login;
