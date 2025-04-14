// src/services/recurringService.ts
import { PrismaClient } from "@prisma/client";
import { addDays, addWeeks, addMonths, addYears, isBefore } from "date-fns";

const prisma = new PrismaClient();

function getNextDate(current: Date, interval: string | null): Date {
  switch (interval) {
    case "daily":
      return addDays(current, 1);
    case "weekly":
      return addWeeks(current, 1);
    case "monthly":
      return addMonths(current, 1);
    case "yearly":
      return addYears(current, 1);
    default:
      return current;
  }
}

export const processRecurringTransactions = async () => {
  const now = new Date();

  const recurring = await prisma.transaction.findMany({
    where: {
      isRecurring: true,
      recurrenceInterval: { not: null },
    },
  });

  const created: any[] = [];

  for (const tx of recurring) {
    const nextDate = getNextDate(tx.date, tx.recurrenceInterval);

    if (isBefore(nextDate, now)) {
      const newTx = await prisma.transaction.create({
        data: {
          walletId: tx.walletId,
          typeId: tx.typeId,
          categoryId: tx.categoryId,
          amount: tx.amount,
          description: tx.description,
          date: nextDate,
          isRecurring: true,
          recurrenceInterval: tx.recurrenceInterval,
        },
      });

      created.push(newTx);
    }
  }

  return created;
};
