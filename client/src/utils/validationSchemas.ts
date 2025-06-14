import * as yup from "yup";
import dayjs from "dayjs";

const cyrillicOnly = /^[А-Яа-яЁёІіЇїЄєҐґ]+$/;

export const studentsSchema = yup.object().shape({
email: yup
    .string()
    .email("Некорректный email")
    .max(100, "Максимум 100 символов")
    .required("Введите email"),

  password: yup
    .string()
    .min(6, "Минимум 6 символов")
    .max(32, "Максимум 32 символа")
    .required("Введите пароль"),

  first_name: yup
    .string()
    .min(2, "Минимум 2 буквы")
    .max(24, "Слишком длинное имя")
    .matches(cyrillicOnly, "Имя должно содержать только буквы кириллицы")
    .required("Введите имя"),

  middle_name: yup
    .string()
    .min(2, "Минимум 2 буквы")
    .max(25, "Слишком длинное отчество")
    .matches(cyrillicOnly, "Отчество должно содержать только буквы кириллицы")
    .nullable(),

  last_name: yup
    .string()
    .min(2, "Минимум 2 буквы")
    .max(24, "Слишком длинная фамилия")
    .matches(cyrillicOnly, "Фамилия должна содержать только буквы кириллицы")
    .required("Введите фамилию"),
    birth_date: yup
    .string()
    .required("Введите дату рождения")
    .test("is-valid-age", `Возраст должен быть не менее 14 лет`, function (value) {
      if (!value) return false;
      const birthDate = dayjs(value);
      const today = dayjs();
      const age = today.diff(birthDate, "year");
      return age >= 14;
    })
    .test("not-today", "Дата рождения не может быть сегодняшней", function (value) {
      if (!value) return false;
      const birthDate = dayjs(value).startOf("day");
      const today = dayjs().startOf("day");
      return !birthDate.isSame(today);
    }),
    gender: yup.object().nullable().required("Выберите пол"),
    sport: yup.object().nullable(),
    team: yup.object().nullable(),
    isTeamSport: yup.boolean(),
  });
  

  export const editStudentsSchema = yup.object().shape({
email: yup
    .string()
    .email("Некорректный email")
    .max(100, "Максимум 100 символов")
    .required("Введите email"),

  password: yup
    .string()
    .min(6, "Минимум 6 символов")
    .max(32, "Максимум 32 символа")
    .required("Введите пароль"),

  first_name: yup
    .string()
    .min(2, "Минимум 2 буквы")
    .max(24, "Слишком длинное имя")
    .matches(cyrillicOnly, "Имя должно содержать только буквы кириллицы")
    .required("Введите имя"),

  middle_name: yup
    .string()
    .min(2, "Минимум 2 буквы")
    .max(25, "Слишком длинное отчество")
    .matches(cyrillicOnly, "Отчество должно содержать только буквы кириллицы")
    .nullable(),

  last_name: yup
    .string()
    .min(2, "Минимум 2 буквы")
    .max(24, "Слишком длинная фамилия")
    .matches(cyrillicOnly, "Фамилия должна содержать только буквы кириллицы")
    .required("Введите фамилию"),
        birth_date: yup
    .string()
    .required("Введите дату рождения")
    .test("is-valid-age", `Возраст должен быть не менее 14 лет`, function (value) {
      if (!value) return false;
      const birthDate = dayjs(value);
      const today = dayjs();
      const age = today.diff(birthDate, "year");
      return age >= 14;
    })
    .test("not-today", "Дата рождения не может быть сегодняшней", function (value) {
      if (!value) return false;
      const birthDate = dayjs(value).startOf("day");
      const today = dayjs().startOf("day");
      return !birthDate.isSame(today);
    }),
    gender: yup.object().nullable().required("Выберите пол"),
    sport: yup.object().nullable(),
    team: yup.object().nullable(),
    isTeamSport: yup.boolean(),
  });
  