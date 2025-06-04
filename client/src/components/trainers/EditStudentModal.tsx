// src/components/modals/EditStudentModal.tsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import { fetchSports, fetchTeams } from "../../utils/fetch";
import "../../styles/EditModal.css";

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

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onSave: (sportOpt: OptionType | null, teamOpt: OptionType | null) => void;
}

/* istanbul ignore next */
const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onSave }) => {
  const [selectedSport, setSelectedSport] = useState<OptionType | null>(
    student.sport_id ? { value: student.sport_id, label: student.sport_name! } : null
  );
  /* istanbul ignore next */
  const { data: teams = [], refetch: refetchTeams, isFetching } = useQuery({
    queryKey: ["teams", selectedSport?.value],
    queryFn: () => selectedSport ? fetchTeams(selectedSport.value) : Promise.resolve([]),
    enabled: !!selectedSport,
  });
  const [selectedTeam, setSelectedTeam] = useState<OptionType | null>(
    student.team_id ? { value: student.team_id, label: student.team_name! } : null
  );

  useEffect(() => {
    setSelectedTeam(null);
    if (selectedSport) refetchTeams();
  }, [selectedSport]);

  const fullName = `${student.last_name} ${student.first_name} ${student.middle_name}`;

  return (
    <div className="modal-overlay">
      <div className="modal-content manage-modal">
      <button className="close-button" onClick={onClose}>
            <img src="/close.svg" alt="Закрыть" />
          </button>
        <h2>Редактирование</h2>
        <p>ФИО спортсмена:</p>
        <p className="fio">{fullName}</p>
        <div className="column">
          <label>Вид спорта:</label>
          {/* istanbul ignore next */}
          <Select<OptionType>
            options={useQuery({ queryKey: ["sports"], queryFn: fetchSports }).data || []}
            value={selectedSport}
            onChange={setSelectedSport}
            isClearable
            placeholder="Выберите вид спорта"
          />
        </div>
        <div className="column">
          <label>Команда:</label>
          <Select<OptionType>
            options={teams}
            value={selectedTeam}
            onChange={setSelectedTeam}
            isClearable
            placeholder={isFetching ? "Загрузка..." : "Выберите команду"}
          />
        </div>
        <div className="edit-buttons">
          <button onClick={() => onSave(selectedSport, selectedTeam)}>Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
