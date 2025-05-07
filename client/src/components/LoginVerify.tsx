// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { SERVER_LINK } from "../utils/api";
// import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";

// const LoginVerify: React.FC = () => {
//   const [code, setCode] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { email } = location.state || {};

//   const handleVerify = async () => {
//     try {
//       const response = await axios.post(`${SERVER_LINK}/login/verify`, {
//         email,
//         code,
//       });

//       const token = response.data.token;
//       localStorage.setItem("token", token);

//       const decoded: any = jwtDecode(token);
//       if (decoded.role === "trainer") {
//         navigate("/analysis-results");
//       } else if (decoded.role === "student") {
//         navigate("/my-analysis");
//       }
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Ошибка подтверждения кода");
//     }
//   };

//   return (
//     <div className="verify-code-form">
//       <h2>Подтвердите вход</h2>
//       <p>На <strong>{email}</strong> был отправлен код</p>
//       <input
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//         placeholder="Введите код"
//         className="input-react"
//       />
//       <button onClick={handleVerify} className="submit-button">
//         Подтвердить
//       </button>
//     </div>
//   );
// };

// export default LoginVerify;


// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { SERVER_LINK } from "../utils/api";
// import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";
// import { useAuth } from "./AuthProvider";

// const LoginVerify: React.FC = () => {
//   const [code, setCode] = useState("");
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { email } = location.state || {};
//   const { setAccessToken } = useAuth();


//   const handleVerify = async () => {
//     try {
//       const { data } = await axios.post(
//         `${SERVER_LINK}/login/verify`,
//         { email, code },
//         { withCredentials: true } // ⚠️ чтобы получить куки
//       );

//       // setAccessToken(data.accessToken); // сохраняем глобально

//       // // ⛔ НЕ сохраняем в localStorage
//       // axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

//       localStorage.setItem("token", data.token);

//       const decoded: any = jwtDecode(data.token);
//       const role = decoded.role;

//       if (role === "trainer") {
//         navigate("/analysis-results");
//       } else {
//         navigate("/my-analysis");
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Ошибка подтверждения");
//     }
//   };

//   return (
//     <div className="verify-code-form">
//       <h2>Подтвердите вход</h2>
//       <p>Код отправлен на <strong>{email}</strong></p>
//       <input
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//         placeholder="Введите код"
//         className="input-react"
//       />
//       <button onClick={handleVerify} className="submit-button">
//         Подтвердить
//       </button>
//     </div>
//   );
// };

// export default LoginVerify;


import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useAuth } from "./AuthProvider";

const LoginVerify: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const { setAccessToken } = useAuth();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    try {
      const { data } = await axios.post(
        `${SERVER_LINK}/login/verify`,
        { email, code },
        { withCredentials: true }
      );

      setError(false);
      localStorage.setItem("token", data.token);

      const decoded: any = jwtDecode(data.token);
      const role = decoded.role;

      navigate(role === "trainer" ? "/analysis-results" : "/my-analysis");
    } catch (error: any) {
      setError(true);
      toast.error(error.response?.data?.message || "Ошибка подтверждения");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`${SERVER_LINK}/login/resend-code`, { email });
      toast.info("Код отправлен повторно");
      setResendCooldown(30);
    } catch {
      toast.error("Не удалось отправить код повторно");
    }
  };

  return (
<div className="verify-code-form">
  <h2>Подтвердите вход</h2>
  <p>Код отправлен на <strong>{email}</strong></p>

  <input
    value={code}
    onChange={(e) => {
      setCode(e.target.value);
      setError(false);
    }}
    placeholder="Введите код"
    className={`input-react ${error ? "input-error" : ""}`}
  />

  <p className="new-code"> Новый код можно запросить через 00:37</p>

  <button onClick={handleVerify} className="submit-button">
    Подтвердить
  </button>

  {/* <button
    onClick={handleResend}
    className="resend-button"
    disabled={resendCooldown > 0}
    style={{ marginTop: "10px" }}
  >
    Отправить код повторно
  </button> */}

  {resendCooldown > 0 && (
    <p className="timer-text">
      Новый код можно запросить через <strong>{resendCooldown}</strong> сек
    </p>
  )}
</div>

  );
};

export default LoginVerify;
