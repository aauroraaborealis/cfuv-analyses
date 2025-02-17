import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import Select from "react-select";
import "../../styles/UserDashboard.css";
import { SERVER_LINK } from "../../utils/api";
import ProgressPieChart from "./ProgressPieChart";
import { fetchAnalyzes } from "../../utils/fetch";

// const colors = ["#606C38", "#BC6C25", "#81667A", "#94D1BE", "#BBACC1", "#6f1d1b", "#edafb8", "#f4a261", "#e09f3e", "#0fa3b1"];

// const colors = ["#532A09", "#784618", "#915C27", "#AD8042", "#BFAB67", "#BFC882", "#A4B75C", "#647332", "#3E4C22", "#2E401C"];

// const colors = ["#54478C", "#2C699A", "#0488A8", "#0DB39E", "#16DB93", "#83E377", "#B9E769", "#EFEA5A", "#F1C453", "#F29E4C"];

const colors = ["#42552c", "#606c38","#532A09", "#784618", "#915C27", "#AD8042", "#BFAB67", "#BFC882", "#A4B75C", "#647332", "#3E4C22", "#2E401C", "#264653", "#287271", "#2A9D8F", "#8AB17D", "#BAB874", "#E9C46A", "#EFB366", "#F4A261", "#EE8959", "#E76F51"];

// Функция получения результатов по анализу
const fetchResults = async (analysisId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");

  const { data } = await axios.get(
    `${SERVER_LINK}/stats/user/results/${analysisId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
};

export default function UserDashboard() {
  const { data: analyses, isLoading: loadingAnalyses } = useQuery({
    queryKey: ["userAnalyses"],
    queryFn: fetchAnalyzes,
  });

  const [selectedAnalysis, setSelectedAnalysis] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const {
    data: apiData,
    isLoading: loadingResults,
    error,
  } = useQuery({
    queryKey: ["userResults", selectedAnalysis?.value],
    queryFn: async () => {
      if (!selectedAnalysis) return { results: [], labels: {} };

      try {
        return await fetchResults(selectedAnalysis.value);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          return { results: [], labels: {}, notFound: true }; // Флаг, что данных нет
        }
        throw err; // Прокидываем другие ошибки
      }
    },
    enabled: !!selectedAnalysis,
  });

  const results = apiData?.results || [];
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);

  // Все ключи (кроме даты)
  const numericKeys =
    results.length > 0
      ? Object.keys(results[0]).filter((key) => key !== "analyze_date")
      : [];

  // Обновляем метрики и лейблы при смене анализа, но сохраняем выбранные пользователем данные
  useEffect(() => {
    if (apiData?.labels) {
      setLabels(apiData.labels);
    }
    if (numericKeys.length > 0) {
      setVisibleKeys((prevKeys) =>
        prevKeys.length === 0
          ? numericKeys
          : prevKeys.filter((k) => numericKeys.includes(k))
      );
    }
  }, [apiData, numericKeys]);

  // Обновление списка отображаемых ключей
  const toggleKey = (key: string) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="container">
      <h2>Дашборд пользователя</h2>

      {/* <ProgressPieChart /> */}

      {/* Селект для выбора анализа */}
      <div className="filters">
        <label>Выберите анализ:</label>
        <Select
          options={analyses}
          value={selectedAnalysis}
          onChange={(option) => {
            setSelectedAnalysis(option);
          }}
          placeholder={loadingAnalyses ? "Загрузка..." : "Выберите анализ"}
          isClearable
          isSearchable
        />
      </div>

      {selectedAnalysis && (
        <>
          {loadingResults ? (
            <p>Загрузка результатов...</p>
          ) : error || apiData?.notFound ? ( // <-- Добавляем проверку перед рендером
            <p className="no-data">Недостаточно данных для графика</p>
          ) : (
            <div>
              {/* Чекбоксы для выбора показателей */}
              <div className="checkbox-container">
                {numericKeys.map((key) => (
                  <label key={key} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={visibleKeys.includes(key)}
                      onChange={() => toggleKey(key)}
                    />
                    {labels[key] || key}
                  </label>
                ))}
              </div>

              {/* График */}
              <div className="charts">
                <div className="chart">
                  <h3>Динамика показателей</h3>

<ResponsiveContainer width="100%" height={400}>
  <LineChart
    data={results}
    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
  >
    <XAxis
      dataKey="analyze_date"
      tickFormatter={(date) =>
        new Date(date).toLocaleDateString()
      }
    />
    <YAxis />
    <CartesianGrid strokeDasharray="3 3" />
    <Tooltip
      formatter={(value, name) => [
        `${value}`,
        labels[name] || name,
      ]}
      labelFormatter={(label) =>
        new Date(label).toLocaleDateString("ru-RU")
      }
    />
    <Legend formatter={(value) => labels[value] || value} />

    {visibleKeys.map((key, index) => (
      <Line
        key={key}
        type="monotone"
        dataKey={key}
        stroke={colors[index % colors.length]} // ✅ Используем цвета из палитры
        strokeWidth={2}
        dot={{ r: 3 }}
      />
    ))}
  </LineChart>
</ResponsiveContainer>

                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
