// import React, { useState, useEffect } from "react";
// import Select from "react-select";

// interface SportOption {
//   value: string;
//   label: string;
// }

// interface TeamOption {
//   value: string;
//   label: string;
// }

// const AssignAnalysis: React.FC = () => {
//   const [sports, setSports] = useState<SportOption[]>([]);
//   const [teams, setTeams] = useState<TeamOption[]>([]);
//   const [sport, setSport] = useState<SportOption | null>(null);
//   const [team, setTeam] = useState<TeamOption | null>(null);
//   const [analysisType, setAnalysisType] = useState("");
//   const [dueDate, setDueDate] = useState("");

//   // Fetch sports on mount
//   useEffect(() => {
//     const fetchSports = async () => {
//       try {
//         const response = await fetch("http://localhost:8080/api/sport/list");
//         const data = await response.json();
//         const formattedSports = data.map((sport: any) => ({
//           value: sport.sport_id,
//           label: sport.sport_name,
//         }));
//         setSports(formattedSports);
//       } catch (error) {
//         console.error("Ошибка загрузки видов спорта:", error);
//       }
//     };

//     fetchSports();
//   }, []);

//   // Fetch teams when a sport is selected
//   useEffect(() => {
//     if (sport) {
//       const fetchTeams = async () => {
//         try {
//           const response = await fetch(
//             `http://localhost:8080/api/team/list?sport_id=${sport.value}`
//           );
//           const data = await response.json();
//           const formattedTeams = data.map((team: any) => ({
//             value: team.team_id,
//             label: team.team_name,
//           }));
//           setTeams(formattedTeams);
//         } catch (error) {
//           console.error("Ошибка загрузки команд:", error);
//         }
//       };

//       fetchTeams();
//     } else {
//       setTeams([]);
//     }
//   }, [sport]);

//   const handleAssign = async () => {
//     if (!sport || !analysisType || !dueDate) {
//       alert("Выберите вид спорта, тип анализа и дату.");
//       return;
//     }

//     const assignment = {
//       sport_id: sport.value,
//       team_id: team?.value || null,
//       analysis_type: analysisType,
//       due_date: dueDate,
//     };

//     try {
//       const response = await fetch("http://localhost:8080/api/analysis/assign", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(assignment),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         alert(`Ошибка назначения анализа: ${error.message}`);
//         return;
//       }

//       alert("Анализ успешно назначен!");
//     } catch (error) {
//       console.error("Ошибка назначения анализа:", error);
//       alert("Ошибка назначения анализа");
//     }
//   };

//   return (
//     <div className="assign-analysis-form">
//       <h2>Назначить анализ</h2>

//       <div className="column">
//         <label>Вид спорта:</label>
//         <Select
//           options={sports}
//           value={sport}
//           onChange={setSport}
//           placeholder="Выберите вид спорта"
//           isClearable
//           isSearchable
//         />
//       </div>

//       <div className="column">
//         <label>Команда:</label>
//         <Select
//           options={teams}
//           value={team}
//           onChange={setTeam}
//           placeholder="Выберите команду (необязательно)"
//           isClearable
//           isSearchable
//         />
//       </div>

//       <div className="column">
//         <label>Тип анализа:</label>
//         <input
//           type="text"
//           value={analysisType}
//           onChange={(e) => setAnalysisType(e.target.value)}
//           placeholder="Введите тип анализа"
//         />
//       </div>

//       <div className="column">
//         <label>Дата сдачи:</label>
//         <input
//           type="date"
//           value={dueDate}
//           onChange={(e) => setDueDate(e.target.value)}
//         />
//       </div>

//       <button onClick={handleAssign} className="submit-button">
//         Назначить анализ
//       </button>
//     </div>
//   );
// };

// export default AssignAnalysis;


import React, { useState, useEffect } from "react";
import Select from "react-select";

interface Option {
  value: string;
  label: string;
}

const AssignAnalysis: React.FC = () => {
  const [analyzes, setAnalyzes] = useState<Option[]>([]);
  const [sports, setSports] = useState<Option[]>([]);
  const [teams, setTeams] = useState<Option[]>([]);
  const [selectedAnalyze, setSelectedAnalyze] = useState<Option | null>(null);
  const [selectedSport, setSelectedSport] = useState<Option | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Option | null>(null);
  const [dueDate, setDueDate] = useState("");

  // Загружаем анализы
  useEffect(() => {
    const fetchAnalyzes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/analysis");
        const data = await response.json();
        setAnalyzes(
          data.map((analyze: any) => ({
            value: analyze.analyze_id,
            label: analyze.analyze_name,
          }))
        );
      } catch (error) {
        console.error("Ошибка загрузки анализов:", error);
      }
    };

    fetchAnalyzes();
  }, []);

  // Загружаем виды спорта
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/sport/list");
        const data = await response.json();
        setSports(
          data.map((sport: any) => ({
            value: sport.sport_id,
            label: sport.sport_name,
          }))
        );
      } catch (error) {
        console.error("Ошибка загрузки видов спорта:", error);
      }
    };

    fetchSports();
  }, []);

  // Загружаем команды по выбранному виду спорта
  useEffect(() => {
    if (selectedSport) {
      const fetchTeams = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/team/list?sport_id=${selectedSport.value}`
          );
          const data = await response.json();
          setTeams(
            data.map((team: any) => ({
              value: team.team_id,
              label: team.team_name,
            }))
          );
        } catch (error) {
          console.error("Ошибка загрузки команд:", error);
        }
      };

      fetchTeams();
    } else {
      setTeams([]);
    }
  }, [selectedSport]);

  // Отправка назначения анализа
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAnalyze || !selectedSport || !selectedTeam || !dueDate) {
      alert("Заполните все поля!");
      return;
    }

    const assignment = {
      analyze_id: selectedAnalyze.value,
      sport_id: selectedSport.value,
      team_id: selectedTeam.value,
      due_date: dueDate,
    };

    console.log(assignment);

    try {
      const response = await fetch("http://localhost:8080/api/analysis/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Ошибка назначения анализа: ${error.message}`);
        return;
      }

      alert("Анализ успешно назначен!");
    } catch (error) {
      console.error("Ошибка назначения анализа:", error);
    }
  };

  return (
    <div>
      <h2>Назначение анализа</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Выберите анализ:</label>
          <Select
            options={analyzes}
            value={selectedAnalyze}
            onChange={setSelectedAnalyze}
            placeholder="Выберите анализ"
            isClearable
            isSearchable
          />
        </div>
        <div>
          <label>Выберите вид спорта:</label>
          <Select
            options={sports}
            value={selectedSport}
            onChange={setSelectedSport}
            placeholder="Выберите вид спорта"
            isClearable
            isSearchable
          />
        </div>
        <div>
          <label>Выберите команду:</label>
          <Select
            options={teams}
            value={selectedTeam}
            onChange={setSelectedTeam}
            placeholder="Выберите команду"
            isClearable
            isSearchable
          />
        </div>
        <div>
          <label>Дата сдачи анализа:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Назначить анализ</button>
      </form>
    </div>
  );
};

export default AssignAnalysis;
