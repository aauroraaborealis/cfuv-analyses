import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UserAnalyses.css";


interface Analysis {
  assignment_id: string;
  analyze_name: string;
  scheduled_date: string;
  assigned_to_team: boolean;
  is_submitted: boolean;
}

const UserAnalyses: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Вы не авторизованы. Выполните вход.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8080/api/analysis/user",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Ошибка запроса");
        }

        const data = await response.json();

        const sortedAnalyses = data.analyses.sort(
          (a: Analysis, b: Analysis) => {
            if (a.is_submitted === b.is_submitted) {
              return (
                new Date(b.scheduled_date).getTime() -
                new Date(a.scheduled_date).getTime()
              );
            }
            return a.is_submitted ? 1 : -1;
          }
        );

        setAnalyses(sortedAnalyses);
      } catch (err: any) {
        setError(err.message || "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();

    // Устанавливаем WebSocket-соединение
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Вы не авторизованы. Выполните вход.");
      return;
    }

    const ws = new WebSocket("ws://localhost:8080", token);

    ws.onopen = () => {
      console.log("WebSocket соединение установлено.");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      console.log(message);

      if (message.type === "NEW_ANALYSIS") {
        const newAnalysis = message.data as Analysis;
        setAnalyses((prev) => [newAnalysis, ...prev]);
      }
    };

    ws.onerror = (error) => {
      console.error("Ошибка WebSocket:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket соединение закрыто.");
    };

    return () => {
      ws.close();
    };
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container">
      <h2>Назначенные анализы</h2>
      {analyses.length === 0 ? (
        <p>У вас нет назначенных анализов.</p>
      ) : (
        <ul className="a-ul">
          {analyses.map((analysis) => (
            <li key={analysis.assignment_id} className="analysis-list">
              <div className="analysis-text">
              <p>
                <strong>Анализ:</strong> {analysis.analyze_name}
              </p>
              <p>
                <strong>Дата сдачи:</strong>{" "}
                {new Date(analysis.scheduled_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Назначен:</strong>{" "}
                {analysis.assigned_to_team ? "Командe, в которой вы состоите" : "Лично вам"}
              </p>
              </div>
              {analysis.is_submitted ? (
                <p style={{ color: "green" }}>Анализ сдан</p>
              ) : (
                <button
                  onClick={() =>
                    navigate(`/submit-analysis/${analysis.assignment_id}`, {
                      state: {
                        analyze_name: analysis.analyze_name,
                      },
                    })
                  }
                >
                  Сдать
                </button>
              )}
              {/* <hr /> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserAnalyses;
