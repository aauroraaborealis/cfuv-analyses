import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "../../styles/AssignedAnalyses.css";
import { SERVER_LINK } from "../../utils/api";
import SearchBar from "../shared/SearchBar";
import RecordsPerPageSelect from "../shared/RecordsPerPageSelect";
import Pagination from "../shared/Pagination";

interface AssignedAnalysis {
  assignment_id: string;
  analyze_name: string;
  scheduled_date: string;
  assigned_to_team: boolean;
  student_first_name: string | null;
  student_last_name: string | null;
  team_name: string | null;
}

const fetchAssignedAnalyses = async (): Promise<AssignedAnalysis[]> => {
  const { data } = await axios.get(`${SERVER_LINK}/analysis/assignments`);
  console.log(data);
  return data;
};

export default function AssignedAnalyses() {
  const { data: assignedAnalyses, isLoading, error } = useQuery({
    queryKey: ["assignedAnalyses"],
    queryFn: fetchAssignedAnalyses,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnalyses = assignedAnalyses?.filter((analysis) => {
    const query = searchQuery.toLowerCase();
  
    const formattedDate = new Date(analysis.scheduled_date)
      .toLocaleDateString()
      .toLowerCase();
  
    return (
      analysis.analyze_name.toLowerCase().includes(query) ||
      (analysis.student_first_name &&
        analysis.student_first_name.toLowerCase().includes(query)) ||
      (analysis.student_last_name &&
        analysis.student_last_name.toLowerCase().includes(query)) ||
      (analysis.team_name && analysis.team_name.toLowerCase().includes(query)) ||
      formattedDate.includes(query) 
    );
  });
  

  const totalPages = Math.ceil((filteredAnalyses?.length || 0) / recordsPerPage);

  const currentRecords = filteredAnalyses?.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="assigned-container">
      <h2>Назначенные анализы</h2>

      {isLoading && <p>Загрузка данных...</p>}
      {error && <p className="error-message">Ошибка загрузки данных.</p>}

      <div className="controls">
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

      {filteredAnalyses?.length === 0 && !isLoading && !error ? (
        <p className="no-data">Нет данных, соответствующих запросу.</p>
      ) : (
        <>
          <table className="assigned-table">
            <thead>
              <tr className="table-header">
                <th>Анализ</th>
                <th>Дата для сдачи</th>
                <th>Студент</th>
                <th>Команда</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords?.map((analysis) => (
                <tr key={analysis.assignment_id}>
                  <td>{analysis.analyze_name}</td>
                  <td>
                    {new Date(analysis.scheduled_date).toLocaleDateString()}
                  </td>
                  <td>
                    {analysis.assigned_to_team
                      ? "—"
                      : `${analysis.student_first_name} ${analysis.student_last_name}`}
                  </td>
                  <td>
                    {analysis.assigned_to_team
                      ? analysis.team_name || "Неизвестно"
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}



// import React, { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import Pagination from "../shared/Pagination";
// import RecordsPerPageSelect from "../shared/RecordsPerPageSelect";
// import SearchBar from "../shared/SearchBar";
// import "../../styles/AssignedAnalyses.css";
// import { SERVER_LINK } from "../../utils/api";

// interface AssignedAnalysis {
//   assignment_id: string;
//   analyze_name: string;
//   scheduled_date: string;
//   assigned_to_team: boolean;
//   student_first_name: string | null;
//   student_last_name: string | null;
//   team_name: string | null;
// }

// interface PaginationData {
//   currentPage: number;
//   pageSize: number;
//   totalPages: number;
//   totalRecords: number;
// }

// const fetchAssignedAnalyses = async (
//   page: number,
//   limit: number,
//   search: string
// ): Promise<{ data: AssignedAnalysis[]; pagination: PaginationData }> => {
//   const { data } = await axios.get(`${SERVER_LINK}/analysis/assignments`, {
//     params: { page, limit, search },
//   });
//   return data;
// };

// export default function AssignedAnalyses() {
//   const [page, setPage] = useState(1);
//   const [recordsPerPage, setRecordsPerPage] = useState(10);
//   const [search, setSearch] = useState("");

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["assignedAnalyses", page, recordsPerPage, search],
//     queryFn: () => fetchAssignedAnalyses(page, recordsPerPage, search),
//     staleTime: 300000,
//   });

//   const assignedAnalyses = data?.data || [];
//   const totalPages = data?.pagination.totalPages || 1;

//   const handlePageChange = (newPage: number) => {
//     setPage(newPage);
//   };

//   const handleRecordsPerPageChange = (value: number) => {
//     setRecordsPerPage(value);
//     setPage(1); // Сбрасываем на первую страницу
//   };

//   const handleSearch = (query: string) => {
//     setSearch(query);
//     setPage(1); // Сбрасываем на первую страницу
//   };

//   return (
//     <div className="assigned-container">
//       <h2>Назначенные анализы</h2>

//       {isLoading && <p>Загрузка данных...</p>}
//       {error && <p className="error-message">Ошибка загрузки данных.</p>}

//       <div className="controls">
//       <SearchBar onSearch={setSearch} placeholder="Поиск анализа" />
//         <RecordsPerPageSelect value={recordsPerPage} onChange={handleRecordsPerPageChange} />
//       </div>

//       {assignedAnalyses.length === 0 && !isLoading && !error ? (
//         <p className="no-data">Назначенных анализов нет.</p>
//       ) : (
//         <table className="assigned-table">
//           <thead>
//             <tr className="table-header">
//               <th>Анализ</th>
//               <th>Дата для сдачи</th>
//               <th>Студент</th>
//               <th>Команда</th>
//             </tr>
//           </thead>
//           <tbody>
//             {assignedAnalyses.map((analysis) => (
//               <tr key={analysis.assignment_id}>
//                 <td>{analysis.analyze_name}</td>
//                 <td>{new Date(analysis.scheduled_date).toLocaleDateString()}</td>
//                 <td>
//                   {analysis.assigned_to_team
//                     ? "—"
//                     : `${analysis.student_first_name} ${analysis.student_last_name}`}
//                 </td>
//                 <td>
//                   {analysis.assigned_to_team
//                     ? analysis.team_name || "Неизвестно"
//                     : "—"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       <Pagination
//         currentPage={page}
//         totalPages={totalPages}
//         onPageChange={handlePageChange}
//       />
//     </div>
//   );
// }
