import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import analyzeFields from "../../utils/analyzeFields";
import { useMutation } from "@tanstack/react-query";
import "../../styles/AnalysisForm.css";
import { SERVER_LINK } from "../../utils/api";
import axios from "axios";
import SuccessModal from "../shared/SuccessModal"; // ✅ Импортируем модалку

interface FormData {
  [key: string]: string;
}

const SubmitAnalysis: React.FC = () => {
  const { assignment_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { analyze_name } = location.state || {};
  const [formData, setFormData] = useState<FormData>({});
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // ✅ Добавляем состояние модалки

  /* istanbul ignore next */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* istanbul ignore next */
  const validateInput = (type: string, value: string): boolean => {
    if (value === "") return true;
    if (type === "number") {
      return /^\d*\.?\d*$/.test(value);
    }
    if (type === "integer") {
      return /^\d*$/.test(value);
    }
    return true;
  };

  // Мутация для отправки данных анализа
  /* istanbul ignore next */
  const mutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Нет токена авторизации");

      const response = await axios.post(
        `${SERVER_LINK}/analysis/submit`,
        {
          assignment_id,
          analyze_data: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false); // ✅ Авто-скрытие через 3 секунды
        navigate("/my-analysis"); // ✅ Переход после закрытия модалки
      }, 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || "Неизвестная ошибка");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="container analysis-form">
      <h2>{analyze_name}</h2>
      <form onSubmit={handleSubmit}>
        {analyzeFields[analyze_name]?.map((field) => (
          <div key={field.label} className="form-ques">
            <label className="column">
              {/* istanbul ignore next */}
              {field.label}:
              {/* istanbul ignore next */}
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
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Отправка..." : "Отправить"}
        </button>
      </form>

      {/* ✅ Показываем модалку при успешной отправке */}
      {showModal && (
        <SuccessModal
          message="Анализ успешно отправлен!"
          onClose={() => {
            setShowModal(false);
            navigate("/my-analysis"); // ✅ Перенаправление после закрытия вручную
          }}
        />
      )}
    </div>
  );
};

export default SubmitAnalysis;
