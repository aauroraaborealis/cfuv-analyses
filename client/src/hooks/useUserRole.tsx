import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  role: "student" | "trainer";
}

const useUserRole = (): "student" | "trainer" | null => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

export default useUserRole;
