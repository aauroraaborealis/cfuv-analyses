import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "../styles/Login.css";
import { SERVER_LINK } from "../utils/api";
import {jwtDecode} from "jwt-decode";
import { getRoleFromToken, isAuthenticated } from "../utils/auth";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  role: "student" | "trainer";
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

    // Если уже авторизован - редиректим на нужный маршрут
    useEffect(() => {
      if (isAuthenticated()) {
        const role = getRoleFromToken();
        if (role === "trainer") {
          navigate("/analysis-results");
        } else if (role === "student") {
          navigate("/my-analysis");
        }
      }
    }, [navigate]);

  // Мутация для входа
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await axios.post(`${SERVER_LINK}/login`, credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token); // Сохраняем токен

      try {
        // Декодируем JWT токен, чтобы получить роль
        const decoded: DecodedToken = jwtDecode(data.token);
        localStorage.setItem("role", decoded.role); // Сохраняем роль

        if (decoded.role === "student") {
          navigate("/my-analysis"); // Студенты → my-analysis
        } else if (decoded.role === "trainer") {
          navigate("/analysis-results"); // Тренеры → analysis-results
        } 
      } catch (error) {
        console.error("Ошибка декодирования токена:", error);
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Ошибка входа");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Выполняем мутацию для входа
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
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
};

export default Login;
