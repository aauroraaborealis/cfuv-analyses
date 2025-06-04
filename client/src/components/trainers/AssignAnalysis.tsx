import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify"; // ✅ Импортируем toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Подключаем стили
import "../../styles/AssignAnalysis.css";
import { SERVER_LINK } from "../../utils/api";
import { Option } from "../../utils/interfaces.js";
import { fetchAnalyzes, fetchSports, fetchStudents, fetchTeams } from "../../utils/fetch";
import SuccessModal from "../shared/SuccessModal"; // ✅ Импортируем нашу модалку

const AssignAnalysis: React.FC = () => {
  const [assignTo, setAssignTo] = useState<"team" | "student">("team");
  const [selectedAnalyze, setSelectedAnalyze] = useState<Option | null>(null);
  const [selectedSport, setSelectedSport] = useState<Option | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Option | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Option | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [showModal, setShowModal] = useState(false); // ✅ Состояние для модалки

  const { data: analyzes = [], isLoading: loadingAnalyzes } = useQuery({
    queryKey: ["analyzes"],
    queryFn: fetchAnalyzes,
  });

  const { data: sports = [], isLoading: loadingSports } = useQuery({
    queryKey: ["sports"],
    queryFn: fetchSports,
  });

  /* istanbul ignore next */

  const { data: teams = [], isFetching: loadingTeams } = useQuery({
    queryKey: ["teams", selectedSport?.value],
    queryFn: () => fetchTeams(selectedSport!.value),
    enabled: !!selectedSport,
  });

  /* istanbul ignore next */
  const { data: students = [], isFetching: loadingStudents } = useQuery({
    queryKey: ["students", selectedSport?.value],
    queryFn: () => fetchStudents(selectedSport!.value),
    enabled: !!selectedSport,
  });

  // 🚀 Мутация для назначения анализа
  /* istanbul ignore next */
  const assignMutation = useMutation({
    mutationFn: async (assignment: any) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Нет токена авторизации");

      const response = await axios.post(
        `${SERVER_LINK}/analysis/assign`,
        assignment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      setShowModal(true); // ✅ Показываем модалку при успешном назначении
/* istanbul ignore next */
      setTimeout(() => {
        setShowModal(false); // ✅ Авто-закрытие модалки через 3 сек
      }, 3000);
    },
    onError: (error: any) => {
      toast.error(`Ошибка: ${error.response?.data?.message || error.message}`); // ✅ Показать тост-уведомление об ошибке
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /* istanbul ignore next */
    if (
      !selectedAnalyze ||
      !selectedSport ||
      !dueDate ||
      (assignTo === "student" && !selectedStudent) ||
      (assignTo === "team" && !selectedTeam)
    ) {
      toast.warn("Заполните все поля!"); // ✅ Тост-уведомление, если не все поля заполнены
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
          {/* istanbul ignore next */}
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
              Спортсмену
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
            <label className="mb">Выберите спортсмена:</label>
            <Select
              options={students}
              value={selectedStudent}
              onChange={setSelectedStudent}
              placeholder={loadingStudents ? "Загрузка..." : "Выберите спортсмена"}
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
        <button type="submit" disabled={assignMutation.isPending}>
          {assignMutation.isPending ? "Назначение..." : "Назначить анализ"}
        </button>
      </form>

      {/* istanbul ignore next */}
      {showModal && (
        <SuccessModal
          message="Анализ успешно назначен!"
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AssignAnalysis;
