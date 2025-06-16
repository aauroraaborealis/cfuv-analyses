import axios from "axios";
import { SERVER_LINK } from "./api";

export const fetchSports = async () => {
    const { data } = await axios.get(`${SERVER_LINK}/sport/list`);
    return data.map((sport: any) => ({
      value: sport.sport_id,
      label: sport.sport_name,
    }));
  };

export const fetchTeams = async (sportId: string) => {
    const { data } = await axios.get(
      `${SERVER_LINK}/team/list?sport_id=${sportId}`
    );
    return data.map((team: any) => ({
      value: team.team_id,
      label: team.team_name,
    }));
  };

export const fetchAnalyzes = async () => {
    const { data } = await axios.get(`${SERVER_LINK}/analysis`);
    return data.map((analyze: any) => ({
      value: analyze.analyze_id,
      label: analyze.analyze_name,
    }));
  };

export const fetchStudents = async (sportId: string) => {
    const { data } = await axios.get(
      `${SERVER_LINK}/students/sport?sport_id=${sportId}`
    );
    return data.map((student: any) => ({
      value: student.student_id,
      label: `${student.first_name} ${student.last_name}`,
    }));
  };