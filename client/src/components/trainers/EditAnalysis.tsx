import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select from "react-select";
import "../../styles/EditModal.css";
import { SERVER_LINK } from "../../utils/api";
import { Option } from "../../utils/interfaces.js";
import {
  fetchAnalyzes,
  fetchSports,
  fetchStudents,
  fetchTeams,
} from "../../utils/fetch";
import { toast, ToastContainer } from "react-toastify";
import SuccessModal from "../shared/SuccessModal";

interface EditAnalysisProps {
  assignmentId: string;
  onClose: () => void;
  onFullClose: () => void;
}

const fetchAnalysisDetails = async (assignmentId: string) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(
    `${SERVER_LINK}/assignment/${assignmentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

const EditAnalysis: React.FC<EditAnalysisProps> = ({
  assignmentId,
  onClose,
  onFullClose,
}) => {
  const { data: initialData, isLoading: loadingInitialData } = useQuery({
    queryKey: ["analysisDetails", assignmentId],
    queryFn: () => fetchAnalysisDetails(assignmentId),
    enabled: !!assignmentId,
  });

  const queryClient = useQueryClient();

  const [assignTo, setAssignTo] = useState<"team" | "student">("team");
  const [selectedAnalyze, setSelectedAnalyze] = useState<Option | null>(null);
  const [selectedSport, setSelectedSport] = useState<Option | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Option | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Option | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");

  useEffect(() => {
    if (initialData) {
      setSelectedAnalyze({
        value: initialData.analyze_id,
        label: initialData.analyze_name,
      });

      setDueDate(initialData.scheduled_date.split("T")[0]);

      setSelectedSport({
        value: initialData.sport_id,
        label: initialData.sport_name,
      });

      if (initialData.assigned_to_team) {
        setAssignTo("team");
        setSelectedTeam({
          value: initialData.team_id,
          label: initialData.team_name,
        });
      } else {
        setAssignTo("student");
        setSelectedStudent({
          value: initialData.student_id,
          label: `${initialData.student_first_name} ${initialData.student_last_name}`,
        });
      }
    }
  }, [initialData]);

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

  const updateMutation = useMutation({
    mutationFn: async (assignment: any) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Ошибка: Токен не найден, авторизуйтесь заново.");
        return;
      }

      const response = await axios.put(
        `${SERVER_LINK}/assignment/${assignmentId}`,
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
      setModalText("Анализ успешно обновлён!");
      setShowModal(true);
      queryClient.invalidateQueries({ queryKey: ["assignedAnalyses"] });

      setTimeout(() => {
        setShowModal(false);
        onFullClose();
      }, 3000);
    },
    onError: (error: any) => {
      toast.error(
        `Ошибка обновления анализа: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");
      await axios.delete(`${SERVER_LINK}/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      setModalText("Анализ успешно удалён!");
      setShowModal(true);
      queryClient.invalidateQueries({ queryKey: ["assignedAnalyses"] });

      setTimeout(() => {
        setShowModal(false);
        onFullClose();
      }, 3000);
    },
    onError: (error: any) => {
      toast.error(
        `Ошибка удаления: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedAnalyze ||
      !dueDate ||
      !selectedSport ||
      (assignTo === "student" && !selectedStudent) ||
      (assignTo === "team" && !selectedTeam)
    ) {
      toast.error("Заполните все поля!");
      return;
    }

    updateMutation.mutate({
      analyze_id: selectedAnalyze.value,
      sport_id: selectedSport.value,
      team_id: assignTo === "team" ? selectedTeam?.value : null,
      student_id: assignTo === "student" ? selectedStudent?.value : null,
      due_date: dueDate,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="buttons-cont">
          <button className="close-button" onClick={onClose}>
            <img src="/close.svg" alt="Закрыть" />
          </button>
        </div>
        <h2>Редактирование анализа</h2>
        {loadingInitialData ? (
          <p>Загрузка данных...</p>
        ) : (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="column">
              <label className="mb">Анализ:</label>
              <Select
                options={analyzes}
                value={selectedAnalyze}
                onChange={setSelectedAnalyze}
                placeholder={
                  loadingAnalyzes ? "Загрузка..." : "Выберите анализ"
                }
                isClearable
                isSearchable
              />
            </div>

            <div className="column">
              <label className="mb">Вид спорта:</label>
              <Select
                options={sports}
                value={selectedSport}
                onChange={(option) => {
                  setSelectedSport(option);
                  setSelectedStudent(null);
                  setSelectedTeam(null);
                }}
                placeholder={
                  loadingSports ? "Загрузка..." : "Выберите вид спорта"
                }
                isClearable
                isSearchable
              />
            </div>

            <div className="column">
              <label className="mb">Назначено:</label>
              <div className="row">
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
                <label className="mb">Команда:</label>
                <Select
                  options={teams}
                  value={selectedTeam}
                  onChange={setSelectedTeam}
                  placeholder={
                    loadingTeams ? "Загрузка..." : "Выберите команду"
                  }
                  isClearable
                  isSearchable
                />
              </div>
            )}

            {assignTo === "student" && (
              <div className="column">
                <label className="mb">Спортсмен:</label>
                <Select
                  options={students}
                  value={selectedStudent}
                  onChange={setSelectedStudent}
                  placeholder={
                    loadingStudents ? "Загрузка..." : "Выберите спортсмена"
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

            <div className="edit-buttons">
              <button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? "Обновление..."
                  : "Сохранить изменения"}
              </button>
              <button
                className="delete-analysis-btn"
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Удаление..." : "Удалить анализ"}
              </button>
            </div>
          </form>
        )}
      </div>

      {showModal && (
        <SuccessModal message={modalText} onClose={() => setShowModal(false)} />
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default EditAnalysis;
