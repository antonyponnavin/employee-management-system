export type Role = "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export type ManagerSummary = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  employeeId: string;
};

export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: EmployeeStatus;
  role: Role;
  reportingManager?: ManagerSummary | null;
  profileImage?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: Employee;
};

export type EmployeeListResponse = {
  data: Employee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DashboardStats = {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  departments: Array<{
    name: string;
    count: number;
  }>;
};

export type OrganizationNode = Employee & {
  _id?: string;
  children: OrganizationNode[];
};

