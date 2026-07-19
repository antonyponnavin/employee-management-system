import { NextFunction, Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service.js";

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

