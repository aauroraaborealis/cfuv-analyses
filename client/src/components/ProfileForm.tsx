import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import axios from "axios";
import "../styles/ProfileForm.css";
import { SERVER_LINK } from "../utils/api";
import { genders, Option } from "../utils/interfaces";
import { fetchSports, fetchTeams } from "../utils/fetch";

const ProfileForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      birth_date: "",
      gender: "",
      sport: null,
      team: null,
    },
  });

  const [selectedSport, setSelectedSport] = useState<Option | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Option | null>(null);

  const { data: sports = [], refetch: refetchSports } = useQuery({
    queryKey: ["sports"],
    queryFn: fetchSports,
  });

  const { data: teams = [], refetch: refetchTeams } = useQuery({
    queryKey: selectedSport ? ["teams", selectedSport.value] : ["teams"],
    queryFn: async () => {
      if (!selectedSport) return [];
      return await fetchTeams(selectedSport.value);
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

        setValue("email", data.user.email);
        setValue("first_name", data.user.first_name);
        setValue("middle_name", data.user.middle_name);
        setValue("last_name", data.user.last_name);
        setValue("birth_date", data.user.birth_date.split("T")[0]);

        const genderOption = genders.find((g) => g.value === data.user.gender) || null;
        if (genderOption) {
          setValue("gender", genderOption.value);
        }

        const userSport = sports.find((s: Option) => s.value === data.user.sport_id) || null;
        setSelectedSport(userSport);
        setValue("sport", userSport ? userSport.value : ""); // ✅ Передаем только строку
        
        if (userSport) {
          const userTeams = await fetchTeams(userSport.value);
          const foundTeam = userTeams.find((t: Option) => t.value === data.user.team_id) || null;
          setSelectedTeam(foundTeam);
          setValue("team", foundTeam ? foundTeam.value : ""); // ✅ Передаем строку
        }
        
      } catch (err) {
        console.error("❌ Ошибка загрузки профиля", err);
      }
    };

    fetchProfile();
  }, [setValue, sports]);

  const handleSportChange = async (selectedOption: Option | null) => {
    setSelectedSport(selectedOption);
    // setValue("sport", selectedOption);
    setValue("team", null);
    setSelectedTeam(null);

    if (selectedOption) {
      refetchTeams();
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.put(
        `${SERVER_LINK}/user/profile`,
        {
          ...data,
          gender: data.gender?.value,
          sport_id: data.sport?.value || null,
          team_id: data.team ? data.team.value : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Данные успешно обновлены!");
    } catch (error) {
      console.error("❌ Ошибка обновления профиля", error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Редактировать профиль</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email:</label>
        <input {...register("email")} className="input-react" />

        <label>Имя:</label>
        <input {...register("first_name")} className="input-react" />

        <label>Отчество:</label>
        <input {...register("middle_name")} className="input-react" />

        <label>Фамилия:</label>
        <input {...register("last_name")} className="input-react" />

        <label>Дата рождения:</label>
        <input type="date" {...register("birth_date")} className="input-react" />

        {/* Пол (React Select) */}
        <label>Пол:</label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select {...field} options={genders} placeholder="Выберите пол" value={genders.find((g) => g.value === field.value)} />
          )}
        />

        {/* Вид спорта (React Select) */}
        <label>Вид спорта:</label>
        <Controller
          name="sport"
          control={control}
          render={({ field }) => (
            <Select {...field} options={sports} placeholder="Выберите вид спорта" value={selectedSport} onChange={handleSportChange} />
          )}
        />

        {/* Команда (React Select) */}
        <label>Команда:</label>
        <Controller
          name="team"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={teams}
              placeholder="Выберите команду"
              value={selectedTeam}
              onChange={(selected) => {
                setSelectedTeam(selected);
                field.onChange(selected);
              }}
            />
          )}
        />

        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
};

export default ProfileForm;
