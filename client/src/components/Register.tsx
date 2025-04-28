import React, { useEffect, useState } from "react";
import "../styles/Register.css";
import RegisterStudent from "./RegisterStudent";
import RegisterTrainer from "./RegisterTrainer";
import { getRoleFromToken, isAuthenticated } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [role, setRole] = useState<"student" | "trainer" | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getRoleFromToken();
      navigate(role === "trainer" ? "/analysis-results" : "/my-analysis");
    }
  }, [navigate]);

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      <div className="role-selection">
        <label className="role-option">
          <input
            type="radio"
            name="role"
            value="student"
            checked={role === "student"}
            onChange={() => setRole("student")}
          />
          Я спортсмен
        </label>

        <label className="role-option">
          <input
            type="radio"
            name="role"
            value="trainer"
            checked={role === "trainer"}
            onChange={() => setRole("trainer")}
          />
          Я медицинский работник
        </label>
      </div>

      {role === "student" && <RegisterStudent />}
      {role === "trainer" && <RegisterTrainer />}
    </div>
  );
};

export default Register;
