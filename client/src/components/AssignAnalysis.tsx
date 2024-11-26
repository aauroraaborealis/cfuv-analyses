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
  const [students, setStudents] = useState<Option[]>([]);
  const [assignTo, setAssignTo] = useState<"team" | "student">("team");
  const [selectedAnalyze, setSelectedAnalyze] = useState<Option | null>(null);
  const [selectedSport, setSelectedSport] = useState<Option | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Option | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Option | null>(null);
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

  // Загружаем студентов по выбранному виду спорта
  useEffect(() => {
    if (selectedSport) {
      const fetchStudentsBySport = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/students/sport?sport_id=${selectedSport.value}`
          );
          const data = await response.json();
          setStudents(
            data.map((student: any) => ({
              value: student.student_id,
              label: `${student.first_name} ${student.last_name}`,
            }))
          );
        } catch (error) {
          console.error("Ошибка загрузки студентов:", error);
        }
      };

      fetchStudentsBySport();
    } else {
      setStudents([]);
      setSelectedStudent(null); // Сбрасываем выбранного студента
    }
  }, [selectedSport]);

  // Отправка назначения анализа
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedAnalyze ||
      !selectedSport ||
      !dueDate ||
      (assignTo === "student" && !selectedStudent) ||
      (assignTo === "team" && !selectedTeam)
    ) {
      alert("Заполните все поля!");
      return;
    }

    const assignment = {
      analyze_id: selectedAnalyze.value,
      sport_id: selectedSport.value,
      team_id: assignTo === "team" ? selectedTeam?.value : null,
      student_id: assignTo === "student" ? selectedStudent?.value : null,
      due_date: dueDate,
    };

    console.log(assignment);

    try {
      const response = await fetch(
        "http://localhost:8080/api/analysis/assign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assignment),
        }
      );

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
            onChange={(option) => {
              setSelectedSport(option); // Обновляем выбранный вид спорта
              setSelectedStudent(null); // Сбрасываем выбранного студента
              setSelectedTeam(null); // Сбрасываем выбранную команду
            }}
            placeholder="Выберите вид спорта"
            isClearable
            isSearchable
          />
        </div>
        <div>
          <label>Назначить:</label>
          <div>
            <label>
              <input
                type="radio"
                value="team"
                checked={assignTo === "team"}
                onChange={() => setAssignTo("team")}
              />
              Команде
            </label>
            <label>
              <input
                type="radio"
                value="student"
                checked={assignTo === "student"}
                onChange={() => setAssignTo("student")}
              />
              Студенту
            </label>
          </div>
        </div>
        {assignTo === "team" && (
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
        )}
        {assignTo === "student" && (
          <div>
            <label>Выберите студента:</label>
            <Select
              options={students}
              value={selectedStudent}
              onChange={setSelectedStudent}
              placeholder="Выберите студента"
              isClearable
              isSearchable
            />
          </div>
        )}
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
