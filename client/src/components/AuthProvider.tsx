import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isInitialized: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const skipRefreshForPaths = [
      "/login",
      "/register",
      "/verify-code",
      "/login-verify",
    ];
    const currentPath = window.location.pathname;

    if (skipRefreshForPaths.includes(currentPath)) {
      setIsInitialized(true);
      return;
    }

    const fetchToken = async () => {
      try {
        const { data } = await axios.post(
          `${SERVER_LINK}/refresh`,
          {},
          { withCredentials: true }
        );
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${data.accessToken}`;
        setAccessToken(data.accessToken);
      } catch {
        setAccessToken(null);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, isInitialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
