// src/routes/reminderRoutes.ts
import express from "express";
import {
  createReminder,
  getRemindersByWallet,
  markReminderAsPaid,
  deleteReminder,
} from "../controllers/reminder.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/reminders", createReminder);
router.get("/reminders/wallet/:walletId", getRemindersByWallet);
router.patch("/reminders/:id/pay", markReminderAsPaid);
router.delete("/reminders/:id", deleteReminder);

export default router;
