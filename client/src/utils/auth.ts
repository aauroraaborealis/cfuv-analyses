import { jwtDecode } from "jwt-decode";

export const getRoleFromToken = (): "student" | "trainer" | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};