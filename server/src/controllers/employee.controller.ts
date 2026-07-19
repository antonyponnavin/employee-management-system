import { NextFunction, Request, Response } from "express";
import * as employeeService from "../services/employee.service.js";
import {
  createEmployeeSchema,
  employeeListQuerySchema,
  selfUpdateSchema,
  updateEmployeeSchema
} from "../validations/employee.validation.js";

const getRouteId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? "";

export const listEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = employeeListQuerySchema.parse(req.query);
    const data =
      req.user?.role === "EMPLOYEE"
        ? {
            data: [await employeeService.getEmployeeById(req.user.id, req.user.role, req.user.id)],
            meta: {
              page: 1,
              limit: 1,
              total: 1,
              totalPages: 1
            }
          }
        : await employeeService.listEmployees(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getRouteId(req.params.id);
    const employee = await employeeService.getEmployeeById(
      id,
      req.user?.role,
      req.user?.id
    );
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createEmployeeSchema.parse(req.body);
    const employee = await employeeService.createEmployee(payload, req.user!.role);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getRouteId(req.params.id);
    const payload =
      req.user?.role === "EMPLOYEE"
        ? selfUpdateSchema.parse(req.body)
        : updateEmployeeSchema.parse(req.body);
    const employee = await employeeService.updateEmployee(
      id,
      payload,
      req.user!.role,
      req.user!.id
    );
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getRouteId(req.params.id);
    await employeeService.softDeleteEmployee(id, req.user!.role);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getReportees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getRouteId(req.params.id);
    const reportees = await employeeService.getDirectReportees(id);
    res.json(reportees);
  } catch (error) {
    next(error);
  }
};
