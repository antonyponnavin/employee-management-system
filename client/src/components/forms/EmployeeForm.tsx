import { FormEvent, ReactNode, useEffect, useState } from "react";
import { CustomSelect } from "../common/CustomSelect";
import { Employee, Role } from "../../types";

type EmployeeFormValues = {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: string;
  joiningDate: string;
  status: "ACTIVE" | "INACTIVE";
  role: Role;
  reportingManager: string;
  profileImage: string;
  password: string;
};

type EmployeeFormProps = {
  mode: "create" | "edit";
  employee?: Employee | null;
  managers: Employee[];
  currentRole: Role;
  onSubmit: (payload: Record<string, unknown>) => Promise<unknown>;
  submitting: boolean;
  errorMessage?: string;
  serverFieldErrors?: Record<string, string>;
};

type EmployeeFormErrorKey =
  | "name"
  | "email"
  | "phone"
  | "department"
  | "designation"
  | "salary"
  | "joiningDate"
  | "profileImage"
  | "password";

type FieldProps = {
  label: string;
  children: ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <label className="block space-y-2">
    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const validateEmployeeForm = (
  values: EmployeeFormValues,
  mode: "create" | "edit"
): Partial<Record<EmployeeFormErrorKey, string>> => {
  const errors: Partial<Record<EmployeeFormErrorKey, string>> = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required";
  } else if (values.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!phoneRegex.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number";
  }

  if (!values.department.trim()) {
    errors.department = "Department is required";
  } else if (values.department.trim().length < 2) {
    errors.department = "Department must be at least 2 characters";
  }

  if (!values.designation.trim()) {
    errors.designation = "Designation is required";
  } else if (values.designation.trim().length < 2) {
    errors.designation = "Designation must be at least 2 characters";
  }

  if (!values.salary.trim()) {
    errors.salary = "Salary is required";
  } else if (Number(values.salary) <= 0 || Number.isNaN(Number(values.salary))) {
    errors.salary = "Salary must be greater than 0";
  }

  if (!values.joiningDate.trim()) {
    errors.joiningDate = "Joining date is required";
  }

  if (values.profileImage.trim() && !urlRegex.test(values.profileImage.trim())) {
    errors.profileImage = "Enter a valid profile image URL";
  }

  if (mode === "create") {
    if (!values.password.trim()) {
      errors.password = "Password is required";
    } else if (values.password.trim().length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
  } else if (values.password.trim() && values.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
};

const emptyValues: EmployeeFormValues = {
  employeeId: "Auto-generated",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  joiningDate: "",
  status: "ACTIVE",
  role: "EMPLOYEE",
  reportingManager: "",
  profileImage: "",
  password: ""
};

const allowedManagerRolesByEmployeeRole: Record<Role, Role[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN"],
  HR_MANAGER: ["SUPER_ADMIN"],
  EMPLOYEE: ["SUPER_ADMIN", "HR_MANAGER"]
};

export const EmployeeForm = ({
  mode,
  employee,
  managers,
  currentRole,
  onSubmit,
  submitting,
  errorMessage,
  serverFieldErrors = {}
}: EmployeeFormProps) => {
  const [values, setValues] = useState<EmployeeFormValues>(emptyValues);
  const [clientFieldErrors, setClientFieldErrors] = useState<
    Partial<Record<EmployeeFormErrorKey, string>>
  >({});
  const eligibleManagers = managers.filter((manager) => {
    if (manager.id === employee?.id) {
      return false;
    }

    return allowedManagerRolesByEmployeeRole[values.role].includes(manager.role);
  });

  useEffect(() => {
    if (!employee) {
      setValues(emptyValues);
      return;
    }

    setValues({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      salary: String(employee.salary),
      joiningDate: employee.joiningDate.slice(0, 10),
      status: employee.status,
      role: employee.role,
      reportingManager: employee.reportingManager?.id || employee.reportingManager?._id || "",
      profileImage: employee.profileImage || "",
      password: ""
    });
  }, [employee]);

  useEffect(() => {
    if (
      values.reportingManager &&
      !eligibleManagers.some((manager) => manager.id === values.reportingManager)
    ) {
      setValues((prev) => ({ ...prev, reportingManager: "" }));
    }
  }, [eligibleManagers, values.reportingManager]);

  const fieldErrors = {
    ...serverFieldErrors,
    ...clientFieldErrors
  };

  const updateField = <K extends keyof EmployeeFormValues>(field: K, value: EmployeeFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setClientFieldErrors((prev) => {
      if (!(field in prev)) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[field as EmployeeFormErrorKey];
      return nextErrors;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateEmployeeForm(values, mode);
    setClientFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: Record<string, unknown> = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      department: values.department.trim(),
      designation: values.designation.trim(),
      salary: Number(values.salary),
      joiningDate: values.joiningDate,
      status: values.status,
      role: values.role,
      reportingManager: values.reportingManager || null,
      profileImage: values.profileImage.trim() || null
    };

    if (values.password.trim()) {
      payload.password = values.password.trim();
    }

    await onSubmit(payload);
  };

  const disableSuperAdmin = currentRole === "HR_MANAGER";

  return (
    <form className="card space-y-6 p-6" noValidate onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Employee ID">
          <input
            className="input"
            placeholder="Auto-generated"
            value={values.employeeId}
            readOnly
            disabled
          />
        </Field>
        <Field label="Full Name">
          <input
            className="input"
            placeholder="Jane Doe"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
          {fieldErrors.name ? <p className="text-sm text-rose-600">{fieldErrors.name}</p> : null}
        </Field>
        <Field label="Email">
          <input
            className="input"
            type="text"
            placeholder="jane@company.com"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          {fieldErrors.email ? <p className="text-sm text-rose-600">{fieldErrors.email}</p> : null}
        </Field>
        <Field label="Phone Number">
          <input
            className="input"
            placeholder="+91 9876543210"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          {fieldErrors.phone ? <p className="text-sm text-rose-600">{fieldErrors.phone}</p> : null}
        </Field>
        <Field label="Department">
          <input
            className="input"
            placeholder="Engineering"
            value={values.department}
            onChange={(event) => updateField("department", event.target.value)}
          />
          {fieldErrors.department ? (
            <p className="text-sm text-rose-600">{fieldErrors.department}</p>
          ) : null}
        </Field>
        <Field label="Designation">
          <input
            className="input"
            placeholder="Software Engineer"
            value={values.designation}
            onChange={(event) => updateField("designation", event.target.value)}
          />
          {fieldErrors.designation ? (
            <p className="text-sm text-rose-600">{fieldErrors.designation}</p>
          ) : null}
        </Field>
        <Field label="Salary">
          <input
            className="input"
            type="number"
            placeholder="50000"
            value={values.salary}
            onChange={(event) => updateField("salary", event.target.value)}
          />
          {fieldErrors.salary ? <p className="text-sm text-rose-600">{fieldErrors.salary}</p> : null}
        </Field>
        <Field label="Joining Date">
          <input
            className="input"
            type="date"
            value={values.joiningDate}
            onChange={(event) => updateField("joiningDate", event.target.value)}
          />
          {fieldErrors.joiningDate ? (
            <p className="text-sm text-rose-600">{fieldErrors.joiningDate}</p>
          ) : null}
        </Field>
        <Field label="Status">
          <CustomSelect
            value={values.status}
            onChange={(value) =>
              setValues((prev) => ({
                ...prev,
                status: value as "ACTIVE" | "INACTIVE"
              }))
            }
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" }
            ]}
          />
        </Field>
        <Field label="Role">
          <CustomSelect
            value={values.role}
            onChange={(value) =>
              setValues((prev) => ({
                ...prev,
                role: value as Role
              }))
            }
            options={[
              { label: "Employee", value: "EMPLOYEE" },
              { label: "HR Manager", value: "HR_MANAGER" },
              { label: "Super Admin", value: "SUPER_ADMIN", disabled: disableSuperAdmin }
            ]}
          />
        </Field>
        <Field label="Reporting Manager">
          <CustomSelect
            value={values.reportingManager}
            onChange={(value) =>
              setValues((prev) => ({
                ...prev,
                reportingManager: value
              }))
            }
            options={[
              { label: "No manager", value: "" },
              ...eligibleManagers.map((manager) => ({
                label: `${manager.name} (${manager.employeeId}) - ${manager.role.replace("_", " ")}`,
                value: manager.id
              }))
            ]}
          />
        </Field>
        <Field label="Profile Image URL">
          <input
            className="input"
            type="url"
            name="profileImageUrl"
            autoComplete="off"
            placeholder="https://example.com/avatar.jpg"
            value={values.profileImage}
            spellCheck={false}
            onChange={(event) => updateField("profileImage", event.target.value)}
          />
          {fieldErrors.profileImage ? (
            <p className="text-sm text-rose-600">{fieldErrors.profileImage}</p>
          ) : null}
        </Field>
        <Field label={mode === "create" ? "Password" : "New Password"}>
          <input
            className="input"
            type="password"
            placeholder={mode === "create" ? "Minimum 8 characters" : "Leave blank to keep current password"}
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          {fieldErrors.password ? (
            <p className="text-sm text-rose-600">{fieldErrors.password}</p>
          ) : null}
        </Field>
      </div>
      <div className="flex justify-end">
        <button className="button-primary" disabled={submitting} type="submit">
          {submitting ? "Saving..." : mode === "create" ? "Create employee" : "Update employee"}
        </button>
      </div>
    </form>
  );
};
