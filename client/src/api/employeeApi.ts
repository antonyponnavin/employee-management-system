import { apiClient } from "./client";
import { Employee, EmployeeListResponse } from "../types";

export type EmployeeFilters = {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
};

export const getEmployees = async (params: EmployeeFilters) => {
  const sanitizedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );
  const { data } = await apiClient.get<EmployeeListResponse>("/employees", {
    params: sanitizedParams
  });
  return data;
};

export const getEmployee = async (id: string) => {
  const { data } = await apiClient.get<Employee>(`/employees/${id}`);
  return data;
};

export const createEmployee = async (payload: Record<string, unknown>) => {
  const { data } = await apiClient.post<Employee>("/employees", payload);
  return data;
};

export const updateEmployee = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await apiClient.put<Employee>(`/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id: string) => {
  await apiClient.delete(`/employees/${id}`);
};

export const getReportees = async (id: string) => {
  const { data } = await apiClient.get<Employee[]>(`/employees/${id}/reportees`);
  return data;
};
