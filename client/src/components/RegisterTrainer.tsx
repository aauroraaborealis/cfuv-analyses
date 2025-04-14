import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";
import { genders } from "../utils/interfaces";
import { toast, ToastContainer } from "react-toastify";
import SuccessModal from "./shared/SuccessModal";

// ✅ Схема валидации для тренеров
const schema = yup.object().shape({
  email: yup.string().email("Некорректный email").required("Введите email"),
  password: yup
    .string()
    .min(6, "Минимум 6 символов")
    .required("Введите пароль"),
  first_name: yup.string().required("Введите имя"),
  middle_name: yup.string().nullable(),
  last_name: yup.string().required("Введите фамилию"),
  gender: yup.object().nullable().required("Выберите пол"),
});

const RegisterTrainer: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: undefined,
    },
  });

  const [showModal, setShowModal] = useState(false); // ✅ Состояние для модалки

  const onSubmit = async (data: any) => {
    try {
      await axios.post(`${SERVER_LINK}/register/init`, {
        ...data,
        gender: data.gender.value,
        role: "trainer", // 👈 новый ключ
      });
  
      toast.success("Код отправлен на email");
      navigate("/verify-code", {
        state: { email: data.email, role: "trainer" }, // 👈 передадим для второго шага
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Ошибка при отправке кода подтверждения"
      );
    }
  };
  

  return (
    <div className="register-form">
      <form onSubmit={handleSubmit(onSubmit)} className="reg-form">
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

export default RegisterTrainer;
