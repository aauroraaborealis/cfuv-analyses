// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Line,
//   LineChart,
// } from "recharts";
// import Select from "react-select";
// import "../../styles/UserDashboard.css";
// import { SERVER_LINK } from "../../utils/api";
// import ProgressPieChart from "./ProgressPieChart";
// import { fetchAnalyzes } from "../../utils/fetch";
// import { useAuth } from "../AuthProvider";

// // const colors = ["#606C38", "#BC6C25", "#81667A", "#94D1BE", "#BBACC1", "#6f1d1b", "#edafb8", "#f4a261", "#e09f3e", "#0fa3b1"];

// // const colors = ["#532A09", "#784618", "#915C27", "#AD8042", "#BFAB67", "#BFC882", "#A4B75C", "#647332", "#3E4C22", "#2E401C"];

// // const colors = ["#54478C", "#2C699A", "#0488A8", "#0DB39E", "#16DB93", "#83E377", "#B9E769", "#EFEA5A", "#F1C453", "#F29E4C"];

// const colors = ["#42552c", "#606c38","#532A09", "#784618", "#915C27", "#AD8042", "#BFAB67", "#BFC882", "#A4B75C", "#647332", "#3E4C22", "#2E401C", "#264653", "#287271", "#2A9D8F", "#8AB17D", "#BAB874", "#E9C46A", "#EFB366", "#F4A261", "#EE8959", "#E76F51"];

// // Функция получения результатов по анализу
// const fetchResults = async (analysisId: string) => {
//   const token = localStorage.getItem("token");
//   if (!token) throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");

//   const { data } = await axios.get(
//     `${SERVER_LINK}/stats/user/results/${analysisId}`,
//     { headers: { Authorization: `Bearer ${token}` } }
//   );

//   return data;
// };

// export default function UserDashboard() {

//   const { data: analyses, isLoading: loadingAnalyses } = useQuery({
//     queryKey: ["userAnalyses"],
//     queryFn: fetchAnalyzes,
//   });

//   const [selectedAnalysis, setSelectedAnalysis] = useState<{
//     value: string;
//     label: string;
//   } | null>(null);

//   const {
//     data: apiData,
//     isLoading: loadingResults,
//     error,
//   } = useQuery({
//     queryKey: ["userResults", selectedAnalysis?.value],
//     queryFn: async () => {
//       if (!selectedAnalysis) return { results: [], labels: {} };

//       try {
//         return await fetchResults(selectedAnalysis.value);
//       } catch (err: any) {
//         if (err.response && err.response.status === 404) {
//           return { results: [], labels: {}, notFound: true }; // Флаг, что данных нет
//         }
//         throw err; // Прокидываем другие ошибки
//       }
//     },
//     enabled: !!selectedAnalysis,
//   });

//   const results = apiData?.results || [];
//   const [labels, setLabels] = useState<Record<string, string>>({});
//   const [visibleKeys, setVisibleKeys] = useState<string[]>([]);

//   // Все ключи (кроме даты)
//   const numericKeys =
//     results.length > 0
//       ? Object.keys(results[0]).filter((key) => key !== "analyze_date")
//       : [];

//   // Обновляем метрики и лейблы при смене анализа, но сохраняем выбранные пользователем данные
//   useEffect(() => {
//     if (apiData?.labels) {
//       setLabels(apiData.labels);
//     }
//     if (numericKeys.length > 0) {
//       setVisibleKeys((prevKeys) =>
//         prevKeys.length === 0
//           ? numericKeys
//           : prevKeys.filter((k) => numericKeys.includes(k))
//       );
//     }
//   }, [apiData, numericKeys]);

//   // Обновление списка отображаемых ключей
//   const toggleKey = (key: string) => {
//     setVisibleKeys((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   return (
//     <div className="container">
//       <h2>Дашборд пользователя</h2>

//       {/* <ProgressPieChart /> */}

//       {/* Селект для выбора анализа */}
//       <div className="filters">
//         <label>Выберите анализ:</label>
//         <Select
//           options={analyses}
//           value={selectedAnalysis}
//           onChange={(option) => {
//             setSelectedAnalysis(option);
//           }}
//           placeholder={loadingAnalyses ? "Загрузка..." : "Выберите анализ"}
//           isClearable
//           isSearchable
//         />
//       </div>

//       {selectedAnalysis && (
//         <>
//           {loadingResults ? (
//             <p>Загрузка результатов...</p>
//           ) : error || apiData?.notFound ? ( // <-- Добавляем проверку перед рендером
//             <p className="no-data">Недостаточно данных для графика</p>
//           ) : (
//             <div>
//               {/* Чекбоксы для выбора показателей */}
//               <div className="checkbox-container">
//                 {numericKeys.map((key) => (
//                   <label key={key} className="checkbox-label">
//                     <input
//                       type="checkbox"
//                       checked={visibleKeys.includes(key)}
//                       onChange={() => toggleKey(key)}
//                     />
//                     {labels[key] || key}
//                   </label>
//                 ))}
//               </div>

//               {/* График */}
//               <div className="charts">
//                 <div className="chart">
//                   <h3>Динамика показателей</h3>

// <ResponsiveContainer width="100%" height={400}>
//   <LineChart
//     data={results}
//     margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//   >
//     <XAxis
//       dataKey="analyze_date"
//       tickFormatter={(date) =>
//         new Date(date).toLocaleDateString()
//       }
//     />
//     <YAxis />
//     <CartesianGrid strokeDasharray="3 3" />
//     <Tooltip
//       formatter={(value, name) => [
//         `${value}`,
//         labels[name] || name,
//       ]}
//       labelFormatter={(label) =>
//         new Date(label).toLocaleDateString("ru-RU")
//       }
//     />
//     <Legend formatter={(value) => labels[value] || value} />

//     {visibleKeys.map((key, index) => (
//       <Line
//         key={key}
//         type="monotone"
//         dataKey={key}
//         stroke={colors[index % colors.length]} // ✅ Используем цвета из палитры
//         strokeWidth={2}
//         dot={{ r: 3 }}
//       />
//     ))}
//   </LineChart>
// </ResponsiveContainer>

//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ReferenceLine,
// } from "recharts";
// import Select from "react-select";
// import "../../styles/UserDashboard.css";
// import { SERVER_LINK } from "../../utils/api";
// import { fetchAnalyzes } from "../../utils/fetch";
// import { useAuth } from "../AuthProvider";

// const colors = [
//   "#42552c", "#606c38", "#532A09", "#784618", "#915C27",
//   "#AD8042", "#BFAB67", "#BFC882", "#A4B75C", "#647332",
//   "#3E4C22", "#2E401C", "#264653", "#287271", "#2A9D8F",
//   "#8AB17D", "#BAB874", "#E9C46A", "#EFB366", "#F4A261",
//   "#EE8959", "#E76F51"
// ];

// const fetchResults = async (analysisId: string) => {
//   const token = localStorage.getItem("token");
//   if (!token) throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");
//   const { data } = await axios.get(
//     `${SERVER_LINK}/stats/user/results/${analysisId}`,
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
//   return data; // { results: Array<{parameter, lowerBound, upperBound, measurements: [{value,date}]}> }
// };

// export default function UserDashboard() {
//   const { data: analyses, isLoading: loadingAnalyses } = useQuery({
//     queryKey: ["userAnalyses"],
//     queryFn: fetchAnalyzes,
//   });

//   const [selectedAnalysis, setSelectedAnalysis] = useState<{ value: string; label: string } | null>(null);

//   const { data: apiData, isLoading: loadingResults, error } = useQuery({
//     queryKey: ["userResults", selectedAnalysis?.value],
//     queryFn: () => selectedAnalysis ? fetchResults(selectedAnalysis.value) : Promise.resolve({ results: [] }),
//     enabled: !!selectedAnalysis,
//   });

//   // State for prepared chart data
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
//   const [bounds, setBounds] = useState<Record<string, { lower: number | null; upper: number | null }>>({});

//   // Transform grouped results into flat chartData when apiData changes
//   useEffect(() => {
//     const groups = apiData?.results || [];
//     if (!groups.length) {
//       setChartData([]);
//       setVisibleKeys([]);
//       setBounds({});
//       return;
//     }

//     // Collect all unique dates
//     const allDates = new Set(groups.flatMap(g => g.measurements.map(m => m.date)));
//     const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

//     // Prepare bounds and initial visible keys
//     const keys = groups.map(g => g.parameter);
//     const bMap: any = {};
//     groups.forEach(g => {
//       bMap[g.parameter] = { lower: g.lowerBound, upper: g.upperBound };
//     });
//     setBounds(bMap);
//     setVisibleKeys(prev => prev.length ? prev.filter(k => keys.includes(k)) : keys);

//     // Build chartData: each entry { date, [param]: value }
//     const data = sortedDates.map(date => {
//       const entry: any = { date };
//       groups.forEach(g => {
//         const match = g.measurements.find(m => m.date === date);
//         entry[g.parameter] = match ? Number(match.value) : null;
//       });
//       return entry;
//     });
//     setChartData(data);
//   }, [apiData]);

//   const toggleKey = (key: string) => {
//     setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   return (
//     <div className="container">
//       <h2>Дашборд пользователя</h2>
//       <div className="filters">
//         <label>Выберите анализ:</label>
//         <Select
//           options={analyses}
//           value={selectedAnalysis}
//           onChange={setSelectedAnalysis}
//           placeholder={loadingAnalyses ? "Загрузка..." : "Выберите анализ"}
//           isClearable
//         />
//       </div>

//       {selectedAnalysis && (
//         loadingResults ? <p>Загрузка результатов...</p> :
//         (error || !chartData.length) ? <p className="no-data">Недостаточно данных для графика</p> : (
//           <>
//             <div className="checkbox-container">
//               {Object.keys(bounds).map(key => (
//                 <label key={key} className="checkbox-label">
//                   <input type="checkbox" checked={visibleKeys.includes(key)} onChange={() => toggleKey(key)} />
//                   {key}
//                 </label>
//               ))}
//             </div>
//             <div className="charts">
//               <h3>Динамика показателей</h3>
//               <ResponsiveContainer width="100%" height={400}>
//                 <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//                   <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString()} />
//                   <YAxis />
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <Tooltip labelFormatter={label => new Date(label).toLocaleDateString("ru-RU")} />
//                   <Legend />

//                   {/* Reference lines for bounds */}
//                   {Object.entries(bounds).map(([key, b], idx) => (
//                     visibleKeys.includes(key) && b.lower != null ? (
//                       <ReferenceLine key={`low-${key}`} y={b.lower} stroke={colors[idx % colors.length]} strokeDasharray="3 3" />
//                     ) : null
//                   ))}
//                   {Object.entries(bounds).map(([key, b], idx) => (
//                     visibleKeys.includes(key) && b.upper != null ? (
//                       <ReferenceLine key={`up-${key}`} y={b.upper} stroke={colors[idx % colors.length]} />
//                     ) : null
//                   ))}

//                   {/* Lines for data */}
//                   {visibleKeys.map((key, idx) => (
//                     <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
//                   ))}
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </>
//         )
//       )}
//     </div>
//   );
// }



// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ReferenceLine,
// } from "recharts";
// import Select from "react-select";
// import "../../styles/UserDashboard.css";
// import { SERVER_LINK } from "../../utils/api";
// import { fetchAnalyzes } from "../../utils/fetch";
// import { useAuth } from "../AuthProvider";

// // Типы данных
// interface Measurement {
//   value: string;
//   date: string;
// }

// interface GroupData {
//   parameter: string;
//   lowerBound: number | null;
//   upperBound: number | null;
//   measurements: Measurement[];
// }

// const colors = [
//   "#42552c", "#606c38", "#532A09", "#784618", "#915C27",
//   "#AD8042", "#BFAB67", "#BFC882", "#A4B75C", "#647332",
//   "#3E4C22", "#2E401C", "#264653", "#287271", "#2A9D8F",
//   "#8AB17D", "#BAB874", "#E9C46A", "#EFB366", "#F4A261",
//   "#EE8959", "#E76F51"
// ];

// const fetchResults = async (analysisId: string) => {
//   const token = localStorage.getItem("token");
//   if (!token) throw new Error("Ошибка: Токен не найден, авторизуйтесь заново.");
//   const { data } = await axios.get(
//     `${SERVER_LINK}/stats/user/results/${analysisId}`,
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
//   return data as { results: GroupData[] };
// };

// export default function UserDashboard() {
//   const { data: analyses, isLoading: loadingAnalyses } = useQuery({
//     queryKey: ["userAnalyses"],
//     queryFn: fetchAnalyzes,
//   });

//   const [selectedAnalysis, setSelectedAnalysis] = useState<{ value: string; label: string } | null>(null);

//   const { data: apiData, isLoading: loadingResults, error } = useQuery({
//     queryKey: ["userResults", selectedAnalysis?.value],
//     queryFn: () => selectedAnalysis ? fetchResults(selectedAnalysis.value) : Promise.resolve({ results: [] as GroupData[] }),
//     enabled: !!selectedAnalysis,
//   });

//   const [chartData, setChartData] = useState<any[]>([]);
//   const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
//   const [bounds, setBounds] = useState<Record<string, { lower: number | null; upper: number | null }>>({});

//   useEffect(() => {
//     const groups: GroupData[] = apiData?.results || [];
//     if (groups.length === 0) {
//       setChartData([]);
//       setVisibleKeys([]);
//       setBounds({});
//       return;
//     }

//     // Collect all unique dates
//     const allDates = new Set<string>(groups.flatMap((g: GroupData) => g.measurements.map((m: Measurement) => m.date)));
//     const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

//     // Prepare bounds and visible keys
//     const keys = groups.map(g => g.parameter);
//     const bMap: Record<string, { lower: number | null; upper: number | null }> = {};
//     groups.forEach(g => {
//       bMap[g.parameter] = { lower: g.lowerBound, upper: g.upperBound };
//     });
//     setBounds(bMap);
//     setVisibleKeys(prev => prev.length ? prev.filter(k => keys.includes(k)) : keys);

//     // Build chartData: each entry { date, [param]: value }
//     const data = sortedDates.map(date => {
//       const entry: any = { date };
//       groups.forEach(g => {
//         const match = g.measurements.find(m => m.date === date);
//         entry[g.parameter] = match ? Number(match.value) : null;
//       });
//       return entry;
//     });
//     setChartData(data);
//   }, [apiData]);

//   const toggleKey = (key: string) => {
//     setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
//   };

//   return (
//     <div className="container">
//       <h2>Дашборд пользователя</h2>
//       <div className="filters">
//         <label>Выберите анализ:</label>
//         <Select
//           options={analyses}
//           value={selectedAnalysis}
//           onChange={setSelectedAnalysis}
//           placeholder={loadingAnalyses ? "Загрузка..." : "Выберите анализ"}
//           isClearable
//         />
//       </div>

//       {selectedAnalysis && (
//         loadingResults ? <p>Загрузка результатов...</p> :
//         (error || !chartData.length) ? <p className="no-data">Недостаточно данных для графика</p> : (
//           <>
//             <div className="checkbox-container">
//               {Object.keys(bounds).map(key => (
//                 <label key={key} className="checkbox-label">
//                   <input type="checkbox" checked={visibleKeys.includes(key)} onChange={() => toggleKey(key)} />
//                   {key}
//                 </label>
//               ))}
//             </div>
//             <div className="charts">
//               <h3>Динамика показателей</h3>
//               <ResponsiveContainer width="100%" height={400}>
//                 <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//                   <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString()} />
//                   <YAxis />
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <Tooltip labelFormatter={label => new Date(label).toLocaleDateString("ru-RU")} />
//                   <Legend />

//                   {Object.entries(bounds).map(([key, b], idx) => (
//                     visibleKeys.includes(key) && b.lower != null ? (
//                       <ReferenceLine key={`low-${key}`} y={b.lower} stroke={colors[idx % colors.length]} strokeDasharray="3 3" />
//                     ) : null
//                   ))}
//                   {Object.entries(bounds).map(([key, b], idx) => (
//                     visibleKeys.includes(key) && b.upper != null ? (
//                       <ReferenceLine key={`up-${key}`} y={b.upper} stroke={colors[idx % colors.length]} />
//                     ) : null
//                   ))}

//                   {visibleKeys.map((key, idx) => (
//                     <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
//                   ))}
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </>
//         )
//       )}
//     </div>
//   );
// }



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
