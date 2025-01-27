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
      { label: "ИМТ", type: "number" },
      { label: "АКМ", type: "number" },
      { label: "ДАКМ", type: "number" },
      { label: "ЖМ", type: "number" },
      { label: "ДЖМ", type: "number" },
      { label: "СКМ", type: "number" },
      { label: "ДСКМ", type: "number" },
      { label: "ОО", type: "number" },
      { label: "ОЖ", type: "number" },
      { label: "ВЖ", type: "number" },
      { label: "ФУ", type: "number" },
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
    "Тонометрия": [
      { label: "АДс", type: "number" },
      { label: "АДд", type: "number" },
    ],
    "Ритмокардиография": [
      { label: "ЧСС", type: "number" },
      { label: "RMSSD", type: "number" },
      { label: "CV", type: "number" },
      { label: "TP", type: "number" },
      { label: "HF", type: "number" },
      { label: "LF", type: "number" },
      { label: "VLF", type: "number" },
      { label: "СФ", type: "number" },
      { label: "SI", type: "number" },
      { label: "Тип вегетативной регуляции", type: "text" },
    ],
    "Частометрия": [
      { label: "КЧССМ", type: "number" },
      { label: "Максимальная частота движений", type: "number" },
    ],
    "Хронорефлексометрия": [
      { label: "ПЗМР", type: "number" },
      { label: "СДР", type: "number" },
      { label: "РДО", type: "number" },
    ],
    "Скоростно-силовые и силовые качества": [
      { label: "Кистевая динамометрия (сила)", type: "number" },
      { label: "Кистевая динамометрия (выносливость)", type: "number" },
      { label: "Высота прыжка из приседа (SJ)", type: "number" },
      { label: "Высота прыжка вверх без взмаха руками", type: "number" },
      { label: "Высота прыжка вверх со взмахом руками", type: "number" },
      { label: "CMJ/SJ", type: "number" },
      { label: "Мощность прыжка", type: "number" },
    ],
    "Стабилометрия": [
      { label: "Проба Ромберга", type: "text" },
      { label: "S (о)", type: "number" },
      { label: "V (о)", type: "number" },
      { label: "S (з)", type: "number" },
      { label: "V (з)", type: "number" },
      { label: "P (о)", type: "number" },
      { label: "P3", type: "number" },
      { label: "Кэ", type: "number" },
      { label: "Динамическая проба", type: "text" },
      { label: "Стресс-проба", type: "text" },
    ],
    "Проба с приседаниями": [
      { label: "ЧСС покоя", type: "number" },
      { label: "Скорость восстановления ЧСС", type: "number" },
      { label: "Приковая ЧСС", type: "number" },
      { label: "Показатели ВСР", type: "text" },
    ],
    "Эргометрические тесты": [
      { label: "Общий объём работы", type: "number" },
      { label: "ЧСС", type: "number" },
      { label: "Пиковое ЧСС", type: "number" },
      { label: "ЧССАэП", type: "number" },
      { label: "ЧССАнП", type: "number" },
      { label: "VO2", type: "number" },
      { label: "VO2max", type: "number" },
      { label: "VO2АэП", type: "number" },
      { label: "VO2АнП", type: "number" },
      { label: "Мощность/скорость АэП", type: "number" },
      { label: "Мощность/скорость АнП", type: "number" },
      { label: "La", type: "number" },
      { label: "ЛВ", type: "number" },
      { label: "ДК", type: "number" },
    ],
    "Ортостатическая проба": [
      { label: "ЧСС", type: "number" },
      { label: "АДс", type: "number" },
      { label: "АДд", type: "number" },
    ],
    "Специальные функциональные пробы": [
      { label: "ЧСС", type: "number" },
      { label: "La", type: "number" },
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
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (type: string, value: string): boolean => {
    if (type === "number") {
      return /^\d+(\.\d+)?$/.test(value);
    }
    if (type === "integer") {
      return /^\d+$/.test(value);
    }
    return true;
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
