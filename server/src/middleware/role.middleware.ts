import { NextFunction, Request, Response } from "express";
import { Role } from "../models/Employee.js";
import { ApiError } from "../utils/apiError.js";

export const requireRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have access to this resource"));
    }

    next();
  };
};

