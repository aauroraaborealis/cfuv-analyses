import { useAuth } from "../components/AuthProvider";
import { jwtDecode } from "jwt-decode";

const useUserRole = (): "student" | "trainer" | null => {
  const { accessToken } = useAuth();

  console.log("accessToken | useUserRole", accessToken);

  if (!accessToken) return null;

  try {
    const decoded: any = jwtDecode(accessToken);
    console.log(decoded);
    console.log(decoded?.role);
    return decoded?.role || null;
  } catch {
    return null;
  }
};

export default useUserRole;
