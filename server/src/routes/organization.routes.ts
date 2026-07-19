import { Router } from "express";
import * as organizationController from "../controllers/organization.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const organizationRouter = Router();

organizationRouter.use(requireAuth);

organizationRouter.get("/tree", organizationController.getTree);
organizationRouter.patch("/:id/manager", organizationController.updateManager);

