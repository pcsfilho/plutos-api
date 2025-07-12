# 💰 Plutos API

**Plutos API** is a **personal financial management** solution built with Node.js and TypeScript. It provides a robust backend API for managing wallets, transactions, reminders, and more.

---

## 🚀 Tech Stack

- Node.js + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication
- Swagger for API documentation
- Docker (optional for deployment)

---

## 📦 Available Scripts

| Command                         | Description                            |
| ------------------------------- | -------------------------------------- |
| `npm run dev`                   | Starts the API in development mode     |
| `npm run build`                 | Compiles TypeScript code into `dist/`  |
| `npm start`                     | Runs the compiled project              |
| `npm run prisma`                | Shortcut for Prisma commands           |
| `npm run prisma:generate`       | Generates Prisma client from schema    |
| `npm run prisma:migrate`        | Runs development migrations            |
| `npm run prisma:migrate:deploy` | Applies migrations in production       |
| `npm run prisma:studio`         | Opens Prisma Studio (UI to view data)  |
| `npm run prisma:format`         | Formats the `schema.prisma` file       |
| `npm run prisma:reset`          | Resets database and applies migrations |

---

## 🗺️ Roadmap

### ✅ Phase 1 – MVP (Implemented)

- [x] JWT Authentication
- [x] User registration
- [x] Wallet CRUD
- [x] Transactions CRUD (with categories and types)
- [x] Payment reminders CRUD
- [x] Swagger API documentation

---

### 🚧 Phase 2 – Advanced Features

| Item                      | Description                                    | Priority |
| ------------------------- | ---------------------------------------------- | -------- |
| 🔄 Recurring Transactions | Automatically generate monthly transactions    | High     |
| 📊 Financial Dashboard    | Display total balance, income/expenses, charts | High     |
| 🧾 Transaction Filters    | Filter by wallet, type, category, date         | High     |
| 🛑 User Validation        | Ensure data belongs to the authenticated user  | High     |
| 📁 Receipt Attachments    | Upload images or PDFs to transactions          | Medium   |
| 📤 Export to CSV/PDF      | Generate reports by date range                 | Medium   |
| 🌐 Currency Conversion    | Unified balance view using exchange rates      | Low      |

---

### 🧪 Phase 3 – UX and Scalability

| Item                           | Description                              | Priority |
| ------------------------------ | ---------------------------------------- | -------- |
| 🛡️ 2FA / Email Verification    | Strengthen account security              | Medium   |
| 🧑‍🤝‍🧑 Shared Wallets              | Multi-user access with permission levels | Medium   |
| 🔔 Email Notifications         | Reminders, low balance alerts, etc.      | Medium   |
| 📱 Mobile App (Vue or Flutter) | Consume API with a native or PWA app     | Low      |

---

### 📆 Phase 4 – Maintenance, Testing & Deployment

| Item                          | Description                             | Priority |
| ----------------------------- | --------------------------------------- | -------- |
| 🔧 Unit and Integration Tests | Ensure code quality and stability       | High     |
| 📦 Cloud Deployment           | Deploy on Render, Railway, or VPS       | High     |
| 🗄️ Seed and Test Data         | Populate database with example data     | Medium   |
| 📝 Technical Documentation    | Explain how to run, use, and contribute | Medium   |

---

### 💡 Future Ideas / Extras

| Item           | Description                                       |
| -------------- | ------------------------------------------------- |
| 💬 AI Insights | Financial advice, alerts, and savings suggestions |
| 📍 Geolocation | Tag purchase locations (useful for mobile)        |
| 🔗 Public API  | Allow third-party integrations with tokens        |

---

## 📊 Planned Endpoints Example

- `GET /dashboard?walletId=1&month=04&year=2025` → Financial dashboard
- `GET /transactions?walletId=1&typeId=2&month=04&year=2025` → Filtered transactions by type, month, and wallet

---

## 🧑‍💻 Contributing

Feel free to open issues, suggest features, or submit pull requests. This project is under active development!

---

## 📄 License

MIT © Paulo Filho  
[https://pcsfor.com.br](https://pcsfor.com.br)

---
