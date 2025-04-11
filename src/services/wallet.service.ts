import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateWalletData {
  name: string;
  currency: string;
  balance: number;
  userId: number;
}

export const createWalletService = async (data: CreateWalletData) => {
  const wallet = await prisma.wallet.create({ data });
  return wallet;
};

export const listWalletsService = async (userId: number) => {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return wallets;
};

export const getWalletByIdService = async (id: number) => {
  const wallet = await prisma.wallet.findFirst({
    where: {
      id: Number(id),
    },
    include: { currency: true },
  });

  return wallet;
};

export const updateWalletService = async (
  id: number,
  name: string,
  currencyId: number
) => {
  const wallet = await prisma.wallet.updateMany({
    where: {
      id: Number(id),
    },
    data: { name, currencyId },
  });
  return wallet;
};

export const deleteWalletService = async (id: number) => {
  const wallet = await prisma.wallet.deleteMany({
    where: {
      id: Number(id),
    },
  });
  return wallet;
};
