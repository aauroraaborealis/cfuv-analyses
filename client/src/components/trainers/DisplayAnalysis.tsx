import { useEffect, useState } from "react";
import Select from "react-select";
import "../../styles/DisplayAnalysis.css";
import { Option } from "../../utils/interfaces.js";

export default function DisplayAnalysis() {
  const [analyzes, setAnalyzes] = useState<Option[]>([]);
  const [selectedAnalyze, setSelectedAnalyze] = useState<Option | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSelectAnalyze = async (selectedOption: Option | null) => {
    setSelectedAnalyze(selectedOption);
    if (!selectedOption) {
      setTableData([]);
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
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Просмотр результатов</h2>
      <label>Выберите анализ:</label>
      <Select
        options={analyzes}
        value={selectedAnalyze}
        onChange={handleSelectAnalyze}
        placeholder="Выберите анализ"
        isClearable
        isSearchable
      />

      {loading && <p>Загрузка данных...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {tableData.length > 0 ? (
        <table className="res-table">
          <thead>
            <tr className="table-header">
              {Object.keys(tableData[0]).map((key) => (
                <th key={key} style={{ padding: "5px" }}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
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
        !loading && !error && selectedAnalyze && (
          <p className="no-data">
            Данные для этого анализа отсуствуют
          </p>
        )
      )}
    </div>
  );

}
