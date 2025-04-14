import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import axios from "axios";
import "../styles/Register.css";
import { SERVER_LINK } from "../utils/api";
import { studentsSchema } from "../utils/validationSchemas";
import { fetchSports, fetchTeams } from "../utils/fetch";
import { genders } from "../utils/interfaces";
import { toast, ToastContainer } from "react-toastify";
import SuccessModal from "./shared/SuccessModal";

const RegisterStudent: React.FC = () => {
  const navigate = useNavigate();

  const [newSportName, setNewSportName] = useState(""); // ✅ Состояние для нового вида спорта
  const [newTeamName, setNewTeamName] = useState(""); // ✅ Состояние для новой команды

  const [showModal, setShowModal] = useState(false); // ✅ Состояние для модалки

  const handleAddNewSport = async () => {
    if (!newSportName.trim()) {
      toast.error("Введите название вида спорта!");
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

      toast.success("Вид спорта успешно добавлен!");
    } catch (error: any) {
      console.error("Ошибка добавления вида спорта:", error);
      toast.error(
        error.response?.data?.message || "Ошибка добавления вида спорта"
      );
    }
  };

  const handleAddNewTeam = async () => {
    if (!newTeamName.trim() || !selectedSport) {
      toast.error("Введите название команды и выберите вид спорта!");
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

      toast.success("Команда успешно добавлена!");
    } catch (error: any) {
      console.error("Ошибка добавления команды:", error);
      toast.error(error.response?.data?.message || "Ошибка добавления команды");
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
    resolver: yupResolver(studentsSchema),
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

  // 🚀 Отправка формы
  const onSubmit = async (data: any) => {
    try {
      await axios.post(`${SERVER_LINK}/register/init`, {
        ...data,
        gender: data.gender.value,
        sport_id: data.sport?.value || null,
        team_id: data.isTeamSport && data.team ? data.team.value : null,
        role: "student", // 👈 обязательно
      });
  
      toast.success("Код отправлен на email");
  
      // Переход на страницу подтверждения
      navigate("/verify-code", {
        state: { email: data.email, role: "student" },
      });
  
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ошибка регистрации");
    }
  };
  

  return (
    <div className="register-form">
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

                  </div>
                )}
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
                        </div>
                      )}
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

      {showModal && (
        <SuccessModal
          message="Регистрация успешна!"
          onClose={() => setShowModal(false)}
        />
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default RegisterStudent;
