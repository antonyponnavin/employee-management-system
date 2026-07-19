import bcrypt from "bcryptjs";

export const isPasswordHash = (value: string) => /^\$2[aby]\$\d{2}\$/.test(value);
export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hashedPassword: string) =>
  bcrypt.compare(password, hashedPassword);
