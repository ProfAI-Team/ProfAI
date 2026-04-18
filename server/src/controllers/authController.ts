import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { badRequest, conflict, notFound, unauthorized } from "../lib/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d";

function generateToken(user: {
  id: string;
  email: string;
  name: string;
  role?: string;
  universityAccountId?: string | null;
}): string {
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRATION as any,
  };
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      // Phase 7 (7.11) — role + tenant baked into the JWT so every
      // request's RBAC check is a decode, not another DB round-trip.
      role: user.role ?? "STUDENT",
      universityAccountId: user.universityAccountId ?? null,
    },
    JWT_SECRET,
    options
  );
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, university, department } = req.body;

  if (!email || !password || !name) {
    throw badRequest("Email, password, and name are required.");
  }
  if (typeof email !== "string" || !email.includes("@")) {
    throw badRequest("Invalid email format.");
  }
  if (typeof password !== "string" || password.length < 6) {
    throw badRequest("Password must be at least 6 characters.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw conflict("A user with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      university: university || null,
      department: department || null,
    },
  });

  const token = generateToken(user);

  res.status(201).json({
    message: "User registered successfully.",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      department: user.department,
      role: user.role,
      universityAccountId: user.universityAccountId,
    },
    token,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw badRequest("Email and password are required.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw unauthorized("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw unauthorized("Invalid email or password.");
  }

  const token = generateToken(user);

  res.json({
    message: "Login successful.",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      department: user.department,
      role: user.role,
      universityAccountId: user.universityAccountId,
    },
    token,
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      university: true,
      department: true,
      createdAt: true,
      // Phase 7 (7.11 + 7.20) — client RoleGuard + Navbar depend on
      // the role + tenant being present on /me responses.
      role: true,
      universityAccountId: true,
    },
  });

  if (!user) {
    throw notFound("User not found.");
  }

  res.json({ user });
};
