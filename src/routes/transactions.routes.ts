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

router.post("/", authenticateToken, createTransaction);
router.get("/", authenticateToken, getAllTransactions);
router.get("/:id", authenticateToken, getTransactionById);
router.put("/:id", authenticateToken, updateTransaction);
router.delete("/:id", authenticateToken, deleteTransaction);

export default router;
