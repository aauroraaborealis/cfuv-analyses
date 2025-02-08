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

interface DetailedAnalysis extends Analysis {
  results: string; 
  details: string; 
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
          throw new Error(
            "Вы не авторизованы. Выполните вход или зарегестрируйтесь"
          );
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
        console.log(message);
        const newAnalysis = message.data as Analysis;
        console.log(newAnalysis);
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


  const fetchDetails = async (assignmentId: string, analyzeName: string) => {
    setLoadingDetails(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Вы не авторизованы. Выполните вход.");
      setLoadingDetails(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/analysis/details`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignment_id: assignmentId,
            analyze_name: analyzeName,
          }),
        }
      );

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

  if (loading) return <p>Загрузка...</p>;
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
                          analysis.analyze_name
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
                // <div className="analysis-details">
                <div className={`analysis-details ${selectedAnalysis === analysis.assignment_id ? 'show' : ''}`}>
                  {loadingDetails ? (
                    <p>Загрузка данных...</p>
                  ) : detailedAnalysis &&
                    detailedAnalysis.results.length > 0 ? (
                    <div className="details-more">
                      {Object.entries(detailedAnalysis.results[0]).map(
                        ([key, value]) => (
                          <p key={key}>
                            {key}: {value}
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
