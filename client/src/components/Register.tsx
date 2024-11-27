import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../styles/Register.css";

interface SportOption {
  value: string; // UUID
  label: string;
}

interface TeamOption {
  value: string;
  label: string;
}

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sports, setSports] = useState<SportOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [sport, setSport] = useState<SportOption | null>(null);
  const [isTeamSport, setIsTeamSport] = useState(false);
  const [team, setTeam] = useState<TeamOption | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [gender, setGender] = useState(""); // Пол
  const [newSportName, setNewSportName] = useState(""); // Для нового вида спорта


  const navigate = useNavigate();

  // Fetch sports on component mount
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/sport/list");
        const data = await response.json();
        const formattedSports = data.map((sport: any) => ({
          value: sport.sport_id,
          label: sport.sport_name,
        }));
        setSports(formattedSports);
      } catch (error) {
        console.error("Ошибка загрузки видов спорта:", error);
      }
    };

    fetchSports();
  }, []);

  // Fetch teams when a sport is selected
  useEffect(() => {
    if (sport) {
      const fetchTeams = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/team/list?sport_id=${sport.value}`
          );
          const data = await response.json();
          const formattedTeams = data.map((team: any) => ({
            value: team.team_id,
            label: team.team_name,
          }));
          setTeams(formattedTeams);
        } catch (error) {
          console.error("Ошибка загрузки команд:", error);
        }
      };

      fetchTeams();
    } else {
      setTeams([]);
    }
  }, [sport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const user = {
      email,
      password,
      first_name: name,
      middle_name: middlename || null,
      last_name: surname,
      birth_date: birthDate,
      gender, // Добавляем пол
      sport_id: sport?.value || null,
      in_team: isTeamSport,
      team_id: isTeamSport && team ? team.value : null,
    };
  
    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
  
      if (!response.ok) {
        const error = await response.json();
        alert(`Ошибка регистрации: ${error.message}`);
        return;
      }
  
      const result = await response.json(); // Получаем токен из ответа
      localStorage.setItem("token", result.token); // Сохраняем токен
  
      alert("Регистрация успешна!");
      navigate("/"); // Перенаправляем пользователя после регистрации
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      alert("Ошибка регистрации");
    }
  };
  

  const handleAddNewTeam = async () => {
    if (!newTeamName.trim() || !sport) {
      alert("Введите название команды и выберите вид спорта!");
      return;
    }

    console.log("Sport ID:", sport.value);
    console.log("New Team Name:", newTeamName);

    try {
      const response = await fetch("http://localhost:8080/api/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sport_id: sport.value, // Проверяем, чтобы значение передавалось
          team_name: newTeamName.trim(), // Убедимся, что строка не пустая
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Ошибка добавления команды: ${error.message}`);
        return;
      }

      const result = await response.json();
      console.log("Добавленная команда:", result);

      // Добавляем команду в список
      setTeams((prevTeams) => [
        ...prevTeams,
        { value: result.team_id, label: result.team_name },
      ]);
      setTeam({ value: result.team_id, label: result.team_name });
      setNewTeamName("");
      alert("Команда успешно добавлена!");
    } catch (error) {
      console.error("Ошибка добавления команды:", error);
    }
  };

  const handleAddNewSport = async () => {
    if (!newSportName.trim()) {
      alert("Введите название вида спорта!");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8080/api/sport/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sport_name: newSportName.trim(),
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        alert(`Ошибка добавления вида спорта: ${error.message}`);
        return;
      }
  
      const result = await response.json();
  
      // Добавляем новый вид спорта в список
      const newSport = { value: result.sport_id, label: result.sport_name };
      setSports((prevSports) => [...prevSports, newSport]);
  
      // Устанавливаем новый вид спорта как выбранный
      setSport(newSport);
  
      setNewSportName(""); // Сбрасываем поле ввода
      alert("Вид спорта успешно добавлен!");
    } catch (error) {
      console.error("Ошибка добавления вида спорта:", error);
    }
  };
  
  
  return (
    <div className="register-form">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} className="reg-form">
        {/* Email and Password */}
        <div className="column">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="css-13cymwt-control"
          />
        </div>
        <div className="column">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="css-13cymwt-control"
          />
        </div>

        {/* Personal Information */}
        <div className="column">
          <label>Имя:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="css-13cymwt-control"

          />
        </div>
        <div className="column">
          <label>Отчество:</label>
          <input
            type="text"
            value={middlename}
            onChange={(e) => setMiddlename(e.target.value)}
            className="css-13cymwt-control"

          />
        </div>
        <div className="column">
          <label>Фамилия:</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            className="css-13cymwt-control"

          />
        </div>
        <div className="column">
          <label>Дата рождения:</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="css-13cymwt-control"

          />
        </div>
        <div className="column">
          <label>Пол:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="css-13cymwt-control"
          >
            {/* <option value="" disabled>
              Выберите пол
            </option> */}
            <option value="M">Мужской</option>
            <option value="F">Женский</option>
          </select>
        </div>

        {/* Sport and Team Selection */}
        <div className="column">
  <label>Вид спорта:</label>
  <Select
    options={sports}
    value={sport}
    onChange={(selectedOption) => {
      setSport(selectedOption);
      setIsTeamSport(false); // Сбрасываем командный спорт при смене вида спорта
      setTeam(null);
    }}
    placeholder="Выберите вид спорта"
    isClearable
    isSearchable
    noOptionsMessage={() => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span>Такого вида спорта нет в списках</span>
        <button
          type="button"
          className="add-btn"
          onClick={handleAddNewSport}
        >
          Добавить вид спорта "
          {newSportName.trim() &&
            newSportName.charAt(0).toUpperCase() + newSportName.slice(1)}"
        </button>
      </div>
    )}
    onInputChange={(value) => setNewSportName(value)} // Обновляем ввод
  />
</div>

        {sport && (
          <>
            <div className="column">
              <label className="team-checkbox">
                <input
                  type="checkbox"
                  checked={isTeamSport}
                  onChange={(e) => setIsTeamSport(e.target.checked)}
                />
                Командный спорт
              </label>
            </div>
            {isTeamSport && (
              <div className="column">
                <label>Название команды:</label>
                <Select
                  options={teams}
                  value={team}
                  onChange={(selectedOption) => setTeam(selectedOption)}
                  placeholder="Выберите команду"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span>Такой команды нет в списках</span>
                      <button
                        type="button"
                        style={{
                          marginTop: "10px",
                          padding: "5px 10px",
                          backgroundColor: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={handleAddNewTeam}
                      >
                        Создать команду "
                        {newTeamName.trim() &&
                          newTeamName.charAt(0).toUpperCase() +
                            newTeamName.slice(1)}
                        "
                      </button>
                    </div>
                  )}
                  onInputChange={(value) => setNewTeamName(value)}
                />
              </div>
            )}
          </>
        )}

        <button type="submit" className="submit-button">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default Register;
