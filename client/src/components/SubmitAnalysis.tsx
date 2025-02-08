import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import analyzeFields from "../utils/analyzeFields";
import "../styles/AnalysisForm.css";

interface FormData {
  [key: string]: string;
}

const SubmitAnalysis: React.FC = () => {
  const { assignment_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { analyze_name } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Нет токена авторизации");

      const response = await fetch(
        "http://localhost:8080/api/analysis/submit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignment_id,
            analyze_data: formData,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка отправки анализа");
      }

      alert("Анализ успешно отправлен!");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (type: string, value: string): boolean => {
    // Разрешаем пустую строку
    if (value === "") return true;

    if (type === "number") {
      return /^\d*\.?\d*$/.test(value);
    }
    if (type === "integer") {
      return /^\d*$/.test(value);
    }
    return true;
  };

  return (
    <div className="container analysis-form">
      <h2>{analyze_name}</h2>
      <form onSubmit={handleSubmit}>
        {analyzeFields[analyze_name]?.map((field) => (
          <div key={field.label} className="form-ques">
            <label className="column">
              {field.label}:
              <input
                type="text"
                value={formData[field.label] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (validateInput(field.type, value)) {
                    handleInputChange(field.label, value);
                  }
                }}
                required
                style={{ marginTop: "5px" }}
                className="input-react"
              />
            </label>
          </div>
        ))}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Отправка..." : "Отправить"}
        </button>
      </form>
    </div>
  );
};

export default SubmitAnalysis;
