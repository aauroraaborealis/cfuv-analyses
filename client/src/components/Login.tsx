import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "../styles/Login.css";
import { SERVER_LINK } from "../utils/api";
import { isAuthenticated, getRoleFromToken } from "../utils/auth";

const Login: React.FC = () => {
  console.log('LOGIN');
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await axios.post(`${SERVER_LINK}/login/init`, credentials);
      return data;
    },
    onSuccess: () => {
      // Переход к шагу подтверждения
      navigate("/login-verify", {
        state: { email }, // передаём email для второго шага
      });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Ошибка входа");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
