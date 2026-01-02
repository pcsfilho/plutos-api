import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  createSubscription,
  listSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  markSubscriptionAsPaid,
  getUpcomingSubscriptions,
} from "../controllers/subscription.controller";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// CRUD de subscriptions
router.post("/wallets/:walletId/subscriptions", createSubscription);
router.get("/wallets/:walletId/subscriptions", listSubscriptions);
router.get("/wallets/:walletId/subscriptions/upcoming", getUpcomingSubscriptions); // Deve vir antes do /:id
router.get("/wallets/:walletId/subscriptions/:id", getSubscriptionById);
router.put("/wallets/:walletId/subscriptions/:id", updateSubscription);
router.delete("/wallets/:walletId/subscriptions/:id", deleteSubscription);

// Ação: marcar como pago
router.post(
  "/wallets/:walletId/subscriptions/:id/mark-paid",
  markSubscriptionAsPaid
);

export default router;
