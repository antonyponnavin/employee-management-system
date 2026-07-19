# Employee Management System

A full-stack Employee Management System built with React, Express, TypeScript, and MongoDB for secure employee operations, role-based access control, organizational hierarchy management, and dashboard reporting.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Query
- Backend: Node.js, Express, TypeScript
- Database: MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- Charts: Recharts

## Features

- Secure login with JWT authentication
- Role-based access control for `SUPER_ADMIN`, `HR_MANAGER`, and `EMPLOYEE`
- Employee CRUD with validation and soft delete
- Search, filter, sorting, and pagination
- Dashboard summary cards and department chart
- Reporting manager assignment
- Circular reporting prevention
- Organization tree view
- Employee self-service profile updates
- Docker support for client, server, and MongoDB

## Project Structure

```txt
client/   React frontend
server/   Express backend
docs/     API notes
```

## Environment Setup

### Server

Copy `server/.env.example` to `server/.env` and adjust values if needed.

Default seeded credentials:

- Email: `admin@ems.local`
- Password: `Admin@123`

### Client

Copy `client/.env.example` to `client/.env`.

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally or with Docker.

3. Seed the super admin:

```bash
npm run seed
```

4. Start the backend:

```bash
npm run dev:server
```

5. Start the frontend:

```bash
npm run dev:client
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Docker Run

```bash
docker compose up --build
```

## Build Verification

These commands completed successfully on July 18, 2026:

```bash
npm run build --prefix server
npm run build --prefix client
```

## API Summary

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/dashboard/stats`
- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/employees/:id/reportees`
- `PATCH /api/employees/:id/manager`
- `GET /api/organization/tree`

Detailed request notes are in [docs/api.md](docs/api.md).

## Notes

- `EMPLOYEE` users are limited to their own profile data.
- `HR_MANAGER` users cannot assign or create `SUPER_ADMIN`.
- Delete is implemented as soft delete.
- Profile images currently use URL-based storage.
