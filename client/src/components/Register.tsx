import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import '../styles/Register.css'

interface SportOption {
    value: number;
    label: string;
}

const initialSportsList: SportOption[] = [
    { value: 1, label: "Футбол" },
    { value: 2, label: "Баскетбол" },
    { value: 3, label: "Волейбол" },
];

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [middlename, setMiddlename] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [sportOptions, setSportOptions] = useState<SportOption[]>(initialSportsList); // Список видов спорта
    const [sport, setSport] = useState<SportOption | null>(null); // Выбранный спорт
    const [isTeamSport, setIsTeamSport] = useState(false); // Чекбокс для командного спорта
    const [teamName, setTeamName] = useState(""); // Название команды
    const [inputValue, setInputValue] = useState(""); // Ввод для поиска/добавления спорта

    const navigate = useNavigate();

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
            team_name: isTeamSport && teamName ? teamName : null,
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
            alert("Регистрация успешна!");
            navigate("/");
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            alert("Ошибка регистрации");
        }
    };

    const handleAddNewSport = () => {
        if (inputValue.trim() === "") {
            alert("Введите название нового вида спорта!");
            return;
        }

        // Добавляем новый вид спорта в список
        const newSportOption: SportOption = {
            value: sportOptions.length + 1, // Уникальный ID
            label: inputValue.trim(),
        };
        setSportOptions([...sportOptions, newSportOption]);
        setSport(newSportOption); // Устанавливаем новый спорт как выбранный
        setInputValue(""); // Очищаем ввод
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
                        options={sportOptions}
                        value={sport}
                        onChange={(selectedOption) => setSport(selectedOption)}
                        onInputChange={(value) => setInputValue(value)}
                        placeholder="Выберите или добавьте вид спорта"
                        isClearable
                        isSearchable
                        noOptionsMessage={() => (
                            <div className="column">
                                <span>Такого вида спорта нет в нашей базе</span>
                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={handleAddNewSport}
                                >
                                    Добавить "{inputValue}"
                                </button>
                            </div>
                        )}
                    />
                </div>

                {sport && (
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
                )}

                {isTeamSport && (
                    <div className="column">
                        <label>Название команды:</label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                    </div>
                )}

                <button type="submit" className="submit-button">
                    Зарегистрироваться
                </button>
            </form>
        </div>
    );
};

export default Register;
