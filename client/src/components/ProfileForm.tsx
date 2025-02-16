import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import axios from "axios";
import "../styles/Register.css";
import { SERVER_LINK } from "../utils/api";
import { editStudentsSchema, studentsSchema } from "../utils/validationSchemas";
import { fetchSports, fetchTeams } from "../utils/fetch";
import { genders, Option } from "../utils/interfaces";

const ProfileForm: React.FC = () => {
  const [newSportName, setNewSportName] = useState(""); // ✅ Состояние для нового вида спорта
  const [newTeamName, setNewTeamName] = useState(""); // ✅ Состояние для новой команды

  const handleAddNewSport = async () => {
    if (!newSportName.trim()) {
      alert("Введите название вида спорта!");
      return;
    }

    try {
      const response = await axios.post(`${SERVER_LINK}/sport/create`, {
        sport_name: newSportName.trim(),
      });

      const result = response.data;
      const newSport = { value: result.sport_id, label: result.sport_name };

      setValue("sport", newSport); // ✅ Устанавливаем новый вид спорта
      setNewSportName(""); // ✅ Очищаем поле ввода
      refetchSports(); // ✅ Обновляем список видов спорта

      alert("Вид спорта успешно добавлен!");
    } catch (error: any) {
      console.error("Ошибка добавления вида спорта:", error);
      alert(error.response?.data?.message || "Ошибка добавления вида спорта");
    }
  };

  const handleAddNewTeam = async () => {
    if (!newTeamName.trim() || !selectedSport) {
      alert("Введите название команды и выберите вид спорта!");
      return;
    }

    try {
      const response = await axios.post(`${SERVER_LINK}/team/create`, {
        sport_id: selectedSport,
        team_name: newTeamName.trim(),
      });

      const result = response.data;
      const newTeam = { value: result.team_id, label: result.team_name };

      setValue("team", newTeam); // ✅ Устанавливаем новую команду
      setNewTeamName(""); // ✅ Очищаем поле ввода
      refetchTeams(); // ✅ Обновляем список команд

      alert("Команда успешно добавлена!");
    } catch (error: any) {
      console.error("Ошибка добавления команды:", error);
      alert(error.response?.data?.message || "Ошибка добавления команды");
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
    resolver: yupResolver(editStudentsSchema),
    defaultValues: {
      email: "",
      // password: "",
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
  const {
    data: sports = [],
    isLoading: loadingSports,
    refetch: refetchSports,
  } = useQuery({
    queryKey: ["sports"],
    queryFn: fetchSports,
  });

  const selectedSport =
    sport && "value" in sport ? (sport.value as string) : null;

  const {
    data: teams = [],
    isFetching: loadingTeams,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: selectedSport ? ["teams", selectedSport] : ["teams"],
    queryFn: async () => {
      if (!selectedSport) return [];
      return await fetchTeams(selectedSport);
    },
    enabled: !!selectedSport,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(`${SERVER_LINK}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🔹 Профиль пользователя:", data.user);

        // ✅ Устанавливаем данные профиля в форму
        setValue("email", data.user.email);
        setValue("first_name", data.user.first_name);
        setValue("middle_name", data.user.middle_name);
        setValue("last_name", data.user.last_name);
        setValue("birth_date", data.user.birth_date.split("T")[0]);
        // setValue("password", ""); // Пароль не заполняем, но можно ввести новый

        // ✅ Устанавливаем пол
        const genderOption = genders.find((g) => g.value === data.user.gender);
        if (genderOption) setValue("gender", genderOption);

        // ✅ Ищем вид спорта в загруженных данных
        const userSport =
          sports.find((s: Option) => s.value === data.user.sport_id) || null;
        setValue("sport", userSport);

        // ✅ Если спорт командный — загружаем команды
        if (userSport) {
          const teamsRes = await fetchTeams(userSport.value);
          setValue(
            "team",
            teamsRes.find((t: Option) => t.value === data.user.team_id) || null
          );
          setValue("isTeamSport", !!data.user.team_id);
        }
      } catch (err) {
        console.error("❌ Ошибка загрузки профиля", err);
      }
    };

    fetchProfile();
  }, [setValue, sports]); // ✅ sports теперь в зависимостях

  const onSubmit = async (data: any) => {
    console.log("🚀 Форма отправлена:", data);
    console.log("❗Ошибки валидации:", errors);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("❌ Ошибка: Токен отсутствует!");
  
      const inTeam = data.isTeamSport; // ✅ Получаем актуальный статус "в команде"
  
      const response = await axios.put(
        `${SERVER_LINK}/user/profile`, 
        {
          gender: data.gender?.value || null,
          sport_id: data.sport?.value || null,
          team_id: inTeam ? data.team?.value || null : null, // ✅ Если убрали из команды, отправляем null
          in_team: inTeam, // ✅ true/false в зависимости от выбора
          email: data.email,
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          birth_date: data.birth_date
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("✅ Сервер ответил:", response.data);
      alert("Профиль обновлён!");
    } catch (error: any) {
      console.error("❌ Ошибка запроса:", error);
      alert(error.response?.data?.message || "Ошибка редактирования профиля");
    }
  };
  
  

  return (
    <div className="register-form">
      <form
        onSubmit={handleSubmit((data) => {
          console.log("Форма отправлена:", data);
          console.log("Ошибки валидации:", errors);
          onSubmit(data);
        })}
        className="reg-form"
      >
        {/* Email и пароль */}
        <div className="column">
          <label>Email:</label>
          <input {...register("email")} className="input-react" />
          <p className="error-form">{errors.email?.message}</p>
        </div>
        {/* <div className="column">
          <label>Пароль:</label>
          <input
            type="password"
            {...register("password")}
            className="input-react"
          />
          <p className="error-form">{errors.password?.message}</p>
        </div> */}

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
          Редактировать
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
