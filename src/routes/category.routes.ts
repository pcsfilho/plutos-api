import { Router } from "express";
import express from "express";
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  listTransactionTypes,
} from "../controllers/category.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken as express.RequestHandler);

// ===== ROTAS DE TIPOS DE TRANSAÇÃO =====

/**
 * GET /categories/types
 * Lista tipos de transação (Entrada/Saída)
 */
router.get("/types", listTransactionTypes);

// ===== ROTAS DE CATEGORIAS =====

/**
 * GET /categories
 * Lista todas as categorias
 * Query params opcionais:
 *   - typeId: number (filtra por tipo: 1=Entrada, 2=Saída)
 */
router.get("/", listCategories);

/**
 * GET /categories/:id
 * Busca categoria por ID
 */
router.get("/:id", getCategoryById);

/**
 * POST /categories
 * Cria nova categoria
 * Body: { name: string, typeId: number }
 */
router.post("/", createCategory);

/**
 * PUT /categories/:id
 * Atualiza categoria
 * Body: { name?: string, typeId?: number }
 */
router.put("/:id", updateCategory);

/**
 * DELETE /categories/:id
 * Deleta categoria (se não tiver transações vinculadas)
 */
router.delete("/:id", deleteCategory);

export default router;
