import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";
import { genders } from "../utils/interfaces";


// ✅ Схема валидации для тренеров
const schema = yup.object().shape({
  email: yup.string().email("Некорректный email").required("Введите email"),
  password: yup.string().min(6, "Минимум 6 символов").required("Введите пароль"),
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

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post(`${SERVER_LINK}/register-trainers`, {
        ...data,
        gender: data.gender.value,
      });

      console.log(response);

      localStorage.setItem("token", response.data.token);
      alert("Регистрация тренера успешна!");
      navigate("/analysis-results");
    } catch (error: any) {
      alert(error.response?.data?.message || "Ошибка регистрации тренера");
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
        <input type="password" {...register("password")} className="input-react" />
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
    </div>
  );
};

export default RegisterTrainer;
