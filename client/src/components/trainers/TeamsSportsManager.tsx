import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchSports, fetchTeams } from "../../utils/fetch";
import { SERVER_LINK } from "../../utils/api";
import Pagination from "../shared/Pagination";
import SearchBar from "../shared/SearchBar";
import RecordsPerPageSelect from "../shared/RecordsPerPageSelect";
import "../../styles/Manager.css";
import EditStudentModal from "./EditStudentModal";

interface OptionType {
  value: string;
  label: string;
}

interface Student {
  student_id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  sport_name?: string;
  team_name?: string;
  team_id?: string;
  sport_id?: string;
}

const TeamsSportsManager: React.FC = () => {
  const [newSportName, setNewSportName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedSport, setSelectedSport] = useState<OptionType | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<OptionType | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const openModal = (student: Student) => {
    setActiveStudent(student);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (sportOpt: OptionType | null, teamOpt: OptionType | null) => {
    if (!activeStudent) return;
    try {
      await axios.put(`${SERVER_LINK}/students/${activeStudent.student_id}`, {
        sport_id: sportOpt?.value || null,
        team_id: teamOpt?.value || null,
      });
      toast.success("Данные спортсмена обновлены!");
      setStudents(prev => prev.map(s => s.student_id === activeStudent.student_id
        ? { ...s,
            sport_id: sportOpt?.value,
            sport_name: sportOpt?.label || "—",
            team_id: teamOpt?.value,
            team_name: teamOpt?.label || "—"
          }
        : s
      ));
      closeModal();
    } catch {
      toast.error("Ошибка при обновлении спортсмена");
    }
  };

  const { data: sports = [], refetch: refetchSports } = useQuery({
    queryKey: ["sports"],
    queryFn: fetchSports,
  });

  const { data: teams = [], refetch: refetchTeams } = useQuery({
    queryKey: selectedSport ? ["teams", selectedSport.value] : ["teams"],
    queryFn: async () => {
      if (!selectedSport) return [];
      return await fetchTeams(selectedSport.value);
    },
    enabled: !!selectedSport,
  });

  useEffect(() => {
    const fetchFilteredStudents = async () => {
      try {
        let res;
        if (selectedTeam) {
          res = await axios.get(`${SERVER_LINK}/students`, {
            params: { team_id: selectedTeam.value },
          });
        } else if (selectedSport) {
          res = await axios.get(`${SERVER_LINK}/students/sport`, {
            params: { sport_id: selectedSport.value },
          });
        } else {
          res = await axios.get(`${SERVER_LINK}/students`);
        }
        setStudents(res.data.students || res.data);
      } catch (err) {
        toast.error("Ошибка загрузки спортсменов");
      }
    };

    fetchFilteredStudents();
  }, [selectedSport, selectedTeam]);

  const handleAddNewSport = async () => {
    if (!newSportName.trim())
      return toast.warn("Введите название вида спорта!");

    try {
      const response = await axios.post(`${SERVER_LINK}/sport/create`, {
        sport_name: newSportName.trim(),
      });

      const result = response.data;
      const newSport = { value: result.sport_id, label: result.sport_name };

      toast.success("Вид спорта успешно добавлен!");
      setNewSportName("");
      await refetchSports();
      setSelectedSport(newSport);
      setSelectedTeam(null);
    } catch (error) {
      toast.error("Ошибка добавления вида спорта");
    }
  };

  const handleAddNewTeam = async () => {
    if (!newTeamName.trim() || !selectedSport) {
      return toast.error("Введите название команды и выберите вид спорта!");
    }

    try {
      const response = await axios.post(`${SERVER_LINK}/team/create`, {
        sport_id: selectedSport.value,
        team_name: newTeamName.trim(),
      });

      const result = response.data;
      const newTeam = { value: result.team_id, label: result.team_name };

      toast.success("Команда успешно добавлена!");
      setNewTeamName("");
      await refetchTeams();
      setSelectedTeam(newTeam);
    } catch (error) {
      toast.error("Ошибка добавления команды");
    }
  };

  const handleUpdateStudent = async (
    student_id: string,
    field: "sport_id" | "team_id",
    value: string | null
  ) => {
    try {
      await axios.put(`${SERVER_LINK}/students/${student_id}`, {
        [field]: value,
      });
      toast.success("Данные спортсмена обновлены!");
      setStudents((prev) =>
        prev.map((s) =>
          s.student_id === student_id
            ? {
                ...s,
                [field === "sport_id" ? "sport_name" : "team_name"]: value
                  ? field === "sport_id"
                    ? sports.find((sp: OptionType) => sp.value === value)?.label
                    : teams.find((tm: OptionType) => tm.value === value)?.label
                  : "—",
              }
            : s
        )
      );
    } catch {
      toast.error("Ошибка при обновлении спортсмена");
    }
  };

  const filteredStudents = (students || []).filter((s) => {
    const fullName =
      `${s.last_name} ${s.first_name} ${s.middle_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredStudents.length / recordsPerPage);
  const displayedStudents = filteredStudents.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="teams-sports-manager container">
      <div className="column">
        <h2>Управление видами спорта и командами</h2>

        <div className="column">
          <label>Вид спорта:</label>
          <Select<OptionType>
            options={sports}
            placeholder="Выберите вид спорта"
            value={selectedSport}
            onChange={(selected) => {
              setSelectedSport(selected || null);
              setSelectedTeam(null);
              setCurrentPage(1);
            }}
            isClearable
            isSearchable
            inputValue={newSportName}
            onInputChange={(value, { action }) => {
              if (action === "input-change") {
                const formatted = value
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");
                setNewSportName(formatted);
              }
            }}
            noOptionsMessage={() => (
              <div className="no-options-message">
                <span>Такого вида спорта нет</span>
                <button className="create-btn" onClick={handleAddNewSport}>
                  Добавить вид спорта "{newSportName}"
                </button>
              </div>
            )}
          />
        </div>

        {selectedSport && (
          <div className="column">
            <label className="mt5">Команда:</label>
            <Select<OptionType>
              options={teams}
              placeholder="Выберите команду"
              value={selectedTeam}
              onChange={(selected) => {
                setSelectedTeam(selected || null);
                setCurrentPage(1);
              }}
              isClearable
              isSearchable
              inputValue={newTeamName}
              onInputChange={(value, { action }) => {
                if (action === "input-change") {
                  const formatted = value
                    .split(" ")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
                  setNewTeamName(formatted);
                }
              }}
              noOptionsMessage={() => (
                <div className="no-options-message">
                  <span>Команда с таким названием отсутствует</span>
                  <button className="create-btn" onClick={handleAddNewTeam}>
                    Добавить команду "{newTeamName}"
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <div className="column right-manager container">
        <div className="search-pagination-wrapper">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <RecordsPerPageSelect
            value={recordsPerPage}
            onChange={setRecordsPerPage}
          />
        </div>

        {displayedStudents.length > 0 && (
          <div className="table-wrapper">
            <h3>Список спортсменов</h3>
            <table className="students-table">
              <thead>
                <tr>
                  <th>ФИО</th>
                  <th>Команда</th>
                  <th>Вид спорта</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((s) => (
                                    <tr key={s.student_id} onClick={() => openModal(s)} style={{ cursor: 'pointer' }}>
                    <td>
                      {s.last_name} {s.first_name} {s.middle_name}
                    </td>
                    <td>{s.team_name || "—"}</td>
                    <td>{s.sport_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {isModalOpen && activeStudent && (
        <EditStudentModal
          student={activeStudent}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TeamsSportsManager;
