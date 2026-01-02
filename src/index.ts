import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";
import { setupSwagger } from "./config/swagger"; // ajuste o caminho conforme necessário
import walletRoutes from "./routes/wallet.routes";
import userRoutes from "./routes/user.routes";
import recurringRoutes from "./routes/recurring.routes";
import reminderRoutes from "./routes/reminder.routes";
import transactionRoutes from "./routes/transactions.routes";
import accountRoutes from "./routes/account.routes"; // NOVO: Rotas de contas PF/PJ e importação
import subscriptionRoutes from "./routes/subscription.routes"; // NOVO: Subscriptions (estilo Firefly III)
import currencyRoutes from "./routes/currency.routes"; // Rotas de moedas
import categoryRoutes from "./routes/category.routes"; // Rotas de categorias

dotenv.config();
const app = express();
const cors = require("cors");

app.use(express.json());
// Configurações do CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend rodando no Vite
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
  })
);

// swagger
setupSwagger(app);
app.use("/auth", authRoutes);
app.get("/", (req, res) => res.send("PLUTOS API IS ONLINE 🚀"));
app.use("/users", userRoutes);
app.use("/accounts", accountRoutes); // NOVO: Contas PF/PJ, regras e importação
app.use("/wallets", walletRoutes);
app.use("/recurrings", recurringRoutes);
app.use("/reminders", reminderRoutes);
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes); // Categorias
app.use("/currencies", currencyRoutes); // Moedas
app.use(subscriptionRoutes); // NOVO: Subscriptions (Firefly III style)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
