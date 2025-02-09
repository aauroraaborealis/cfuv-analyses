import React from "react";
import "../../styles/SearchBar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Введите запрос",
}) => {
  return (
    <div className="search-controls">
      <span>Поиск:</span>
      <div className="search-bar">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
      </div>
    </div>
  );
};

export default SearchBar;

// import React, { useState } from "react";
// import "../../styles/SearchBar.css";

// interface SearchBarProps {
//   onSearch: (value: string) => void;
//   placeholder?: string;
// }

// const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Поиск" }) => {
//   const [value, setValue] = useState("");

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setValue(newValue);
//     onSearch(newValue); // Отправляем запрос при изменении
//   };

//   return (
//     <div className="search-bar">
//       <input
//         type="text"
//         value={value}
//         onChange={handleChange}
//         placeholder={placeholder}
//         className="search-input"
//       />
//     </div>
//   );
// };

// export default SearchBar;
