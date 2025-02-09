import { useState } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import axios from "axios";
import Select from "react-select";
import "../../styles/AssignAnalysis.css";
import { SERVER_LINK } from "../../utils/api";
import { Option } from "../../utils/interfaces.js";

const AssignAnalysis: React.FC = () => {
  const [assignTo, setAssignTo] = useState<"team" | "student">("team");
  const [selectedAnalyze, setSelectedAnalyze] = useState<Option | null>(null);
  const [selectedSport, setSelectedSport] = useState<Option | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Option | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Option | null>(null);
  const [dueDate, setDueDate] = useState("");

  // Функции для запроса данных
  const fetchAnalyzes = async () => {
    const { data } = await axios.get(`${SERVER_LINK}/analysis`);
    return data.map((analyze: any) => ({
      value: analyze.analyze_id,
      label: analyze.analyze_name,
    }));
  };

  const fetchSports = async () => {
    const { data } = await axios.get(`${SERVER_LINK}/sport/list`);
    return data.map((sport: any) => ({
      value: sport.sport_id,
      label: sport.sport_name,
    }));
  };

  const fetchTeams = async (sportId: string) => {
    const { data } = await axios.get(
      `${SERVER_LINK}/team/list?sport_id=${sportId}`
    );
    return data.map((team: any) => ({
      value: team.team_id,
      label: team.team_name,
    }));
  };

  const fetchStudents = async (sportId: string) => {
    const { data } = await axios.get(
      `${SERVER_LINK}/students/sport?sport_id=${sportId}`
    );
    return data.map((student: any) => ({
      value: student.student_id,
      label: `${student.first_name} ${student.last_name}`,
    }));
  };

  // Запросы через `useQuery`
  const { data: analyzes = [], isLoading: loadingAnalyzes } = useQuery({
    queryKey: ["analyzes"],
    queryFn: fetchAnalyzes,
  });

  const { data: sports = [], isLoading: loadingSports } = useQuery({
    queryKey: ["sports"],
    queryFn: fetchSports,
  });

  const { data: teams = [], isFetching: loadingTeams } = useQuery({
    queryKey: ["teams", selectedSport?.value],
    queryFn: () => fetchTeams(selectedSport!.value),
    enabled: !!selectedSport,
  });

  const { data: students = [], isFetching: loadingStudents } = useQuery({
    queryKey: ["students", selectedSport?.value],
    queryFn: () => fetchStudents(selectedSport!.value),
    enabled: !!selectedSport,
  });

  // 🚀 Мутация для назначения анализа
  const assignMutation = useMutation({
    mutationFn: async (assignment: any) => {
      const response = await axios.post(
        `${SERVER_LINK}/analysis/assign`,
        assignment
      );
      return response.data;
    },
    onSuccess: () => {
      alert("Анализ успешно назначен");
    },
    onError: (error: any) => {
      alert(
        `Ошибка назначения анализа: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    assignMutation.mutate({
      analyze_id: selectedAnalyze.value,
      sport_id: selectedSport.value,
      team_id: assignTo === "team" ? selectedTeam?.value : null,
      student_id: assignTo === "student" ? selectedStudent?.value : null,
      due_date: dueDate,
    });
  };

  return (
    <div className="container assign-cont">
      <h2>Назначение анализа</h2>
      <form onSubmit={handleSubmit} className="assign-form">
        <div className="column">
          <label className="mb">Выберите анализ:</label>
          <Select
            options={analyzes}
            value={selectedAnalyze}
            onChange={setSelectedAnalyze}
            placeholder={loadingAnalyzes ? "Загрузка..." : "Выберите анализ"}
            isClearable
            isSearchable
          />
        </div>
        <div className="column">
          <label className="mb">Выберите вид спорта:</label>
          <Select
            options={sports}
            value={selectedSport}
            onChange={(option) => {
              setSelectedSport(option);
              setSelectedStudent(null);
              setSelectedTeam(null);
            }}
            placeholder={loadingSports ? "Загрузка..." : "Выберите вид спорта"}
            isClearable
            isSearchable
          />
        </div>
        <div className="column">
          <label className="mb">Назначить:</label>
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
          <div className="column">
            <label className="mb">Выберите команду:</label>
            <Select
              options={teams}
              value={selectedTeam}
              onChange={setSelectedTeam}
              placeholder={loadingTeams ? "Загрузка..." : "Выберите команду"}
              isClearable
              isSearchable
            />
          </div>
        )}
        {assignTo === "student" && (
          <div className="column">
            <label className="mb">Выберите студента:</label>
            <Select
              options={students}
              value={selectedStudent}
              onChange={setSelectedStudent}
              placeholder={
                loadingStudents ? "Загрузка..." : "Выберите студента"
              }
              isClearable
              isSearchable
            />
          </div>
        )}
        <div className="column">
          <label className="mb">Дата сдачи анализа:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="input-react"
          />
        </div>
        <button
          type="submit"
          disabled={assignMutation.isPending}
        >
          {assignMutation.isPending ? "Назначение..." : "Назначить анализ"}{" "}
        </button>
      </form>
    </div>
  );
};

export default AssignAnalysis;
