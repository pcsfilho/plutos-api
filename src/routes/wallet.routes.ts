import { Router } from "express";
import express from "express";
import {
  listWallets,
  getWalletById,
  updateWallet,
  deleteWallet,
  createWallet,
} from "../controllers/wallet.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticateToken as express.RequestHandler);

router.post("/", authenticateToken as express.RequestHandler, createWallet);
router.get("/", authenticateToken as express.RequestHandler, listWallets);
router.get("/:id", authenticateToken as express.RequestHandler, getWalletById);
router.put("/:id", authenticateToken as express.RequestHandler, updateWallet);
router.delete(
  "/:id",
  authenticateToken as express.RequestHandler,
  deleteWallet
);

export default router;
