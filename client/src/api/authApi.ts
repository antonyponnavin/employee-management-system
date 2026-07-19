import { apiClient } from "./client";
import { AuthResponse } from "../types";

export const loginRequest = async (email: string, password: string) => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", { email, password });
  return data;
};

export const logoutRequest = async () => {
  const { data } = await apiClient.post("/auth/logout");
  return data;
};

