import { connectDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { EmployeeModel } from "../models/Employee.js";
import { hashPassword } from "../utils/password.js";

const seed = async () => {
  await connectDatabase();

  const existingUser = await EmployeeModel.findOne({ email: env.SUPER_ADMIN_EMAIL.toLowerCase() });
  if (existingUser) {
    console.log("Super admin already exists");
    process.exit(0);
  }

  await EmployeeModel.create({
    employeeId: "EMP-001",
    name: "Super Admin",
    email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
    phone: "+91 9876543210",
    department: "Management",
    designation: "Super Admin",
    salary: 100000,
    joiningDate: new Date(),
    status: "ACTIVE",
    role: "SUPER_ADMIN",
    password: await hashPassword(env.SUPER_ADMIN_PASSWORD)
  });

  console.log("Super admin seeded successfully");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Failed to seed super admin", error);
  process.exit(1);
});
