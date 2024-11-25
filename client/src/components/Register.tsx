import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../styles/Register.css";

interface SportOption {
  value: number;
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
  const [sports, setSports] = useState<SportOption[]>([]); // Список видов спорта
  const [teams, setTeams] = useState<TeamOption[]>([]); // Список команд из БД
  const [sport, setSport] = useState<SportOption | null>(null); // Выбранный спорт
  const [isTeamSport, setIsTeamSport] = useState(false); // Чекбокс для командного спорта
  const [team, setTeam] = useState<TeamOption | null>(null); // Выбранная команда
  const [newTeamName, setNewTeamName] = useState(""); // Ввод новой команды
  const navigate = useNavigate();

  useEffect(() => {
    // Загружаем список видов спорта
    const fetchSports = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/sports");
        const data = await response.json();
        const formattedSports = data.map((sport: any) => ({
          value: sport.id,
          label: sport.name,
        }));
        setSports(formattedSports);
      } catch (error) {
        console.error("Ошибка загрузки видов спорта:", error);
      }
    };

    fetchSports();
  }, []);

  useEffect(() => {
    if (sport) {
      // Загружаем список команд для выбранного вида спорта
      const fetchTeams = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/teams?sport_id=${sport.value}`
          );
          const data = await response.json();
          const formattedTeams = data.map((team: any) => ({
            value: team.team_name,
            label: team.team_name,
          }));
          setTeams(formattedTeams);
        } catch (error) {
          console.error("Ошибка загрузки команд:", error);
        }
      };

      fetchTeams();
    } else {
      setTeams([]); // Очищаем список команд, если вид спорта не выбран
    }
  }, [sport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = {
      email,
      password,
      name,
      surname,
      middlename,
      birth_date: birthDate,
      sport_id: sport?.value || null,
      is_team_sport: isTeamSport,
      team_name: isTeamSport && team ? team.value : null,
    };

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();
      localStorage.setItem("userData", JSON.stringify(result.user));
      alert("Регистрация успешна!");
      navigate("/");
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

    try {
      const response = await fetch("http://localhost:8080/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sport_id: sport.value,
          team_name: newTeamName.trim(),
        }),
      });

      const result = await response.json();

      // Добавляем новую команду в список
      setTeams((prevTeams) => [
        ...prevTeams,
        { value: result.team_name, label: result.team_name },
      ]);
      setTeam({ value: result.team_name, label: result.team_name });
      setNewTeamName("");
    } catch (error) {
      console.error("Ошибка добавления команды:", error);
    }
  };

  return (
    <div className="register-form">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} className="reg-form">
        <div className="column">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="column">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="column">
          <label>Имя:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="column">
          <label>Фамилия:</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>

        <div className="column">
          <label>Отчество (необязательно):</label>
          <input
            type="text"
            value={middlename}
            onChange={(e) => setMiddlename(e.target.value)}
          />
        </div>

        <div className="column">
          <label>Дата рождения:</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>

        <div className="column">
          <label>Вид спорта:</label>
          <Select
            options={sports}
            value={sport}
            onChange={(selectedOption) => {
              setSport(selectedOption);
              setIsTeamSport(false);
              setTeam(null);
            }}
            placeholder="Выберите вид спорта"
            isClearable
            isSearchable
          />
        </div>

        {sport && (
          <>
            <div className="column">
              <label>
                <input
                  type="checkbox"
                  checked={isTeamSport}
                  onChange={(e) => setIsTeamSport(e.target.checked)}
                />
                Командный спорт
              </label>
            </div>

            {isTeamSport && (
              <>
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
                      <button
                        type="button"
                        className="add-button"
                        onClick={handleAddNewTeam}
                      >
                        Добавить "{newTeamName}"
                      </button>
                    )}
                    onInputChange={(value) => setNewTeamName(value)}
                  />
                </div>
              </>
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
