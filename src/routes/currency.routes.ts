import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  listCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "../controllers/currency.controller";

const router = Router();

// Listar moedas (não requer autenticação - útil para formulários públicos)
router.get("/", listCurrencies);

// Rotas autenticadas
router.get("/:id", authenticateToken, getCurrencyById);
router.post("/", authenticateToken, createCurrency);
router.put("/:id", authenticateToken, updateCurrency);
router.delete("/:id", authenticateToken, deleteCurrency);

export default router;
