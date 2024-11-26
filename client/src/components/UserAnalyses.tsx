// import React, { useEffect, useState } from "react";

// interface Analysis {
//   assignment_id: string;
//   analyze_name: string;
//   scheduled_date: string;
//   assigned_to_team: boolean;
// }

// const UserAnalyses: React.FC = () => {
//   const [analyses, setAnalyses] = useState<Analysis[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchAnalyses = async () => {
//       setLoading(true);
//       setError(null);

//       // Извлечение токена из localStorage
//       const token = localStorage.getItem("token");

//       console.log(token);

//       if (!token) {
//         setError("Вы не авторизованы. Выполните вход.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch("http://localhost:8080/api/analysis/user", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`, // Добавляем токен в заголовок
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || "Ошибка запроса");
//         }

//         const data = await response.json();
//         setAnalyses(data.analyses); // Устанавливаем полученные анализы
//       } catch (err: any) {
//         setError(err.message || "Неизвестная ошибка");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalyses();
//   }, []);

//   if (loading) {
//     return <p>Загрузка...</p>;
//   }

//   if (error) {
//     return <p style={{ color: "red" }}>{error}</p>;
//   }

//   return (
//     <div>
//       <h2>Назначенные анализы</h2>
//       {analyses.length === 0 ? (
//         <p>У вас нет назначенных анализов.</p>
//       ) : (
//         <ul>
//           {analyses.map((analysis) => (
//             <li key={analysis.assignment_id}>
//               <p>
//                 <strong>Анализ:</strong> {analysis.analyze_name}
//               </p>
//               <p>
//                 <strong>Дата сдачи:</strong> {new Date(analysis.scheduled_date).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Назначен для:</strong>{" "}
//                 {analysis.assigned_to_team ? "Команды" : "Лично вам"}
//               </p>
//               <hr />
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default UserAnalyses;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// interface Analysis {
//   assignment_id: string;
//   analyze_name: string;
//   scheduled_date: string;
//   assigned_to_team: boolean;
// }

// const UserAnalyses: React.FC = () => {
//   const [analyses, setAnalyses] = useState<Analysis[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAnalyses = async () => {
//       setLoading(true);
//       setError(null);

//       // Извлечение токена из localStorage
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setError("Вы не авторизованы. Выполните вход.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch("http://localhost:8080/api/analysis/user", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || "Ошибка запроса");
//         }

//         const data = await response.json();
//         setAnalyses(data.analyses);
//       } catch (err: any) {
//         setError(err.message || "Неизвестная ошибка");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalyses();
//   }, []);

//   if (loading) {
//     return <p>Загрузка...</p>;
//   }

//   if (error) {
//     return <p style={{ color: "red" }}>{error}</p>;
//   }

//   return (
//     <div>
//       <h2>Назначенные анализы</h2>
//       {analyses.length === 0 ? (
//         <p>У вас нет назначенных анализов.</p>
//       ) : (
//         <ul>
//           {analyses.map((analysis) => (
//             <li key={analysis.assignment_id}>
//               <p>
//                 <strong>Анализ:</strong> {analysis.analyze_name}
//               </p>
//               <p>
//                 <strong>Дата сдачи:</strong>{" "}
//                 {new Date(analysis.scheduled_date).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Назначен для:</strong>{" "}
//                 {analysis.assigned_to_team ? "Команды" : "Лично вам"}
//               </p>
//               <button
//                 onClick={() =>
//                   navigate(`/submit-analysis/${analysis.assignment_id}`, {
//                     state: {
//                       analyze_name: analysis.analyze_name,
//                     },
//                   })
//                 }
//               >
//                 Сдать
//               </button>
//               <hr />
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default UserAnalyses;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Analysis {
  assignment_id: string;
  analyze_name: string;
  scheduled_date: string;
  assigned_to_team: boolean;
  is_submitted: boolean; // Новый флаг
}

const UserAnalyses: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Вы не авторизованы. Выполните вход.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/analysis/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Ошибка запроса");
        }

        const data = await response.json();
        setAnalyses(data.analyses);
      } catch (err: any) {
        setError(err.message || "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Назначенные анализы</h2>
      {analyses.length === 0 ? (
        <p>У вас нет назначенных анализов.</p>
      ) : (
        <ul>
          {analyses.map((analysis) => (
            <li key={analysis.assignment_id}>
              <p>
                <strong>Анализ:</strong> {analysis.analyze_name}
              </p>
              <p>
                <strong>Дата сдачи:</strong> {new Date(analysis.scheduled_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Назначен для:</strong>{" "}
                {analysis.assigned_to_team ? "Команды" : "Лично вам"}
              </p>
              {analysis.is_submitted ? (
                <p style={{ color: "green" }}>Анализ сдан</p>
              ) : (
                <button
                  onClick={() =>
                    navigate(`/submit-analysis/${analysis.assignment_id}`, {
                      state: {
                        analyze_name: analysis.analyze_name,
                      },
                    })
                    
                  }
                >
                  Сдать
                </button>
              )}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserAnalyses;
