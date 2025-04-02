import { useEffect, useState } from "react";
import Select from "react-select";
import "../../styles/DisplayAnalysis.css";
import { Option } from "../../utils/interfaces.js";
import SearchBar from "../shared/SearchBar";
import Pagination from "../shared/Pagination";
import RecordsPerPageSelect from "../shared/RecordsPerPageSelect";
import { SERVER_LINK } from "../../utils/api";

const formatDate = (isoDateStr: string): string => {
  const date = new Date(isoDateStr);
  // Пример: 21.03.2025 21:25
  return (
    date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};

export default function DisplayAnalysis() {
  const [analyzes, setAnalyzes] = useState<Option[]>([]);
  const [selectedAnalyze, setSelectedAnalyze] = useState<Option | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch available analyzes
  useEffect(() => {
    const fetchAnalyzes = async () => {
      try {
        const response = await fetch(`${SERVER_LINK}/analysis`);
        const data = await response.json();
        setAnalyzes(
          data.map((analyze: any) => ({
            value: analyze.analyze_id,
            label: analyze.analyze_name,
          }))
        );
      } catch (error) {
        console.error("Ошибка загрузки анализов:", error);
      }
    };

    fetchAnalyzes();
  }, []);

  // Fetch table data based on selected analyze
  const handleSelectAnalyze = async (selectedOption: Option | null) => {
    setSelectedAnalyze(selectedOption);
    if (!selectedOption) {
      setTableData([]);
      setFilteredData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${SERVER_LINK}/analysis/${selectedOption.value}`
      );

      if (!response.ok) {
        throw new Error("Не удалось загрузить данные таблицы");
      }

      const data = await response.json();
      setTableData(data);
      setFilteredData(data); // Initialize filtered data
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(tableData);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = tableData.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(lowerCaseQuery)
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to the first page when filtering
  }, [searchQuery, tableData]);

  // Pagination: Calculate visible data
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const visibleData = filteredData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const norms = visibleData[0]?.Нормы;
  const dataRows = visibleData.slice(1);

  const allColumns = dataRows.length > 0
  ? Object.keys(dataRows[0]).filter((col) => col !== "assignment_id")
  : [];

  return (
    <div className="container display-analysis">
      <h2>Просмотр результатов</h2>

      <div className="display-controls">
        <label>Выберите анализ:</label>
        <Select
          className="display-r-select"
          options={analyzes}
          value={selectedAnalyze}
          onChange={handleSelectAnalyze}
          placeholder="Выберите анализ"
          isClearable
          isSearchable
        />

        <SearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
        />

          <RecordsPerPageSelect
          value={recordsPerPage}
          onChange={(count) => {
            setRecordsPerPage(count);
            setCurrentPage(1); 
          }}
        />
      </div>

      {loading && <p>Загрузка данных...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* {visibleData.length > 0 ? (
        <table className="res-table">
          <thead>
            <tr className="table-header">
              {Object.keys(visibleData[0]).map((key) => (
                <th key={key} style={{ padding: "5px" }}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, index) => (
              <tr key={index}>

{Object.entries(row).map(([key, value], cellIndex) => {
  const isAnalyzed =
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "unit" in value;

  if (isAnalyzed) {
    const param = value as {
      value: string;
      unit: string;
      is_normal: string;
      reference?: { lower_bound: number; upper_bound: number };
    };

    return (
      <td key={cellIndex}>
        <div
          style={{
            color: param.is_normal === "Не в пределах нормы" ? "#911818" : "inherit",
          }}
        >
          {param.value} {param.unit}
        </div>
        <div style={{ fontSize: "0.8em", color: "#999" }}>
          Норма: {param.reference?.lower_bound}–{param.reference?.upper_bound} {param.unit}
        </div>
      </td>
    );
  }

  // ✅ Приводим всё остальное к строке
  return <td key={cellIndex}>{String(value ?? "-")}</td>;
})}



                
              </tr>
            ))}
          </tbody>
        </table>
      )  */}

{/* {dataRows.length > 0 ? (
      <table className="res-table">
        <thead>
          <tr className="table-header">
            {Object.keys(dataRows[0]).map((key, index) => (
              <th key={index} style={{ padding: "5px" }}>
                {key}
              </th>
            ))}
          </tr>
          <tr>
            {Object.keys(dataRows[0]).map((key, index) => {
              if (norms && norms[key]) {
                const norm = norms[key];
                return (
                  <th key={index} style={{ padding: "5px", fontWeight: "normal", fontSize: "0.9em" }}>
                    {norm.unit}
                    <br />
                    Норма: {norm.lower_bound} – {norm.upper_bound}
                  </th>
                );
              }
              return <th key={index} style={{ padding: "5px" }} />;
            })}
          </tr>
        </thead>
        <tbody>
  {dataRows.map((row, rowIndex) => (
    <tr key={rowIndex}>
      {Object.entries(row).map(([key, value], cellIndex) => {
        if (
          typeof value === "object" &&
          value !== null &&
          "Значение" in value
        ) {
          const paramValue = value as {
            Значение: string;
            is_normal?: boolean;
          };

          return (
            <td key={cellIndex} style={{ padding: "5px" }}>
              <div
                style={{
                  color: paramValue.is_normal === false ? "#911818" : "inherit",
                }}
              >
                {paramValue.Значение}
              </div>
            </td>
          );
        }
        return (
          <td key={cellIndex} style={{ padding: "5px" }}>
            {String(value ?? "-")}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>

      </table>
    ) : (
      !loading &&
      !error &&
      selectedAnalyze && (
        <p className="no-data">Данные для этого анализа отсутствуют</p>
      )
    )} */}

     {/* Таблица */}
     {dataRows.length > 0 ? (
      <table className="res-table">
        <thead>
          <tr className="table-header">
            {allColumns.map((col, index) => {
              // Если в norms есть запись для этой колонки (например, "Гемоглобин"),
              // то выводим название + единицы + диапазон нормы
              if (norms && norms[col]) {
                const norm = norms[col];
                return (
                  <th key={index} style={{ padding: "5px" }}>
                    {col}
                    <div style={{ fontSize: "0.8em", color: "#555", marginTop: "2px" }}>
                      {norm.unit}
                      {" | Норма: "}
                      {norm.lower_bound} – {norm.upper_bound}
                    </div>
                  </th>
                );
              } else {
                // Обычные колонки (Имя, Фамилия, Команда и т.д.)
                return (
                  <th key={index} style={{ padding: "5px" }}>
                    {col}
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {allColumns.map((col, cellIndex) => {
                const value = row[col];

                if (col === "Дата сдачи" && typeof value === "string") {
                  return (
                    <td key={cellIndex} style={{ padding: "5px" }}>
                      {formatDate(value)}
                    </td>
                  );
                }
                
                if (
                  typeof value === "object" &&
                  value !== null &&
                  "Значение" in value
                ) {
                  const paramValue = value as {
                    Значение: string;
                    is_normal?: boolean;
                  };

                  return (
                    <td key={cellIndex} style={{ padding: "5px" }}>
                      <div
                        style={{
                          color:
                            paramValue.is_normal === false ? "#911818" : "inherit",
                        }}
                      >
                        {paramValue.Значение}
                      </div>
                    </td>
                  );
                }

                // Иначе обычное поле (Имя, Фамилия, ...)
                return (
                  <td key={cellIndex} style={{ padding: "5px" }}>
                    {String(value ?? "-")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      !loading &&
      !error &&
      selectedAnalyze && (
        <p className="no-data">Данные для этого анализа отсутствуют</p>
      )
    )}

      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
