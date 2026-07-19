import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Role } from "../models/Employee.js";
import type { Secret, SignOptions } from "jsonwebtoken";

type TokenPayload = {
  id: string;
  role: Role;
};

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET as Secret, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;
