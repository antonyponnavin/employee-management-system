import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,99}$/;

export const employeeBaseSchema = z.object({
  employeeId: z.string().trim().min(2, "Employee ID is required").optional(),
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters")
    .regex(nameRegex, "Full name contains invalid characters"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  department: z
    .string()
    .trim()
    .min(2, "Department must be at least 2 characters")
    .max(50, "Department must be under 50 characters"),
  designation: z
    .string()
    .trim()
    .min(2, "Designation must be at least 2 characters")
    .max(80, "Designation must be under 80 characters"),
  salary: z.coerce.number().positive("Salary must be greater than 0"),
  joiningDate: z.coerce.date({
    errorMap: () => ({ message: "Enter a valid joining date" })
  }),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  role: z.enum(["SUPER_ADMIN", "HR_MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
  reportingManager: z.string().nullable().optional(),
  profileImage: z
    .union([z.string().trim().url("Enter a valid profile image URL"), z.literal(""), z.null()])
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be under 100 characters")
});

export const createEmployeeSchema = employeeBaseSchema;

export const updateEmployeeSchema = employeeBaseSchema.partial().extend({
  currentPassword: z.string().min(8).optional(),
  password: z.string().min(8).optional()
});

export const selfUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters")
    .regex(nameRegex, "Full name contains invalid characters")
    .optional(),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number").optional(),
  profileImage: z
    .union([z.string().trim().url("Enter a valid profile image URL"), z.literal(""), z.null()])
    .optional(),
  currentPassword: z.string().min(8, "Current password must be at least 8 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional()
});

export const employeeListQuerySchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "HR_MANAGER", "EMPLOYEE"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  sortBy: z.enum(["name", "joiningDate", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.string().optional(),
  limit: z.string().optional(),
  includeDeleted: z.enum(["true", "false"]).optional()
});
