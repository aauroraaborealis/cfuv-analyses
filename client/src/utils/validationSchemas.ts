import * as yup from "yup";

export const studentsSchema = yup.object().shape({
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
  

  export const editStudentsSchema = yup.object().shape({
    email: yup.string().email("Некорректный email").required("Введите email"),
    first_name: yup.string().required("Введите имя"),
    middle_name: yup.string().nullable(),
    last_name: yup.string().required("Введите фамилию"),
    birth_date: yup.string().required("Выберите дату рождения"),
    gender: yup.object().nullable().required("Выберите пол"),
    sport: yup.object().nullable(),
    team: yup.object().nullable(),
    isTeamSport: yup.boolean(),
  });
  