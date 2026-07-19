import { FilterQuery, SortOrder, Types } from "mongoose";
import { EmployeeModel } from "../models/Employee.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { parsePagination } from "../utils/query.js";
import { Role } from "../models/Employee.js";

type ListEmployeesInput = {
  search?: string;
  department?: string;
  role?: Role;
  status?: "ACTIVE" | "INACTIVE";
  sortBy?: "name" | "joiningDate" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
  includeDeleted?: "true" | "false";
};

type CreateEmployeeInput = {
  employeeId?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: Date;
  status: "ACTIVE" | "INACTIVE";
  role: Role;
  reportingManager?: string | null;
  profileImage?: string | null;
  password: string;
};

type UpdateEmployeeInput = Partial<CreateEmployeeInput> & {
  currentPassword?: string;
};

const allowedManagerRolesByEmployeeRole: Record<Role, Role[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN"],
  HR_MANAGER: ["SUPER_ADMIN"],
  EMPLOYEE: ["SUPER_ADMIN", "HR_MANAGER"]
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidManagerRole = async (employeeRole: Role, managerId?: string | null) => {
  if (!managerId) {
    return;
  }

  const manager = await EmployeeModel.findById(managerId).select("role isDeleted");
  if (!manager || manager.isDeleted) {
    throw new ApiError(404, "Reporting manager not found");
  }

  const allowedRoles = allowedManagerRolesByEmployeeRole[employeeRole];
  if (!allowedRoles.includes(manager.role)) {
    throw new ApiError(
      400,
      `${employeeRole.replace("_", " ")} can only report to ${allowedRoles
        .map((role) => role.replace("_", " "))
        .join(" or ")}`
    );
  }
};

const generateEmployeeId = async () => {
  const latestEmployees = await EmployeeModel.find(
    { employeeId: { $regex: /^EMP-\d+$/ } },
    { employeeId: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const maxSequence = latestEmployees.reduce((maxValue, employee) => {
    const value = Number(employee.employeeId?.replace("EMP-", "") || 0);
    return Number.isNaN(value) ? maxValue : Math.max(maxValue, value);
  }, 0);

  return `EMP-${String(maxSequence + 1).padStart(3, "0")}`;
};

const buildEmployeeFilter = (params: ListEmployeesInput): FilterQuery<typeof EmployeeModel> => {
  const filter: FilterQuery<typeof EmployeeModel> = {};

  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } }
    ];
  }

  if (params.department) {
    filter.department = { $regex: escapeRegex(params.department.trim()), $options: "i" };
  }

  if (params.role) {
    filter.role = params.role;
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.includeDeleted !== "true") {
    filter.isDeleted = false;
  }

  return filter;
};

export const listEmployees = async (params: ListEmployeesInput) => {
  const { currentPage, pageSize, skip } = parsePagination(params.page, params.limit);
  const filter = buildEmployeeFilter(params);
  const sort = {
    [params.sortBy ?? "createdAt"]: (params.sortOrder ?? "desc") as SortOrder
  };

  const [employees, total] = await Promise.all([
    EmployeeModel.find(filter)
      .populate("reportingManager", "name email employeeId")
      .sort(sort)
      .skip(skip)
      .limit(pageSize),
    EmployeeModel.countDocuments(filter)
  ]);

  return {
    data: employees.map((employee) => employee.toJSON()),
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

export const getEmployeeById = async (employeeId: string, actorRole?: Role, actorId?: string) => {
  const employee = await EmployeeModel.findById(employeeId)
    .populate("reportingManager");

  if (!employee || employee.isDeleted) {
    throw new ApiError(404, "Employee not found");
  }

  if (actorRole === "EMPLOYEE" && actorId !== employeeId) {
    throw new ApiError(403, "Employees can only view their own profile");
  }

  return employee.toJSON();
};

export const createEmployee = async (input: CreateEmployeeInput, actorRole: Role) => {
  if (actorRole === "HR_MANAGER" && input.role === "SUPER_ADMIN") {
    throw new ApiError(403, "HR managers cannot create super admins");
  }

  await assertValidManagerRole(input.role, input.reportingManager);
  const password = await hashPassword(input.password);
  const employeeId = input.employeeId ?? (await generateEmployeeId());

  const employee = await EmployeeModel.create({
    ...input,
    employeeId,
    email: input.email.toLowerCase(),
    password,
    reportingManager: input.reportingManager ? new Types.ObjectId(input.reportingManager) : null
  });

  return getEmployeeById(employee.id);
};

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput,
  actorRole: Role,
  actorId: string
) => {
  const employee = await EmployeeModel.findById(id);

  if (!employee || employee.isDeleted) {
    throw new ApiError(404, "Employee not found");
  }

  if (actorRole === "EMPLOYEE" && actorId !== id) {
    throw new ApiError(403, "Employees can only update their own profile");
  }

  if (actorRole === "HR_MANAGER" && employee.role === "SUPER_ADMIN") {
    throw new ApiError(403, "HR managers cannot update super admin details");
  }

  if (actorRole === "HR_MANAGER" && input.role === "SUPER_ADMIN") {
    throw new ApiError(403, "HR managers cannot assign super admin role");
  }

  const effectiveRole = input.role ?? employee.role;
  const effectiveManagerId =
    input.reportingManager !== undefined
      ? input.reportingManager
      : employee.reportingManager
        ? employee.reportingManager.toString()
        : null;

  await assertValidManagerRole(effectiveRole, effectiveManagerId);

  if (input.password) {
    if (actorId === id) {
      if (!input.currentPassword) {
        throw new ApiError(400, "Current password is required to change your password");
      }

      const isCurrentPasswordValid = await comparePassword(input.currentPassword, employee.password);
      if (!isCurrentPasswordValid) {
        throw new ApiError(400, "Current password is incorrect");
      }
    }

    employee.password = await hashPassword(input.password);
  }

  if (actorRole === "EMPLOYEE") {
    if (input.name !== undefined) employee.name = input.name;
    if (input.phone !== undefined) employee.phone = input.phone;
    if (input.profileImage !== undefined) employee.profileImage = input.profileImage;
  } else {
    if (input.name !== undefined) employee.name = input.name;
    if (input.email !== undefined) employee.email = input.email.toLowerCase();
    if (input.phone !== undefined) employee.phone = input.phone;
    if (input.department !== undefined) employee.department = input.department;
    if (input.designation !== undefined) employee.designation = input.designation;
    if (input.salary !== undefined) employee.salary = input.salary;
    if (input.joiningDate !== undefined) employee.joiningDate = input.joiningDate;
    if (input.status !== undefined) employee.status = input.status;
    if (input.role !== undefined) employee.role = input.role;
    if (input.profileImage !== undefined) employee.profileImage = input.profileImage;
    if (input.reportingManager !== undefined) {
      employee.reportingManager = input.reportingManager
        ? new Types.ObjectId(input.reportingManager)
        : null;
    }
  }

  await employee.save();
  return getEmployeeById(employee.id);
};

export const softDeleteEmployee = async (id: string, actorRole: Role) => {
  if (actorRole !== "SUPER_ADMIN") {
    throw new ApiError(403, "Only super admins can delete employees");
  }

  const employee = await EmployeeModel.findById(id);
  if (!employee || employee.isDeleted) {
    throw new ApiError(404, "Employee not found");
  }

  employee.isDeleted = true;
  employee.status = "INACTIVE";
  await employee.save();
};

export const getDirectReportees = async (id: string) => {
  const employees = await EmployeeModel.find({
    reportingManager: id,
    isDeleted: false
  }).sort({ name: 1 });

  return employees.map((employee) => employee.toJSON());
};
