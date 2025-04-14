import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from "../controllers/transaction.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticateToken as any, createTransaction);
router.get("/", authenticateToken as any, getAllTransactions);
router.get("/:id", authenticateToken as any, getTransactionById);
router.put("/:id", authenticateToken as any, updateTransaction);
router.delete("/:id", authenticateToken as any, deleteTransaction);

export default router;
