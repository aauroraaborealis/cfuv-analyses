import { useEffect } from "react";
import axios from "axios";
import { SERVER_LINK } from "../utils/api";

export const useRefreshToken = () => {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/login") &&
          !originalRequest.url.includes("/register")
        ) {
          originalRequest._retry = true;

          try {
            const { data } = await axios.post(
              `${SERVER_LINK}/refresh`,
              {},
              { withCredentials: true }
            );

            const newAccessToken = data.accessToken;
            axios.defaults.headers.common["Authorization"] =
              `Bearer ${newAccessToken}`;
            originalRequest.headers["Authorization"] =
              `Bearer ${newAccessToken}`;

            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Refresh failed");
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
};
