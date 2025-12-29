import { Router } from "express";
import express from "express";
import {
  createAccount,
  listAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  deactivateAccount,
  activateAccount,
} from "../controllers/account.controller";
import {
  createCategoryRule,
  listCategoryRules,
  getCategoryRuleById,
  updateCategoryRule,
  deleteCategoryRule,
} from "../controllers/category-rule.controller";
import {
  generateImportPreview,
  confirmImport,
  getImportHistory,
} from "../controllers/import.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken as express.RequestHandler);

// ===== ROTAS DE ACCOUNTS (CONTAS PF/PJ) =====

// CRUD de contas
router.post("/", createAccount);
router.get("/", listAccounts);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

// Ações especiais de conta
router.post("/:id/deactivate", deactivateAccount);
router.post("/:id/activate", activateAccount);

// ===== ROTAS DE REGRAS DE CATEGORIZAÇÃO =====

router.post("/:accountId/category-rules", createCategoryRule);
router.get("/:accountId/category-rules", listCategoryRules);
router.get("/:accountId/category-rules/:id", getCategoryRuleById);
router.put("/:accountId/category-rules/:id", updateCategoryRule);
router.delete("/:accountId/category-rules/:id", deleteCategoryRule);

// ===== ROTAS DE IMPORTAÇÃO =====

router.post(
  "/:accountId/wallets/:walletId/import-preview",
  generateImportPreview
);
router.post(
  "/:accountId/wallets/:walletId/import-confirm",
  confirmImport
);
router.get("/:accountId/import-history", getImportHistory);

export default router;
