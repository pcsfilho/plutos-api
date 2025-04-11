import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// import { Controller, Get, Route, Tags, Security } from "tsoa";
const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email, password },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};
