// src/controllers/reminderController.ts
import { Request, Response } from "express";
import {
  createReminderService,
  deleteReminderService,
  getRemindersByWalletService,
  markReminderAsPaidService,
} from "../services/reminder.service";

export const createReminder = async (req: Request, res: Response) => {
  try {
    const reminder = await createReminderService(req.body);
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar lembrete" });
  }
};

export const getRemindersByWallet = async (req: Request, res: Response) => {
  try {
    const walletId = parseInt(req.params.walletId);
    const reminders = await getRemindersByWalletService(walletId);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar lembretes" });
  }
};

export const markReminderAsPaid = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await markReminderAsPaidService(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Erro ao marcar como pago" });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await deleteReminderService(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar lembrete" });
  }
};
