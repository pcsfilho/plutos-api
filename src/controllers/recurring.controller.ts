// src/controllers/recurringController.ts
import { Request, Response } from "express";
import { processRecurringTransactions } from "../services/recurring.service";

export const runRecurring = async (req: Request, res: Response) => {
  try {
    const created = await processRecurringTransactions();
    res.json({ message: "Recorrências processadas", created });
  } catch (err) {
    res.status(500).json({ error: "Erro ao processar transações recorrentes" });
  }
};
