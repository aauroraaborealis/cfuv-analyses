import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "./AuthProvider";

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = location.state || {};
  const { setAccessToken } = useAuth();

  const handleVerify = async () => {
    try {
      const response = await axios.post(`${SERVER_LINK}/register/verify`, {
        email,
        code,
        role,
      },
      { withCredentials: true } // ✅ добавь это
);

      // setAccessToken(response.data.accessToken); // ⬅️ сохраняем токен глобально
      // axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
      // localStorage.setItem("token", response.data.token);
      toast.success("Регистрация завершена!");


      localStorage.setItem("token", response.data.token);
 
      // setShowModal(true);

      // setTimeout(() => {
      //   setShowModal(false); // ✅ Авто-скрытие через 3 секунды
      //   navigate("/analysis-results");
      // }, 3000);

      // переход на анализы или кабинет
      navigate(role === "trainer" ? "/analysis-results" : "/my-analysis");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Неверный код");
    }
  };

  return (
    <div className="verify-code-form">
      <h2>Подтверждение</h2>
      <p>На <strong>{email}</strong> был отправлен код</p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Введите код из письма"
        className="input-react"
      />
      <button onClick={handleVerify} className="submit-button">
        Подтвердить
      </button>
    </div>
  );
};

export default VerifyCode;
