import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

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

  const analyzeFields: { [key: string]: { label: string; type: string }[] } = {
    "Антропометрия и биоимпедансометрия": [
      { label: "Рост", type: "number" },
      { label: "Вес", type: "number" },
      { label: "Окружность талии", type: "number" },
      { label: "Окружность бедер", type: "number" },
    ],
    "Клинический анализ крови": [
      { label: "Гемоглобин", type: "number" },
      { label: "Глюкоза", type: "number" },
      { label: "Холестерин", type: "number" },
    ],
    "Клинический анализ мочи": [
      { label: "Белок", type: "number" },
      { label: "Лейкоциты", type: "integer" },
      { label: "Эритроциты", type: "integer" },
    ],
  };

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

      const response = await fetch("http://localhost:8080/api/analysis/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id,
          analyze_data: formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка отправки анализа");
      }

      alert("Анализ успешно отправлен!");
      navigate("/"); // Перенаправляем на главную страницу
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (type: string, value: string): boolean => {
    if (type === "number") {
      return /^\d+(\.\d+)?$/.test(value); // Допускаются числа с точкой
    }
    if (type === "integer") {
      return /^\d+$/.test(value); // Только целые числа
    }
    return true; // Если тип не указан, пропускаем валидацию
  };

  return (
    <div className="container">
        <h2>{analyze_name}</h2> 
      <form onSubmit={handleSubmit}>
        {analyzeFields[analyze_name]?.map((field) => (
          <div key={field.label} style={{ marginBottom: "10px" }}>
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
