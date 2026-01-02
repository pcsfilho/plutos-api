// src/controllers/recurringController.ts
// DEPRECATED: Este controller está deprecado
// Use o sistema de Subscriptions ao invés de recurring transactions automáticas
// Rotas: /wallets/:walletId/subscriptions

import { Request, Response } from "express";
import { processRecurringTransactions } from "../services/recurring.service.legacy";

export const runRecurring = async (req: Request, res: Response) => {
  try {
    // AVISO: Esta funcionalidade está deprecada
    console.warn("WARNING: recurring.controller is deprecated. Use subscriptions instead.");

    const created = await processRecurringTransactions();
    res.json({
      message: "Recorrências processadas (DEPRECADO - use Subscriptions)",
      created,
      warning: "Esta API está deprecada. Migre para /wallets/:walletId/subscriptions"
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao processar transações recorrentes" });
  }
};
