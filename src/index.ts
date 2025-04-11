import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express";
import { setupSwagger } from "./config/swagger"; // ajuste o caminho conforme necessário
import walletRoutes from "./routes/wallet.routes";
import userRoutes from "./routes/user.routes";
dotenv.config();
const app = express();
app.use(express.json());

// swagger
setupSwagger(app);
app.use("/auth", authRoutes);
app.get("/", (req, res) => res.send("API online 🚀"));
app.use("/users", userRoutes);
app.use("/wallets", walletRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
