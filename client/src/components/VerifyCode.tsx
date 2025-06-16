import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";
import { toast } from "react-toastify";

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(() => {
    const saved = localStorage.getItem("resendTimestamp");
    if (saved) {
      const secondsSince = Math.floor((Date.now() - Number(saved)) / 1000);
      const remaining = 60 - secondsSince;
      return remaining > 0 ? remaining : 0;
    } else {
      const now = Date.now();
      localStorage.setItem("resendTimestamp", now.toString());
      return 60;
    }
  });

  useEffect(() => {
    return () => {
      localStorage.removeItem("resendTimestamp");
    };
  }, []);

  const navigate = useNavigate();

  const saved = sessionStorage.getItem("register");
  let email: string | null = null;
  let role: string | null = null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      email = parsed.email || null;
      role = parsed.role || null;
    } catch {
    }
  }

  useEffect(() => {
    if (!email) {
      toast.error("Данные регистрации не найдены — повторите регистрацию.");
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    const savedTimestamp = localStorage.getItem("resendTimestamp");
    if (savedTimestamp) {
      const secondsSince = Math.floor(
        (Date.now() - Number(savedTimestamp)) / 1000
      );
      const remaining = 60 - secondsSince;
      if (remaining > 0) {
        setResendCooldown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown((prev) => prev - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    try {
      const { data } = await axios.post(
        `${SERVER_LINK}/register/verify`,
        { email, code, role},
        { withCredentials: true }
      );

      setError(false);
      setErrorMessage("");

      localStorage.setItem("token", data.token);

      navigate(role === "trainer" ? "/analysis-results" : "/my-analysis");
      sessionStorage.removeItem("register");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Введённый код неверен или истёк срок его действия";
      setErrorMessage(msg);
      console.error("Verification error:", msg);
      setError(true);
    }
  };

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResend = async () => {
    try {
      await axios.post(`${SERVER_LINK}/resend`, { email });
      toast.info("Код отправлен повторно");
      localStorage.setItem("resendTimestamp", Date.now().toString());
      setResendCooldown(60);
    } catch {
      toast.error("Не удалось отправить код повторно");
    }
  };

  return (
    <div className="verify-code-form">
      <h2>Подтвердите регистрацию</h2>
      <p>
        Код отправлен на <strong>{email}</strong>
      </p>

      {resendCooldown > 0 ? (
        <p className="new-code">
          Новый код можно запросить через{" "}
          <strong>{formatTime(resendCooldown)}</strong>
        </p>
      ) : (
        <button
          onClick={handleResend}
          className="resend-button"
          style={{ marginTop: "10px" }}
        >
          Отправить код повторно
        </button>
      )}

      <input
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError(false);
          setErrorMessage("");
        }}
        placeholder="Введите код"
        className={`input-react ${error ? "input-error" : ""}`}
      />

      {error && (
        <p
          className="error-text"
          style={{ color: "#911818", marginTop: "5px" }}
        >
          {errorMessage}
        </p>
      )}

      <button onClick={handleVerify} className="submit-button">
        Подтвердить
      </button>
    </div>
  );
};

export default VerifyCode;
