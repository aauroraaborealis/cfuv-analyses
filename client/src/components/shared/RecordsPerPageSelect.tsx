import React from "react";
import Select from "react-select";
import "../../styles/RecordsPerPageSelect.css";

interface RecordsPerPageSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const options = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

const RecordsPerPageSelect: React.FC<RecordsPerPageSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="records-per-page-select">
      <span>Показывать на странице:</span>
      <Select
        options={options}
        value={options.find((option) => option.value === value)}
        onChange={(selectedOption) => {
          if (selectedOption) {
            onChange(selectedOption.value);
          }
        }}
        className="records-select"
      />
    </div>
  );
};

export default RecordsPerPageSelect;
