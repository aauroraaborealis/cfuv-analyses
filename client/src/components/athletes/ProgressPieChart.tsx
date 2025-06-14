import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SERVER_LINK } from "../../utils/api";

interface Analysis {
    assignment_id: string;
    analyze_name: string;
    analysis_table: string;
    scheduled_date: string;
    assigned_to_team: boolean;
    is_submitted: number;
  }
  

const COLORS = ["#00C49F", "#FF8042"]; // Цвета для графика

const fetchAnalysisData = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");

  const { data } = await axios.get(`${SERVER_LINK}/analysis/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.analyses;
};

export default function ProgressPieChart() {
    const { data: analyses = [], isLoading, error } = useQuery<Analysis[]>({
        queryKey: ["userAnalysisProgress"],
        queryFn: fetchAnalysisData,
      });
      
      

  if (isLoading) return <p>Загрузка данных...</p>;
  if (error) return <p style={{ color: "red" }}>Ошибка загрузки данных</p>;


  // Считаем сданные и несданные анализы
  const completedAnalyses = analyses.filter(a => a.is_submitted === 1).length;
  const remainingAnalyses = analyses.length - completedAnalyses;

  // Готовим данные для PieChart
  const pieData = [
    { name: "Сдано", value: completedAnalyses },
    { name: "Ожидается", value: Math.max(remainingAnalyses, 0) },
  ];

  // Фильтруем анализы, которые нужно сдать
  const pendingAnalyses = analyses
    .filter(a => a.is_submitted === 0)
    .map(a => ({
      name: a.analyze_name,
      date: new Date(a.scheduled_date).toLocaleDateString("ru-RU"),
    }));

  return (
    <div className="progress-container">
      <h3>Прогресс сдачи анализов</h3>
      <div className="pie-cont">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Блок с анализами, которые еще нужно сдать */}
      {pendingAnalyses.length > 0 && (
        <div className="pending-analyses">
          <h4>Анализы, которые нужно сдать:</h4>
          <ul>
            {pendingAnalyses.map((a, index) => (
              <li key={index}>
                <strong>{a.name}</strong> — до {a.date}
              </li>
            ))}
          </ul>
        </div>
      )}</div>

    </div>
  );
}
