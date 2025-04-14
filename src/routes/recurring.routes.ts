// src/routes/recurringRoutes.ts
import express from "express";
import { runRecurring } from "../controllers/recurring.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post(
  "/transactions/recurring/run",
  authenticateToken as any,
  runRecurring
);

export default router;
