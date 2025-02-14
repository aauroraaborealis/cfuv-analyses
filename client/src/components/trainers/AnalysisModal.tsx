import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "../../styles/AnalysisModal.css";
import { SERVER_LINK } from "../../utils/api";
import EditAnalysis from "./EditAnalysis";

interface AnalysisModalProps {
  assignmentId: string | null;
  onClose: () => void;
}

const fetchAnalysisDetails = async (assignmentId: string) => {
  const { data } = await axios.get(
    `${SERVER_LINK}/analysis/assignment/${assignmentId}`
  );
  return data;
};

export default function AnalysisModal({
  assignmentId,
  onClose,
}: AnalysisModalProps) {
  const {
    data: analysis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analysisDetails", assignmentId],
    queryFn: () => fetchAnalysisDetails(assignmentId!),
    enabled: !!assignmentId,
  });

  const [isEditing, setIsEditing] = useState(false); // Состояние редактирования

  // Глобальная функция закрытия
  const handleClose = () => {
    setIsEditing(false);
    onClose(); // Закрываем всю модалку
  };

  if (!assignmentId) return null;

  return (
    <>
      {!isEditing ? (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="buttons-cont">
              <button className="close-button" onClick={handleClose}>
                <img src="/close.svg" alt="Закрыть" />
              </button>
            </div>

            {isLoading && <p>Загрузка...</p>}
            {error && <p className="error-message">Ошибка загрузки данных.</p>}

            <h2>Подробная информация</h2>

            {analysis && (
              <div className="analysis-detail-info">
                <div className="detail-item">
                  <span className="label">Анализ:</span>
                  <span>{analysis?.analyze_name || "Название не указано"}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Дата сдачи:</span>
                  <span>
                    {new Date(analysis.scheduled_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">Назначено:</span>
                  <span>
                    {analysis.assigned_to_team ? "Команде" : "Студенту"}
                  </span>
                </div>

                {analysis.assigned_to_team ? (
                  <div className="detail-item">
                    <span className="label">Название команды:</span>
                    <span>{analysis.team_name || "Неизвестно"}</span>
                  </div>
                ) : (
                  <div className="detail-item">
                    <span className="label">Имя студента:</span>
                    <span className="detailed-label">{`${analysis.student_first_name} ${analysis.student_last_name}`}</span>
                  </div>
                )}

                <div className="detail-item">
                  <span className="label">Кем создан:</span>
                  <span>
                    {analysis.trainer_first_name} {analysis.trainer_last_name}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">Дата создания анализа:</span>
                  <span>{new Date(analysis.created_at).toLocaleString()}</span>
                </div>

                {/* Кнопка редактирования */}
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Редактировать
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Если включено редактирование, показываем `EditAnalysis`
        <EditAnalysis assignmentId={assignmentId} onClose={() => {
          setIsEditing(false); // Закрываем `EditAnalysis` и возвращаем `AnalysisModal`
        }} />
      )}
    </>
  );
}
