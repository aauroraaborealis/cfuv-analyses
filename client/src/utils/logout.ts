import axios from "axios";
import { SERVER_LINK } from "./api";

export const logout = async (setAccessToken: (token: string | null) => void) => {
  try {
    await axios.post(`${SERVER_LINK}/logout`, {}, { withCredentials: true });
  } catch (err) {
    console.error("Logout error:", err);
  }

  // Удаляем accessToken из памяти
  setAccessToken(null);
  delete axios.defaults.headers.common["Authorization"];
};
