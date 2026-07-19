import { Request, Response, NextFunction } from "express";
import { loginSchema } from "../validations/auth.validation.js";
import * as authService from "../services/auth.service.js";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body);
    const response = await authService.login(payload.email, payload.password);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.json({ message: "Logout successful" });
};

