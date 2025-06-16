import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/UserAnalyses.css";
import { apiRequest, SERVER_LINK, WS_LINK } from "../../utils/api";
import Loading from "../Loading";

interface Analysis {
  assignment_id: string;
  analyze_name: string;
  analyze_id: string;
  scheduled_date: string;
  assigned_to_team: boolean;
  is_submitted: boolean;
}

interface AnalysisResult {
  parameter_id: string;
  parameter_name: string;
  value: string;
  unit: string;
  is_normal: boolean;
  created_at: string;
}

interface DetailedAnalysis {
  results: AnalysisResult[];
}

const UserAnalyses: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] =
    useState<DetailedAnalysis | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async (token: string) => {
      try {
        const data = await apiRequest<{ analyses: Analysis[] }>(
          "analysis/user",
          "GET",
          null,
          token
        );
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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Вы не авторизованы. Выполните вход.");
      return;
    } else {
      fetchAnalyses(token);
    }

    const ws = new WebSocket(`${WS_LINK}?token=${encodeURIComponent(token)}`);
    ws.onopen = () => {
      console.log("WebSocket соединение установлено.");
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
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

  const fetchDetails = async (assignmentId: string, analyze_id: string) => {
    setLoadingDetails(true);
    setError(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Вы не авторизованы. Выполните вход.");
      setLoadingDetails(false);
      return;
    }

    try {
      const response = await fetch(`${SERVER_LINK}/analysis/detailed-results`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          analyze_id: analyze_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка запроса деталей анализа");
      }

      const data = await response.json();
      setDetailedAnalysis(data);
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container">
      <h2 className="analysis-header">Назначенные вам анализы</h2>
      {analyses.length === 0 ? (
        <p>У вас нет назначенных анализов.</p>
      ) : (
        <ul className="a-ul">
          {analyses.map((analysis) => (
            <>
              <li key={analysis.assignment_id} className="analysis-list">
                <div className="analysis-text">
                  <p className="analisys-name">{analysis.analyze_name}</p>
                  <p className="analisys-date">
                    Дата сдачи:{" "}
                    {new Date(analysis.scheduled_date).toLocaleDateString()}
                  </p>
                  <p className="analysis-assigned">
                    Назначен{" "}
                    {analysis.assigned_to_team
                      ? "командe, в которой вы состоите"
                      : "персонально вам"}
                  </p>
                </div>
                {analysis.is_submitted ? (
                  <button
                    className={
                      selectedAnalysis === analysis.assignment_id
                        ? "analysis-res-div active"
                        : "analysis-res-div"
                    }
                    onClick={() => {
                      if (selectedAnalysis === analysis.assignment_id) {
                        setSelectedAnalysis(null); // Скрыть блок
                        setDetailedAnalysis(null);
                      } else {
                        setSelectedAnalysis(analysis.assignment_id);
                        fetchDetails(
                          analysis.assignment_id,
                          analysis.analyze_id
                        );
                      }
                    }}
                  >
                    {selectedAnalysis === analysis.assignment_id
                      ? "Скрыть"
                      : "Результаты"}
                  </button>
                ) : (
                  <button
                    className="submit-analysis-button"
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
              </li>
              {selectedAnalysis === analysis.assignment_id && (
                <div
                  className={`analysis-details ${selectedAnalysis === analysis.assignment_id ? "show" : ""}`}
                >
                  {loadingDetails ? (
                    <p>Загрузка данных...</p>
                  ) : detailedAnalysis &&
                    detailedAnalysis.results.length > 0 ? (
                    <div className="details-more">
                      {detailedAnalysis.results.map(
                        ({
                          parameter_id,
                          parameter_name,
                          value,
                          unit,
                          is_normal,
                        }) => (
                          <p
                            key={parameter_id}
                            style={{
                              color: is_normal ? "black" : "#911818",
                            }}
                          >
                            {parameter_name}: {value} {unit}
                          </p>
                        )
                      )}
                    </div>
                  ) : (
                    <p style={{ color: "red" }}>
                      Не удалось загрузить результаты или данных нет
                    </p>
                  )}
                </div>
              )}
            </>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserAnalyses;
