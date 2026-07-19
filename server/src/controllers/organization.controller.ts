import { NextFunction, Request, Response } from "express";
import { updateManagerSchema } from "../validations/manager.validation.js";
import * as organizationService from "../services/organization.service.js";

const getRouteId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? "";

export const getTree = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await organizationService.getOrganizationTree();
    res.json(tree);
  } catch (error) {
    next(error);
  }
};

export const updateManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getRouteId(req.params.id);
    const payload = updateManagerSchema.parse(req.body);
    const employee = await organizationService.updateManager(
      id,
      payload.reportingManager,
      req.user!.role
    );
    res.json(employee);
  } catch (error) {
    next(error);
  }
};
