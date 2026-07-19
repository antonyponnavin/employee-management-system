# API Documentation

## Authentication

### `POST /api/auth/login`

Request:

```json
{
  "email": "admin@ems.local",
  "password": "Admin@123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "employee-id",
    "name": "Super Admin",
    "role": "SUPER_ADMIN"
  }
}
```

### `POST /api/auth/logout`

Response:

```json
{
  "message": "Logout successful"
}
```

## Dashboard

### `GET /api/dashboard/stats`

Returns:

- total employees
- active employees
- inactive employees
- department count
- department distribution

## Employees

### `GET /api/employees`

Query params:

- `search`
- `department`
- `role`
- `status`
- `sortBy=name|joiningDate|createdAt`
- `sortOrder=asc|desc`
- `page`
- `limit`

### `POST /api/employees`

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "phone": "+91 9999999999",
  "department": "Engineering",
  "designation": "Frontend Developer",
  "salary": 70000,
  "joiningDate": "2026-07-18",
  "status": "ACTIVE",
  "role": "EMPLOYEE",
  "reportingManager": null,
  "profileImage": null,
  "password": "ChangeMe@123"
}
```

`employeeId` is generated automatically by the server.

### `GET /api/employees/:id`

Returns one employee record.

### `PUT /api/employees/:id`

- `SUPER_ADMIN` and `HR_MANAGER` can update full employee records
- `EMPLOYEE` can only update limited self profile fields

### `DELETE /api/employees/:id`

Soft deletes an employee and marks them inactive.

### `GET /api/employees/:id/reportees`

Returns direct reports for the selected employee.

## Organization

### `GET /api/organization/tree`

Returns nested organization hierarchy.

### `PATCH /api/employees/:id/manager`

Request:

```json
{
  "reportingManager": "manager-object-id"
}
```

Use `null` to clear the current manager.

Validation:

- employee cannot report to themselves
- circular reporting is blocked
- `HR_MANAGER` cannot modify `SUPER_ADMIN` reporting
