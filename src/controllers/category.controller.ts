import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  listCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  listTransactionTypesService,
} from "../services/category.service";

/**
 * GET /categories
 * Lista todas as categorias (opcionalmente filtradas por tipo)
 */
export const listCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { typeId } = req.query;

    const categories = await listCategoriesService(
      typeId ? Number(typeId) : undefined
    );

    return res.json(categories);
  } catch (error: any) {
    console.error("Erro ao listar categorias:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /categories/:id
 * Busca categoria por ID
 */
export const getCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await getCategoryByIdService(Number(id));

    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    return res.json(category);
  } catch (error: any) {
    console.error("Erro ao buscar categoria:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /categories
 * Cria nova categoria
 */
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, typeId } = req.body;

    // Validações
    if (!name || !typeId) {
      return res.status(400).json({
        error: "Campos obrigatórios: name (string), typeId (number)",
      });
    }

    const category = await createCategoryService({
      name,
      typeId: Number(typeId),
    });

    return res.status(201).json(category);
  } catch (error: any) {
    console.error("Erro ao criar categoria:", error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /categories/:id
 * Atualiza categoria
 */
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, typeId } = req.body;

    // Valida que pelo menos um campo foi enviado
    if (!name && !typeId) {
      return res.status(400).json({
        error: "Envie pelo menos um campo para atualizar: name ou typeId",
      });
    }

    const category = await updateCategoryService(Number(id), {
      name,
      typeId: typeId ? Number(typeId) : undefined,
    });

    return res.json(category);
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /categories/:id
 * Deleta categoria
 */
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteCategoryService(Number(id));

    return res.json({ message: "Categoria deletada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar categoria:", error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * GET /categories/types
 * Lista tipos de transação disponíveis (Entrada/Saída)
 */
export const listTransactionTypes = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const types = await listTransactionTypesService();
    return res.json(types);
  } catch (error: any) {
    console.error("Erro ao listar tipos:", error);
    return res.status(500).json({ error: error.message });
  }
};
