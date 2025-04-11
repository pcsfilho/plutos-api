import { Router } from "express";
import { createUser } from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", createUser);

// Exemplo de rota protegida
router.get("/me", authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({ message: "Usuário autenticado", user });
});

export default router;
