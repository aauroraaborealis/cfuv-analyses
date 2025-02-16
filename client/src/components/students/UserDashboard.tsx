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
} from "recharts";
import Select from "react-select";
import "../../styles/UserDashboard.css";
import { SERVER_LINK } from "../../utils/api";
import ProgressPieChart from "./ProgressPieChart";
import { fetchAnalyzes } from "../../utils/fetch";


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
            <p>Недостаточно данных для графика</p>
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
                    <AreaChart
                      data={results}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        {numericKeys.map((key, index) => (
                          <linearGradient
                            key={key}
                            id={`color${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={`hsl(${index * 60}, 70%, 50%)`}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={`hsl(${index * 60}, 70%, 50%)`}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        ))}
                      </defs>

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
                        <Area
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          fillOpacity={1}
                          fill={`url(#color${index})`}
                        />
                      ))}
                    </AreaChart>
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
