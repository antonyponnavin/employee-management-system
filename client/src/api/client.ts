import axios from "axios";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ems_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
