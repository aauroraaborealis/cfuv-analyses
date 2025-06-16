import { useEffect, useState } from "react";
import Select from "react-select";
import "../../styles/DisplayAnalysis.css";
import { Option } from "../../utils/interfaces.js";
import SearchBar from "../shared/SearchBar";
import Pagination from "../shared/Pagination";
import RecordsPerPageSelect from "../shared/RecordsPerPageSelect";
import { SERVER_LINK } from "../../utils/api";

export const formatDate = (isoDateStr: string): string => {
  const date = new Date(isoDateStr);

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
      setFilteredData(data);
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

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
    setCurrentPage(1);
  }, [searchQuery, tableData]);

  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const visibleData = filteredData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const norms = visibleData[0]?.Нормы;
  const dataRows = visibleData.slice(1);

  const allColumns =
    dataRows.length > 0
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

      {dataRows.length > 0 ? (
        <table className="res-table">
          <thead>
            <tr className="table-header">
              {allColumns.map((col, index) => {
                if (norms && norms[col]) {
                  const norm = norms[col];
                  return (
                    <th key={index} style={{ padding: "5px" }}>
                      {col}
                      <div
                        style={{
                          fontSize: "0.8em",
                          color: "#555",
                          marginTop: "2px",
                        }}
                      >
                        {norm.unit}
                        {" | Норма: "}
                        {norm.lower_bound} – {norm.upper_bound}
                      </div>
                    </th>
                  );
                } else {
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
                              paramValue.is_normal === false
                                ? "#911818"
                                : "inherit",
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
      )}

      {dataRows.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
