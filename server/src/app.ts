import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { employeeRouter } from "./routes/employee.routes.js";
import { organizationRouter } from "./routes/organization.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/organization", organizationRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);

