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

  const analyzeFields: { [key: string]: string[] } = {
    "Антропометрия и биоимпедансометрия": ["Рост", "Вес", "Окружность талии", "Окружность бедер"],
    "Клинический анализ крови": ["Гемоглобин", "Глюкоза", "Холестерин"],
    "Клинический анализ мочи": ["Белок", "Лейкоциты", "Эритроциты"],
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

  return (
    <div>
      <h2>Сдать анализ</h2>
      <p>
        <strong>Анализ:</strong> {analyze_name}
      </p>
      <form onSubmit={handleSubmit}>
        {analyzeFields[analyze_name]?.map((field) => (
          <div key={field} style={{ marginBottom: "10px" }}>
            <label>
              {field}:
              <input
                type="text"
                value={formData[field] || ""}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
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
