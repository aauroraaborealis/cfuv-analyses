import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import axios from "axios";
import "../styles/Register.css";
import { SERVER_LINK } from "../utils/api";
import { editStudentsSchema } from "../utils/validationSchemas";
import { fetchSports, fetchTeams } from "../utils/fetch";
import { genders, Option } from "../utils/interfaces";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessModal from "./shared/SuccessModal";
import { useAuth } from "./AuthProvider";

const formatDateForInput = (dateString: string) => {
  const [day, month, year] = dateString.split(".");
  return `${year}-${month}-${day}`;
};

const ProfileForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { accessToken } = useAuth();

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

  const sport = watch("sport");
  const isTeamSport = watch("isTeamSport");

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${SERVER_LINK}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(data.user);

      setValue("email", data.user.email);
      setValue("first_name", data.user.first_name);
      setValue("middle_name", data.user.middle_name);
      setValue("last_name", data.user.last_name);
      setValue("birth_date", formatDateForInput(data.user.birth_date));

      const genderOption = genders.find((g) => g.value === data.user.gender);
      if (genderOption) setValue("gender", genderOption);

      const userSport =
        sports.find((s: Option) => s.value === data.user.sport_id) || null;
      setValue("sport", userSport);

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
    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data: any) => {
    try {
      if (!accessToken) {
        return toast.error("Ошибка: Токен отсутствует!");
      }
      
      const inTeam = data.isTeamSport;
      const response = await axios.put(
        `${SERVER_LINK}/user/profile`,
        {
          gender: data.gender?.value || null,
          sport_id: data.sport?.value || null,
          team_id: inTeam ? data.team?.value || null : null,
          in_team: inTeam,
          email: data.email.trim(),
          first_name: data.first_name.trim(),
          middle_name: data.middle_name.trim(),
          last_name: data.last_name.trim(),
          birth_date: data.birth_date,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setIsEditing(false);
      await fetchProfile();
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Ошибка запроса:", error);
      toast.error(
        error.response?.data?.message || "Ошибка редактирования профиля"
      );
    }
  };

  return (
    <div className="profile-container">
      {!isEditing ? (
        <div className="my-data-cont">
          {profileData ? (
            <>
              <h2>Мои данные</h2>

              <div className="detail-item">
                <span className="label">Email:</span>
                <span>{profileData.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Фамилия:</span>
                <span>{profileData.last_name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Имя:</span>
                <span>{profileData.first_name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Отчество:</span>
                <span>{profileData.middle_name}</span>
              </div>

              <div className="detail-item">
                <span className="label">Дата рождения:</span>
                <span>{profileData.birth_date.split("T")[0]}</span>
              </div>
              <div className="detail-item">
                <span className="label">Пол:</span>
                <span>
                  {profileData.gender === "M" ? "Мужской" : "Женский"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Вид спорта:</span>
                <span>{profileData.sport_name || "Не указан"}</span>
              </div>
              <div className="detail-item">
                <span className="label">Команда:</span>
                <span>{profileData.team_name || "Нет"}</span>
              </div>

              <div className="detail-item">
                <span className="label">Пароль:</span>
                <span style={{ fontSize: "20px" }}>••••••••••••••••</span>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="edit-button"
              >
                Редактировать
              </button>
            </>
          ) : (
            <p>Загрузка профиля...</p>
          )}
        </div>
      ) : (
        <>
          <div className="register-form">
            <form
              onSubmit={handleSubmit((data) => {
                onSubmit(data);
              })}
              className="reg-form"
            >
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="close-button"
              >
                <img src="/close.svg" alt="Отменить" />
              </button>
              <h2>Мои данные</h2>
              <div className="column">
                <label>Email:</label>
                <input {...register("email")} className="input-react" />
                <p className="error-form">{errors.email?.message}</p>
              </div>
              <div className="column">
                <label>Фамилия:</label>
                <input {...register("last_name")} className="input-react" />
                <p className="error-form">{errors.last_name?.message}</p>
              </div>
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
                <label>Дата рождения:</label>
                <input
                  type="date"
                  {...register("birth_date")}
                  className="input-react"
                />
                <p className="error-form">{errors.birth_date?.message}</p>
              </div>
              <div className="column">
                <label>Пол:</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={genders}
                      placeholder="Выберите пол"
                    />
                  )}
                />
                <p className="error-form">{errors.gender?.message}</p>
              </div>

              <div className="column">
                <label>Пароль:</label>
                <input className="input-react" />
                <p className="error-form">{errors.first_name?.message}</p>
              </div>

              <div className="column">
                <label>Новый пароль:</label>
                <input className="input-react" />
                <p className="error-form">{errors.first_name?.message}</p>
              </div>

              <button type="submit" className="submit-button">
                Сохранить
              </button>
            </form>
          </div>
        </>
      )}

      {showModal && (
        <SuccessModal
          message="Профиль обновлён!"
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

export default ProfileForm;
