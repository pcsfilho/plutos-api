import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateReminderInput {
  walletId: number;
  title: string;
  description?: string;
  dueDate: string;
  isPaid?: boolean;
}

export const createReminderService = async (data: CreateReminderInput) => {
  return prisma.reminder.create({
    data: {
      walletId: data.walletId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      isPaid: data.isPaid ?? false,
    },
  });
};

export const getRemindersByWalletService = async (walletId: number) => {
  return prisma.reminder.findMany({
    where: { walletId },
    orderBy: { dueDate: "asc" },
  });
};

export const markReminderAsPaidService = async (id: number) => {
  return prisma.reminder.update({
    where: { id },
    data: { isPaid: true },
  });
};

export const deleteReminderService = async (id: number) => {
  return prisma.reminder.delete({ where: { id } });
};
