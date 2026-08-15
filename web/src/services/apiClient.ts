import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const email = useAuthStore.getState().email;
  if (email) {
    config.headers["x-user-email"] = email;
  }
  return config;
});
