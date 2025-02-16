import { useEffect, useState } from "react";
import Select from "react-select";
import "../../styles/DisplayAnalysis.css";
import { Option } from "../../utils/interfaces.js";
import SearchBar from "../shared/SearchBar";
import Pagination from "../shared/Pagination";
import RecordsPerPageSelect from "../shared/RecordsPerPageSelect";

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
        const response = await fetch("http://localhost:8080/api/analysis");
        const data = await response.json();
        setAnalyzes(
          data.map((analyze: any) => ({
            value: analyze.analysis_table,
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
        `http://localhost:8080/api/analysis/${selectedOption.value}`
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

  return (
    <div className="container display-analysis">
      <h2>Просмотр результатов</h2>

      {/* Controls */}
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
            setCurrentPage(1); // Reset to the first page when searching
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

      {/* Loading/Error Messages */}
      {loading && <p>Загрузка данных...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Table */}
      {visibleData.length > 0 ? (
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
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex}>
                    {value !== null && value !== undefined
                      ? String(value)
                      : "-"}
                  </td>
                ))}
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

      {/* Pagination */}
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
