import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import * as organizationController from "../controllers/organization.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/role.middleware.js";

export const employeeRouter = Router();

employeeRouter.use(requireAuth);

employeeRouter.get("/", employeeController.listEmployees);
employeeRouter.post("/", requireRoles("SUPER_ADMIN", "HR_MANAGER"), employeeController.createEmployee);
employeeRouter.get("/:id", employeeController.getEmployee);
employeeRouter.put("/:id", employeeController.updateEmployee);
employeeRouter.delete("/:id", requireRoles("SUPER_ADMIN"), employeeController.deleteEmployee);
employeeRouter.get("/:id/reportees", employeeController.getReportees);
employeeRouter.patch("/:id/manager", organizationController.updateManager);
