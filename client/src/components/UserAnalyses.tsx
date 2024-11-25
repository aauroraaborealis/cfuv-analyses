import React, { useState, useEffect } from "react";

interface Analysis {
  id: number;
  analysis_name: string;
  due_date: string;
  team_name: string; // Команда или личное назначение
}

const UserAnalyses: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalyses = async () => {
      setIsLoading(true);
      setError("");

      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          setError("Данные пользователя не найдены. Войдите в систему.");
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        const response = await fetch(
          `http://localhost:8080/api/user-analyses?user_id=${user.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setAnalyses(data);
        } else {
          setError("Не удалось загрузить анализы.");
        }
      } catch (error) {
        console.error("Ошибка загрузки анализов:", error);
        setError("Произошла ошибка при загрузке анализов.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-analyses">
      <h2>Ваши назначенные анализы</h2>
      {analyses.length > 0 ? (
        <ul>
          {analyses.map((analysis) => (
            <li key={analysis.id}>
              <p>
                <strong>Название анализа:</strong> {analysis.analysis_name}
              </p>
              <p>
                <strong>Дата сдачи:</strong>{" "}
                {new Date(analysis.due_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Тип назначения:</strong> {analysis.team_name}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет назначенных анализов.</p>
      )}
    </div>
  );
};

export default UserAnalyses;
