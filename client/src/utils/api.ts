import axios from "axios";

export const SERVER_LINK = "http://localhost:8080/api";
export const WS_LINK = "ws://localhost:8080";

// export const SERVER_LINK = "https://test-diploma-1.onrender.com/api";
// export const WS_LINK = "wss://test-diploma-1.onrender.com";

// export const SERVER_LINK = "https://test3-cupj.onrender.com/api";
// export const WS_LINK = "wss://test3-cupj.onrender.com";

const apiClient = axios.create({
  baseURL: SERVER_LINK,
  headers: {
    "Content-Type": "application/json", 
  },
});

export const apiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data: any = null,
  token: string | null = null
): Promise<T> => {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      method,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
      throw new Error(error.response.data.message || "Ошибка на сервере");
    } else if (error.request) {
      console.error("Нет ответа от сервера:", error.request);
      throw new Error("Нет ответа от сервера");
    } else {
      console.error("Ошибка настройки запроса:", error.message);
      throw new Error("Ошибка запроса");
    }
  }
};