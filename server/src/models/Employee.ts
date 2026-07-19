import { HydratedDocument, InferSchemaType, Model, Schema, model } from "mongoose";
import { hashPassword, isPasswordHash } from "../utils/password.js";

export const employeeRoles = ["SUPER_ADMIN", "HR_MANAGER", "EMPLOYEE"] as const;
export const employeeStatuses = ["ACTIVE", "INACTIVE"] as const;

export type Role = (typeof employeeRoles)[number];
export type EmployeeStatus = (typeof employeeStatuses)[number];

const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: Number,
      required: true,
      min: 0
    },
    joiningDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: employeeStatuses,
      default: "ACTIVE"
    },
    role: {
      type: String,
      enum: employeeRoles,
      default: "EMPLOYEE"
    },
    reportingManager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
    profileImage: {
      type: String,
      default: null
    },
    password: {
      type: String,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

employeeSchema.index({ name: "text", email: "text" });

employeeSchema.pre("save", async function () {
  if (!this.isModified("password") || isPasswordHash(this.password)) {
    return;
  }

  this.password = await hashPassword(this.password);
});

employeeSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const transformed = ret as Record<string, unknown> & {
      _id?: { toString: () => string };
      __v?: unknown;
      password?: unknown;
    };

    return {
      ...transformed,
      id: transformed._id?.toString(),
      _id: undefined,
      __v: undefined,
      password: undefined
    };
  }
});

export type Employee = InferSchemaType<typeof employeeSchema>;
export type EmployeeDocument = HydratedDocument<Employee>;
export type EmployeeModel = Model<Employee>;

export const EmployeeModel = model<Employee>("Employee", employeeSchema);
