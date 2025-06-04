import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Select from "react-select";
import "../../styles/UserDashboard.css";
import { SERVER_LINK } from "../../utils/api";
import { fetchAnalyzes } from "../../utils/fetch";
import { useAuth } from "../AuthProvider";

// Типы данных
interface Measurement {
  value: string;
  date: string; // ISO string
}

interface GroupData {
  parameter: string;
  lowerBound: number | null;
  upperBound: number | null;
  measurements: Measurement[];
}

const colors = [
  "#42552c", "#606c38", "#532A09", "#784618", "#915C27",
  "#AD8042", "#BFAB67", "#BFC882", "#A4B75C", "#647332",
  "#3E4C22", "#2E401C", "#264653", "#287271", "#2A9D8F",
  "#8AB17D", "#BAB874", "#E9C46A", "#EFB366", "#F4A261",
  "#EE8959", "#E76F51"
];

const fetchResults = async (analysisId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");
  const { data } = await axios.get(
    `${SERVER_LINK}/stats/user/results/${analysisId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data as { results: GroupData[] };
};

export default function UserDashboard() {
  const { data: analyses, isLoading: loadingAnalyses } = useQuery({
    queryKey: ["userAnalyses"],
    queryFn: fetchAnalyzes,
  });

  const [selectedAnalysis, setSelectedAnalysis] = useState<{ value: string; label: string } | null>(null);

  const { data: apiData, isLoading: loadingResults, error } = useQuery({
    queryKey: ["userResults", selectedAnalysis?.value],
    queryFn: () => selectedAnalysis ? fetchResults(selectedAnalysis.value) : Promise.resolve({ results: [] as GroupData[] }),
    enabled: !!selectedAnalysis,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [bounds, setBounds] = useState<Record<string, { lower: number | null; upper: number | null }>>({});

  useEffect(() => {
    const groups: GroupData[] = apiData?.results || [];
    if (groups.length === 0) {
      setChartData([]);
      setVisibleKeys([]);
      setBounds({});
      return;
    }

    // Collect unique date-times truncated to minute (YYYY-MM-DDTHH:mm)
    const allDateTimes = new Set<string>(
      groups.flatMap((g) =>
        g.measurements.map((m) => m.date.slice(0, 16)) // first 16 chars include minute
      )
    );
    const sortedDateTimes = Array.from(allDateTimes).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Prepare bounds and visible keys
    const keys = groups.map((g) => g.parameter);
    const bMap: Record<string, { lower: number | null; upper: number | null }> = {};
    groups.forEach((g) => {
      bMap[g.parameter] = { lower: g.lowerBound, upper: g.upperBound };
    });
    setBounds(bMap);
    setVisibleKeys((prev) =>
      prev.length ? prev.filter((k) => keys.includes(k)) : keys
    );

    // Build chartData: each entry { date: "YYYY-MM-DDTHH:mm", [param]: value }
    const data = sortedDateTimes.map((dt) => {
      const entry: any = { date: dt };
      groups.forEach((g) => {
        const match = g.measurements.find(
          (m) => m.date.slice(0, 16) === dt
        );
        entry[g.parameter] = match ? Number(match.value) : null;
      });
      return entry;
    });
    setChartData(data);
  }, [apiData]);

  const toggleKey = (key: string) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="container">
      <h2>Дашборд пользователя</h2>
      <div className="filters">
        <label>Выберите анализ:</label>
        <Select
          options={analyses}
          value={selectedAnalysis}
          onChange={setSelectedAnalysis}
          placeholder={loadingAnalyses ? "Загрузка..." : "Выберите анализ"}
          isClearable
        />
      </div>

      {selectedAnalysis &&
        (loadingResults ? (
          <p>Загрузка результатов...</p>
        ) : error || !chartData.length ? (
          <p className="no-data">Недостаточно данных для графика</p>
        ) : (
          <>
            <div className="checkbox-container">
              {Object.keys(bounds).map((key) => (
                <label key={key} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={visibleKeys.includes(key)}
                    onChange={() => toggleKey(key)}
                  />
                  {key}
                </label>
              ))}
            </div>
            <div className="charts">
              <h3>Динамика показателей</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    interval={0} 
                    tickFormatter={(date) =>
                      new Date(date).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })
                    }
                  />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                  />
                  <Legend />

                  {Object.entries(bounds).map(
                    ([key, b], idx) =>
                      visibleKeys.includes(key) &&
                      b.lower != null && (
                        <ReferenceLine
                          key={`low-${key}`}
                          y={b.lower}
                          stroke={colors[idx % colors.length]}
                          strokeDasharray="3 3"
                        />
                      )
                  )}
                  {Object.entries(bounds).map(
                    ([key, b], idx) =>
                      visibleKeys.includes(key) &&
                      b.upper != null && (
                        <ReferenceLine
                          key={`up-${key}`}
                          y={b.upper}
                          stroke={colors[idx % colors.length]}
                        />
                      )
                  )}

                  {/* Lines for data */}
                  {visibleKeys.map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[idx % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ))}
    </div>
  );
}
