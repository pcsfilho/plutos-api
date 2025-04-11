import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export const createUserService = async (data: CreateUserData) => {
  const userExists = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (userExists) {
    throw new Error("Usuário com este email já existe.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  // Evita retornar a senha
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
