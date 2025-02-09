import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "../../styles/AssignedAnalyses.css";
import { SERVER_LINK } from "../../utils/api";

interface AssignedAnalysis {
  assignment_id: string;
  analyze_name: string;
  scheduled_date: string;
  assigned_to_team: boolean;
  student_first_name: string | null;
  student_last_name: string | null;
  team_name: string | null;
}

const fetchAssignedAnalyses = async (): Promise<AssignedAnalysis[]> => {
  const { data } = await axios.get(`${SERVER_LINK}/analysis/assignments`);
  return data;
};

export default function AssignedAnalyses() {
  const { data: assignedAnalyses, isLoading, error } = useQuery({
    queryKey: ["assignedAnalyses"],
    queryFn: fetchAssignedAnalyses,
  });

  return (
    <div className="assigned-container">
      <h2>Назначенные анализы</h2>

      {isLoading && <p>Загрузка данных...</p>}
      {error && <p className="error-message">Ошибка загрузки данных.</p>}

      {assignedAnalyses?.length === 0 && !isLoading && !error ? (
        <p className="no-data">Назначенных анализов нет.</p>
      ) : (
        <table className="assigned-table">
          <thead>
            <tr>
              <th>Анализ</th>
              <th>Дата для сдачи</th>
              <th>Студент</th>
              <th>Команда</th>
            </tr>
          </thead>
          <tbody>
            {assignedAnalyses?.map((analysis) => (
              <tr key={analysis.assignment_id}>
                <td>{analysis.analyze_name}</td>
                <td>{new Date(analysis.scheduled_date).toLocaleDateString()}</td>
                <td>
                  {analysis.assigned_to_team
                    ? "—" 
                    : `${analysis.student_first_name} ${analysis.student_last_name}`}
                </td>
                <td>
                  {analysis.assigned_to_team
                    ? analysis.team_name || "Неизвестно"
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
