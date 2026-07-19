import { EmployeeModel } from "../models/Employee.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword, isPasswordHash } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

export const login = async (email: string, password: string) => {
  const employee = await EmployeeModel.findOne({
    email: email.toLowerCase(),
    isDeleted: false
  }).populate("reportingManager", "name email employeeId");

  if (!employee) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!isPasswordHash(employee.password)) {
    throw new ApiError(500, "Account password is stored in an invalid format. Please reset it.");
  }

  const isValidPassword = await comparePassword(password, employee.password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({
    id: employee.id,
    role: employee.role
  });

  return {
    token,
    user: employee.toJSON()
  };
};
