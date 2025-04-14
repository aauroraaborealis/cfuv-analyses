import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const getRoleFromToken = (): "student" | "trainer" | null => {
  const role = getDecodedAccessToken()?.role;
    if (!role) return null;
    return role;

  // try {
  //   const decoded: any = jwtDecode(token);
  //   return decoded.role || null;
  // } catch (error) {
  //   return null;
  // }
};

export const isAuthenticated = (): boolean => {
  const decoded = getDecodedAccessToken();
  if (!decoded) return false;

  return decoded.exp * 1000 > Date.now(); // проверка не истёк ли
};


export const getDecodedAccessToken = (): any | null => {
  const header = axios.defaults.headers.common["Authorization"];
  if (!header || typeof header !== "string") return null;

  const token = header.split(" ")[1];
  console.log(token);

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
