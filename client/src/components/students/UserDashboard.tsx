import { useState } from "react";
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
import "../../styles/UserDashboard.css";
import { SERVER_LINK } from "../../utils/api";
import Select from "react-select";

// Функция получения анализов
const fetchAnalyzes = async () => {
  const { data } = await axios.get(`${SERVER_LINK}/analysis`);
  return data.map((analyze: any) => ({
    value: analyze.analyze_id,
    label: analyze.analyze_name,
  }));
};

// Функция получения результатов по анализу
const fetchResults = async (analysisId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");

  const { data } = await axios.get(
    `${SERVER_LINK}/stats/user/results/${analysisId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log(data);

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

  // const { data: results, isLoading: loadingResults } = useQuery({
  //   queryKey: ["userResults", selectedAnalysis],
  //   queryFn: () =>
  //     selectedAnalysis
  //       ? fetchResults(selectedAnalysis?.value)
  //       : Promise.resolve([]),
  //   enabled: !!selectedAnalysis,
  // });

  const { data: apiData, isLoading: loadingResults } = useQuery({
    queryKey: ["userResults", selectedAnalysis],
    queryFn: async () => {
      if (!selectedAnalysis) return { results: [], labels: {} };

      const data = await fetchResults(selectedAnalysis.value);

      console.log("📌 Данные после fetchResults:", data);

      return data; // Убедись, что data содержит labels
    },
    enabled: !!selectedAnalysis,
  });

  // Разбираем данные из API
  const results = apiData?.results || [];
  const labels = apiData?.labels || {};

  console.log("ЫАУКЦГЗПАИУЦШГКПШГ", results, labels);

  if (loadingAnalyses) return <p>Загрузка списка анализов...</p>;

  // Если анализ выбран, выводим список ключей показателей (кроме даты)
  const numericKeys =
    results && results.length > 0
      ? Object.keys(results[0]).filter((key) => key !== "analyze_date")
      : [];

  return (
    <div className="container">
      <h2>Дашборд пользователя</h2>

      {/* Селект для выбора анализа */}
      <div className="filters">
        <label>Выберите анализ:</label>
        <Select
          options={analyses}
          value={selectedAnalysis}
          onChange={(option) => {
            console.log("Выбран анализ:", option);
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
          ) : (
            <div className="charts">
              {/* График AreaChart */}
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
                    {/* <Tooltip
                      formatter={(value, name, entry) => {
                        if (name === "labels") return;
                        const label = entry.payload.labels?.[name] || name;
                        return [`${value}`, label]; // 👈 Теперь labels корректно работает
                      }}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString("ru-RU")
                      } // 👈 Исправляем дату
                    /> */}

                    <Tooltip
                      formatter={(value, name) => {
                        return [`${value}`, labels?.[name] || name]; // <-- Теперь берет label из API
                      }}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString("ru-RU")
                      }
                    />

                    {/* 
                    <Legend
                      formatter={(value) => {
                        if (value === "labels") return; 
                        console.log("Legend Entry:", results[0]?.labels);
                        return results[0]?.labels?.[value] || value;
                      }}
                    /> */}
                    <Legend
                      formatter={(value) => labels?.[value] || value} // <-- Используем labels из API
                    />

                    {numericKeys.map((key, index) => (
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
          )}
        </>
      )}
    </div>
  );
}
