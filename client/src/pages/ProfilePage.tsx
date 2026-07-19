import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { updateEmployee } from "../api/employeeApi";
import { Avatar } from "../components/common/Avatar";
import { useAuth } from "../features/auth/authContext";
import { EmployeeStatus } from "../types";

type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: string;
  joiningDate: string;
  status: EmployeeStatus;
  profileImage: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{value}</p>
  </div>
);

export const ProfilePage = () => {
  const { user, setCurrentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [values, setValues] = useState<ProfileFormValues>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    designation: user?.designation || "",
    salary: user?.salary ? String(user.salary) : "",
    joiningDate: user?.joiningDate?.slice(0, 10) || "",
    status: user?.status || "ACTIVE",
    profileImage: user?.profileImage || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) return;

    setValues({
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      salary: String(user.salary),
      joiningDate: user.joiningDate.slice(0, 10),
      status: user.status,
      profileImage: user.profileImage || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  }, [user]);

  const canEditAdminFields = user?.role !== "EMPLOYEE";

  const mutation = useMutation({
    mutationFn: async () => {
      const payload =
        user?.role === "EMPLOYEE"
          ? {
              name: values.name,
              phone: values.phone,
              profileImage: values.profileImage || null,
              ...(values.newPassword
                ? {
                    currentPassword: values.currentPassword,
                    password: values.newPassword
                  }
                : {})
            }
          : {
              name: values.name,
              email: values.email,
              phone: values.phone,
              department: values.department,
              designation: values.designation,
              salary: Number(values.salary),
              joiningDate: values.joiningDate,
              status: values.status,
              profileImage: values.profileImage || null,
              ...(values.newPassword
                ? {
                    currentPassword: values.currentPassword,
                    password: values.newPassword
                  }
                : {})
            };

      return updateEmployee(user!.id, payload);
    },
    onSuccess: async (updatedUser) => {
      setCurrentUser(updatedUser);
      setIsEditing(false);
      setFormError("");
      queryClient.setQueryData(["employee", user?.id], updatedUser);
      await queryClient.invalidateQueries({ queryKey: ["employee", user?.id] });
    }
  });

  if (!user) {
    return <div className="card p-6">Loading profile...</div>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (values.newPassword || values.currentPassword || values.confirmPassword) {
      if (!values.currentPassword) {
        setFormError("Current password is required to set a new password.");
        return;
      }

      if (values.newPassword.length < 8) {
        setFormError("New password must be at least 8 characters.");
        return;
      }

      if (values.newPassword !== values.confirmPassword) {
        setFormError("New password and confirm password must match.");
        return;
      }
    }

    await mutation.mutateAsync();
  };

  const handleCancel = () => {
    setValues({
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      salary: String(user.salary),
      joiningDate: user.joiningDate.slice(0, 10),
      status: user.status,
      profileImage: user.profileImage || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setFormError("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pt-4 md:pt-6">
      <section className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={values.name || user.name}
            imageUrl={values.profileImage || user.profileImage}
            size="xl"
          />
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">My Profile</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{user.name}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {user.designation} in {user.department}
            </p>
          </div>
        </div>
        {!isEditing ? (
          <button className="button-primary" onClick={() => setIsEditing(true)} type="button">
            Edit profile
          </button>
        ) : null}
      </section>

      {!isEditing ? (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Employee ID" value={user.employeeId} />
              <Field label="Role" value={user.role.replace("_", " ")} />
              <Field label="Email" value={user.email} />
              <Field label="Phone" value={user.phone} />
              <Field label="Department" value={user.department} />
              <Field label="Designation" value={user.designation} />
              <Field
                label="Joining Date"
                value={new Date(user.joiningDate).toLocaleDateString("en-GB")}
              />
              <Field label="Status" value={user.status} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Reporting Manager
              </p>
              <p className="mt-3 text-lg font-medium text-slate-900 dark:text-slate-100">
                {user.reportingManager?.name || "No manager assigned"}
              </p>
            </div>
            <div className="card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Access Level
              </p>
              <p className="mt-3 text-lg font-medium text-slate-900 dark:text-slate-100">
                {user.role === "EMPLOYEE"
                  ? "You can update your personal contact details and avatar."
                  : "You can update your own profile details from this page."}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <form className="card max-w-4xl space-y-6 p-6" onSubmit={handleSubmit}>
          <div className={`grid gap-4 ${canEditAdminFields ? "md:grid-cols-2" : ""}`}>
            <input
              className="input"
              value={values.name}
              placeholder="Full name"
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              className="input"
              value={values.phone}
              placeholder="Phone number"
              onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
            />

            {canEditAdminFields ? (
              <>
                <input
                  className="input"
                  type="email"
                  value={values.email}
                  placeholder="Email"
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                <input
                  className="input"
                  value={values.department}
                  placeholder="Department"
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
                <input
                  className="input"
                  value={values.designation}
                  placeholder="Designation"
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, designation: event.target.value }))
                  }
                />
                <input
                  className="input"
                  type="number"
                  value={values.salary}
                  placeholder="Salary"
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, salary: event.target.value }))
                  }
                />
                <input
                  className="input"
                  type="date"
                  value={values.joiningDate}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, joiningDate: event.target.value }))
                  }
                />
                <select
                  className="select"
                  value={values.status}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      status: event.target.value as EmployeeStatus
                    }))
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </>
            ) : null}

            <input
              className={`input ${canEditAdminFields ? "md:col-span-2" : ""}`.trim()}
              type="url"
              name="profileImageUrl"
              autoComplete="off"
              placeholder="Profile image URL"
              spellCheck={false}
              value={values.profileImage}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, profileImage: event.target.value }))
              }
            />

            <input
              className={`input ${canEditAdminFields ? "md:col-span-2" : ""}`.trim()}
              type="password"
              placeholder="Current password"
              value={values.currentPassword}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
            />
            <input
              className="input"
              type="password"
              placeholder="New password"
              value={values.newPassword}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, newPassword: event.target.value }))
              }
            />
            <input
              className="input"
              type="password"
              placeholder="Confirm new password"
              value={values.confirmPassword}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
            />
          </div>

          {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}

          <div className="flex justify-end gap-3">
            <button className="button-secondary" onClick={handleCancel} type="button">
              Cancel
            </button>
            <button className="button-primary" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
