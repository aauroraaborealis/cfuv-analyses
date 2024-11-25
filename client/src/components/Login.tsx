import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const credentials = { email, password };

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const result = await response.json();
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem("userData", JSON.stringify(result.user));
        alert("Вы успешно вошли!");
        navigate("/"); // Перенаправляем на главную страницу
      } else {
        alert("Неверный email или пароль.");
      }
    } catch (error) {
      console.error("Ошибка входа:", error);
      alert("Ошибка входа. Попробуйте снова.");
    }
  };

  return (
    <div className="login-form">
      <h2>Вход</h2>
      <form onSubmit={handleLogin}>
        <div className="column">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="column">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
