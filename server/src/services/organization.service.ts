import { Types } from "mongoose";
import { EmployeeModel } from "../models/Employee.js";
import { ApiError } from "../utils/apiError.js";
import { Role } from "../models/Employee.js";

type OrganizationTreeNode = Record<string, unknown> & {
  id: string;
  children: OrganizationTreeNode[];
};

const allowedManagerRolesByEmployeeRole: Record<Role, Role[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN"],
  HR_MANAGER: ["SUPER_ADMIN"],
  EMPLOYEE: ["SUPER_ADMIN", "HR_MANAGER"]
};

const assertManagerPermission = (actorRole: Role) => {
  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(actorRole)) {
    throw new ApiError(403, "You do not have permission to update managers");
  }
};

const assertValidManagerRole = (employeeRole: Role, managerRole: Role) => {
  const allowedRoles = allowedManagerRolesByEmployeeRole[employeeRole];
  if (!allowedRoles.includes(managerRole)) {
    throw new ApiError(
      400,
      `${employeeRole.replace("_", " ")} can only report to ${allowedRoles
        .map((role) => role.replace("_", " "))
        .join(" or ")}`
    );
  }
};

const ensureNoCircularReference = async (employeeId: string, managerId: string | null) => {
  if (!managerId) return;
  if (employeeId === managerId) {
    throw new ApiError(400, "An employee cannot report to themselves");
  }

  let currentManagerId: string | null = managerId;
  while (currentManagerId) {
    if (currentManagerId === employeeId) {
      throw new ApiError(400, "Circular reporting structure is not allowed");
    }

    const manager: { reportingManager?: Types.ObjectId | null } | null = await EmployeeModel.findById(
      currentManagerId
    )
      .select("reportingManager")
      .lean();
    currentManagerId = manager?.reportingManager
      ? manager.reportingManager.toString()
      : null;
  }
};

const buildTreeNode = async (employeeId: string): Promise<OrganizationTreeNode | null> => {
  const employee = await EmployeeModel.findById(employeeId)
    .select("-password -__v")
    .lean();

  if (!employee || employee.isDeleted) {
    return null;
  }

  const reports = await EmployeeModel.find({
    reportingManager: employee._id,
    isDeleted: false
  })
    .sort({ name: 1 })
    .select("-password -__v")
    .lean();

  const children: OrganizationTreeNode[] = (
    await Promise.all(reports.map((report) => buildTreeNode(report._id.toString())))
  ).filter((child): child is OrganizationTreeNode => Boolean(child));

  return {
    ...employee,
    id: employee._id.toString(),
    children
  };
};

export const updateManager = async (
  employeeId: string,
  managerId: string | null,
  actorRole: Role
) => {
  assertManagerPermission(actorRole);

  const employee = await EmployeeModel.findById(employeeId);
  if (!employee || employee.isDeleted) {
    throw new ApiError(404, "Employee not found");
  }

  if (actorRole === "HR_MANAGER" && employee.role === "SUPER_ADMIN") {
    throw new ApiError(403, "HR managers cannot modify super admin reporting");
  }

  if (managerId) {
    const manager = await EmployeeModel.findById(managerId);
    if (!manager || manager.isDeleted) {
      throw new ApiError(404, "Reporting manager not found");
    }

    assertValidManagerRole(employee.role, manager.role);
  }

  await ensureNoCircularReference(employeeId, managerId);
  employee.reportingManager = managerId ? new Types.ObjectId(managerId) : null;
  await employee.save();

  return employee.toJSON();
};

export const getOrganizationTree = async () => {
  const roots = await EmployeeModel.find({
    $or: [{ reportingManager: null }, { reportingManager: { $exists: false } }],
    isDeleted: false
  })
    .sort({ name: 1 })
    .select("_id");

  const tree = await Promise.all(roots.map((root) => buildTreeNode(root._id.toString())));
  return tree.filter(Boolean);
};
