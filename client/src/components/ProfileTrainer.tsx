import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import axios from "axios";
import "../styles/Register.css";
import { SERVER_LINK } from "../utils/api";
import { genders } from "../utils/interfaces";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessModal from "./shared/SuccessModal";
import { editTrainerSchema } from "../utils/validationSchemas";

const ProfileTrainer: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(editTrainerSchema),
    defaultValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: undefined,
    },
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${SERVER_LINK}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(data.user);

      setValue("email", data.user.email || "");
      setValue("first_name", data.user.first_name || "");
      setValue("middle_name", data.user.middle_name || "");
      setValue("last_name", data.user.last_name || "");

      const genderOption = genders.find((g) => g.value === data.user.gender);
      if (genderOption) setValue("gender", genderOption);
    } catch (err) {
      console.error("❌ Ошибка загрузки профиля", err);
      toast.error("Ошибка загрузки профиля");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Ошибка: Токен отсутствует!");
        return;
      }

      const submitData = {
        gender: data.gender?.value || null,
        email: data.email.trim(),
        first_name: data.first_name.trim(),
        middle_name: data.middle_name?.trim() || "",
        last_name: data.last_name.trim(),
      };

      const response = await axios.put(
        `${SERVER_LINK}/user/profile`,
        submitData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
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

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
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
                <span>{profileData.middle_name || "Не указано"}</span>
              </div>
              <div className="detail-item">
                <span className="label">Пол:</span>
                <span>
                  {profileData.gender === "M" ? "Мужской" : "Женский"}
                </span>
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
              onSubmit={handleSubmit(handleFormSubmit)}
              className="reg-form"
            >
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="close-button"
              >
                <img src="/close.svg" alt="Отменить" />
              </button>
              <h2>Редактирование профиля</h2>
              
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
                <p className="error-form">{errors.middle_name?.message}</p>
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
                <label>Текущий пароль:</label>
                <input 
                  type="password" 
                  className="input-react" 
                  placeholder="Введите для смены пароля"
                />
              </div>

              <div className="column">
                <label>Новый пароль:</label>
                <input 
                  type="password" 
                  className="input-react" 
                  placeholder="Введите новый пароль"
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Сохранение..." : "Сохранить"}
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

export default ProfileTrainer;