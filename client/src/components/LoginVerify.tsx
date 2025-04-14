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


import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useAuth } from "./AuthProvider";

const LoginVerify: React.FC = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const { setAccessToken } = useAuth();


  const handleVerify = async () => {
    try {
      const { data } = await axios.post(
        `${SERVER_LINK}/login/verify`,
        { email, code },
        { withCredentials: true } // ⚠️ чтобы получить куки
      );

      setAccessToken(data.accessToken); // сохраняем глобально

      // ⛔ НЕ сохраняем в localStorage
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

      const decoded: any = jwtDecode(data.accessToken);
      const role = decoded.role;

      if (role === "trainer") {
        navigate("/analysis-results");
      } else {
        navigate("/my-analysis");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ошибка подтверждения");
    }
  };

  return (
    <div className="verify-code-form">
      <h2>Подтвердите вход</h2>
      <p>Код отправлен на <strong>{email}</strong></p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Введите код"
        className="input-react"
      />
      <button onClick={handleVerify} className="submit-button">
        Подтвердить
      </button>
    </div>
  );
};

export default LoginVerify;
