import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "../styles/Login.css";
import { SERVER_LINK } from "../utils/api"; // Убедитесь, что этот путь корректен

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Мутация для входа
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await axios.post(`${SERVER_LINK}/login`, credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token); // Сохраняем токен в localStorage
      localStorage.removeItem("admin"); // Удаляем статус администратора
      navigate("/"); // Перенаправление на главную страницу
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Ошибка входа");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Очистка ошибок перед отправкой

    // Проверка локально для admin/admin
    if (email === "admin@admin" && password === "admin@admin") {
      localStorage.setItem("token", "adminToken");
      localStorage.setItem("admin", "true");
      navigate("/analysis-results"); // Перенаправление для администратора
      return;
    }

    // Выполнение мутации для входа
    loginMutation.mutate({ email, password });
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
        <button
          type="submit"
          className="submit-button"
          disabled={loginMutation.isPending} // Блокируем кнопку при загрузке
        >
          {loginMutation.isPending ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
};

export default Login;
