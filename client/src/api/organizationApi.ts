import { apiClient } from "./client";
import { Employee, OrganizationNode } from "../types";

export const getOrganizationTree = async () => {
  const { data } = await apiClient.get<OrganizationNode[]>("/organization/tree");
  return data;
};

export const updateManager = async (id: string, reportingManager: string | null) => {
  const { data } = await apiClient.patch<Employee>(`/organization/${id}/manager`, {
    reportingManager
  });
  return data;
};

