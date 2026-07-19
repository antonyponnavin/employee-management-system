import { apiClient } from "./client";
import { DashboardStats } from "../types";

export const getDashboardStats = async () => {
  const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
  return data;
};

