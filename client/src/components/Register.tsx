import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import axios from "axios";
import "../styles/Register.css";
import { SERVER_LINK } from "../utils/api";

// Опции для выбора пола
const genders = [
  { value: "M", label: "Мужской" },
  { value: "F", label: "Женский" },
];

// ✅ Схема валидации через yup
const sudentsSchema = yup.object().shape({
  email: yup.string().email("Некорректный email").required("Введите email"),
  password: yup
    .string()
    .min(6, "Минимум 6 символов")
    .required("Введите пароль"),
  first_name: yup.string().required("Введите имя"),
  middle_name: yup.string().nullable(),
  last_name: yup.string().required("Введите фамилию"),
  birth_date: yup.string().required("Выберите дату рождения"),
  gender: yup.object().nullable().required("Выберите пол"),
  sport: yup.object().nullable(),
  team: yup.object().nullable(),
  isTeamSport: yup.boolean(),
});

// Функция получения видов спорта
const fetchSports = async () => {
  const { data } = await axios.get(`${SERVER_LINK}/sport/list`);
  return data.map((sport: any) => ({
    value: sport.sport_id,
    label: sport.sport_name,
  }));
};

// Функция получения команд по ID вида спорта
const fetchTeams = async (sportId: string) => {
  const { data } = await axios.get(
    `${SERVER_LINK}/team/list?sport_id=${sportId}`
  );
  return data.map((team: any) => ({
    value: team.team_id,
    label: team.team_name,
  }));
};

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [newSportName, setNewSportName] = useState(""); // ✅ Состояние для нового вида спорта
  const [newTeamName, setNewTeamName] = useState(""); // ✅ Состояние для новой команды

  const handleAddNewSport = async () => {
    if (!newSportName.trim()) {
      alert("Введите название вида спорта!");
      return;
    }

    try {
      const response = await fetch(`${SERVER_LINK}/sport/create`, {
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
      const newSport = { value: result.sport_id, label: result.sport_name };

      setValue("sport", newSport);
      alert("Вид спорта успешно добавлен!");
    } catch (error) {
      console.error("Ошибка добавления вида спорта:", error);
    }
  };

  const handleAddNewTeam = async () => {
    if (!newTeamName.trim() || !selectedSport) {
      alert("Введите название команды и выберите вид спорта!");
      return;
    }

    try {
      const response = await fetch(`${SERVER_LINK}/team/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sport_id: selectedSport,
          team_name: newTeamName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Ошибка добавления команды: ${error.message}`);
        return;
      }

      const result = await response.json();
      const newTeam = { value: result.team_id, label: result.team_name };

      setValue("team", newTeam);
      alert("Команда успешно добавлена!");
    } catch (error) {
      console.error("Ошибка добавления команды:", error);
    }
  };

  // 🎯 React Hook Form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(sudentsSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      birth_date: "",
      gender: undefined,
      sport: null,
      isTeamSport: false,
      team: null,
    },
  });

  const sport = watch("sport"); // Следим за выбранным видом спорта
  const isTeamSport = watch("isTeamSport"); // Следим за чекбоксом "Командный спорт"

  // 🔥 Используем React Query для видов спорта
  const { data: sports = [], isLoading: loadingSports } = useQuery({
    queryKey: ["sports"],
    queryFn: fetchSports,
  });

  const selectedSport =
    sport && "value" in sport ? (sport.value as string) : null;

  const { data: teams = [], isFetching: loadingTeams } = useQuery({
    queryKey: selectedSport ? ["teams", selectedSport] : ["teams"],
    queryFn: async () => {
      if (!selectedSport) return [];
      return await fetchTeams(selectedSport);
    },
    enabled: !!selectedSport,
  });

  // 🚀 Отправка формы
  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post(`${SERVER_LINK}/register-students`, {
        ...data,
        gender: data.gender.value,
        sport_id: data.sport?.value || null,
        team_id: data.isTeamSport && data.team ? data.team.value : null,
      });

      localStorage.setItem("token", response.data.token);
      alert("Регистрация успешна!");
      navigate("/");
    } catch (error: any) {
      alert(error.response?.data?.message || "Ошибка регистрации");
    }
  };

  return (
    <div className="register-form">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="reg-form">
        {/* Email и пароль */}
        <div className="column">
          <label>Email:</label>
          <input {...register("email")} className="input-react" />
          <p className="error-form">{errors.email?.message}</p>
        </div>
        <div className="column">
          <label>Пароль:</label>
          <input
            type="password"
            {...register("password")}
            className="input-react"
          />
          <p className="error-form">{errors.password?.message}</p>
        </div>

        {/* Личная информация */}
        <div className="column">
          <label>Имя:</label>
          <input {...register("first_name")} className="input-react" />
          <p className="error-form">{errors.first_name?.message}</p>
        </div>
        <div className="column">
          <label>Отчество:</label>
          <input {...register("middle_name")} className="input-react" />
        </div>
        <div className="column">
          <label>Фамилия:</label>
          <input {...register("last_name")} className="input-react" />
          <p className="error-form">{errors.last_name?.message}</p>
        </div>
        <div className="column">
          <label>Дата рождения:</label>
          <input
            type="date"
            {...register("birth_date")}
            className="input-react"
          />
          <p className="error-form">{errors.birth_date?.message}</p>
        </div>

        {/* Пол */}
        <div className="column">
          <label>Пол:</label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select {...field} options={genders} placeholder="Выберите пол" />
            )}
          />
          <p className="error-form">{errors.gender?.message}</p>
        </div>

        <div className="column">
          <label>Вид спорта:</label>
          <Controller
            name="sport"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={sports}
                isLoading={loadingSports}
                placeholder="Выберите вид спорта"
                onChange={(selectedOption) => {
                  field.onChange(selectedOption);
                  setValue("isTeamSport", false); // Сбрасываем командный спорт
                  setValue("team", null); // Сбрасываем команду
                }}
                isClearable
                isSearchable
                noOptionsMessage={() => (
                  <div className="no-options-message">
                    <span>Такого вида спорта нет в списках</span>
                    <button
                      type="button"
                      className="create-btn"
                      onClick={handleAddNewSport}
                    >
                      Добавить вид спорта "
                      {newSportName.trim() &&
                        newSportName.charAt(0).toUpperCase() +
                          newSportName.slice(1)}
                      "
                    </button>
                  </div>
                )}
                onInputChange={(value) => setNewSportName(value)}
              />
            )}
          />
        </div>

        <div className="column">
          <label className="team-checkbox">
            <input
              type="checkbox"
              {...register("isTeamSport")}
              onChange={(e) => setValue("isTeamSport", e.target.checked)}
            />
            Командный спорт
          </label>
        </div>

        {sport && (
          <>
            {isTeamSport && (
              <div className="column">
                <label>Команда:</label>
                <Controller
                  name="team"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={teams}
                      isLoading={loadingTeams}
                      placeholder="Выберите команду"
                      isClearable
                      isSearchable
                      noOptionsMessage={() => (
                        <div className="no-options-message">
                          <span>Такой команды нет в списках</span>
                          <button
                            type="button"
                            className="create-btn"
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
                  )}
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
