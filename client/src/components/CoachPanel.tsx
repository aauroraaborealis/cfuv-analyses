import React, { useState, useEffect } from "react";

interface Sport {
  id: number;
  name: string;
}

interface Team {
  id: number;
  team_name: string; // Поле команды из API
}

interface Analysis {
  id: number;
  name: string; // Название анализа
}

const CoachPanel: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null);
  const [analysisDate, setAnalysisDate] = useState("");

  // Загрузка списка видов спорта
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/sports");
        const data = await response.json();
        setSports(data);
      } catch (error) {
        console.error("Ошибка загрузки видов спорта:", error);
      }
    };
    fetchSports();
  }, []);

  // Загрузка списка анализов
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/analyses");
        const data = await response.json();
        setAnalyses(data);
      } catch (error) {
        console.error("Ошибка загрузки видов анализов:", error);
      }
    };
    fetchAnalyses();
  }, []);

  // Обработка изменения вида спорта
  const handleSportChange = async (sportId: number) => {
    setSelectedSport(sportId);
    setSelectedTeam(null); // Сброс команды при смене спорта

    try {
      const response = await fetch(
        `http://localhost:8080/api/teams?sport_id=${sportId}`
      );
      const data = await response.json();
      setTeams(data); // Установка списка команд
    } catch (error) {
      console.error("Ошибка загрузки команд:", error);
    }
  };

  const handleAssignAnalysis = async () => {
    if (!selectedSport || !selectedTeam || !selectedAnalysis || !analysisDate) {
      alert("Пожалуйста, выберите все параметры и дату анализа.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/assign-analysis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            analysis_id: selectedAnalysis,
            sport_id: selectedSport,
            team_id: selectedTeam,
            due_date: analysisDate, // Передаём в due_date
          }),
        }
      );

      let a = JSON.stringify({
        analysis_id: selectedAnalysis,
        sport_id: selectedSport,
        team_id: selectedTeam,
        due_date: analysisDate, // Передаём в due_date
      });

      console.log(a);

      if (response.ok) {
        alert("Анализ успешно назначен!");
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || "Неизвестная ошибка"}`);
      }
    } catch (error) {
      console.error("Ошибка при назначении анализа:", error);
      alert("Произошла ошибка.");
    }
  };

  return (
    <div className="coach-panel">
      <h2>Управление анализами</h2>
      <div className="form">
        <div>
          <label>Выберите вид спорта:</label>
          <select
            value={selectedSport || ""}
            onChange={(e) => handleSportChange(Number(e.target.value))}
          >
            <option value="">Выберите</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSport && (
          <div>
            {teams.length > 0 ? (
              <div>
                <label>Выберите команду:</label>
                <select
                  value={selectedTeam || ""}
                  onChange={(e) => setSelectedTeam(Number(e.target.value))}
                >
                  <option value="">Выберите</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="no-teams-message">
                Для выбранного вида спорта команд нет.
              </div>
            )}
          </div>
        )}

        {selectedSport && selectedTeam && (
          <div>
            <label>Выберите тип анализа:</label>
            <select
              value={selectedAnalysis || ""}
              onChange={(e) => setSelectedAnalysis(Number(e.target.value))}
            >
              <option value="">Выберите</option>
              {analyses.map((analysis) => (
                <option key={analysis.id} value={analysis.id}>
                  {analysis.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSport && selectedTeam && selectedAnalysis && (
          <div>
            <label>Дата анализа:</label>
            <input
              type="date"
              value={analysisDate}
              onChange={(e) => setAnalysisDate(e.target.value)}
            />
          </div>
        )}

        <button onClick={handleAssignAnalysis}>Назначить анализ</button>
      </div>
    </div>
  );
};

export default CoachPanel;
