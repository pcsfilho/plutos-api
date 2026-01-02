# 💰 Plutos API

**Plutos API** é uma solução completa de **gestão financeira pessoal e empresarial** construída com Node.js, TypeScript e Prisma. Inspirada no Firefly III, oferece recursos avançados de controle de contas PF/PJ, importação de faturas, categorização automática e gestão de assinaturas recorrentes.

---

## 🚀 Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger/OpenAPI
- **File Processing:** Multer + CSV Parser
- **Deployment:** Docker-ready

---

## ✨ Features Implementadas

### 🔐 **Autenticação e Usuários**
- [x] Registro de usuários com senha hash (bcrypt)
- [x] Login com JWT
- [x] Proteção de rotas com middleware de autenticação

### 🏦 **Contas PF/PJ (Multi-Account)**
- [x] Suporte a múltiplas contas por usuário
- [x] Contas Pessoa Física (PF) e Pessoa Jurídica (PJ)
- [x] Ativação/desativação de contas
- [x] Relacionamento Account → Wallets → Transactions

### 💳 **Carteiras (Wallets)**
- [x] Tipos: Conta Corrente, Poupança, Cartão de Crédito, Dinheiro
- [x] Suporte a múltiplas moedas (Currency)
- [x] Saldo inicial e limite de crédito (para cartões)
- [x] Dia de vencimento e fechamento da fatura

### 💰 **Transações Completas**
- [x] CRUD completo de transações
- [x] Tipos: Entrada (receitas) e Saída (despesas)
- [x] Categorização por categoria personalizada
- [x] **Paginação** (50 itens por página, máx 100)
- [x] **11 Filtros avançados:**
  - `walletId` - Carteira específica
  - `accountId` - Todas as transações da conta
  - `startDate` / `endDate` - Período
  - `typeId` - Entrada ou Saída
  - `categoryId` - Categoria específica
  - `subscriptionId` - Assinatura vinculada
  - `importedFrom` - Importação específica
  - `isImported` - Apenas importadas ou manuais
  - `hasSubscription` - Com ou sem subscription
  - `description` - Busca por texto (case-insensitive)
  - `page` / `limit` - Controle de paginação

### 🏷️ **Categorias**
- [x] CRUD completo de categorias
- [x] Categorias de Entrada e Saída
- [x] 16 categorias pré-cadastradas (seed)
- [x] Filtro por tipo (Entrada/Saída)
- [x] Validação de duplicatas
- [x] Proteção contra exclusão (se tiver transações vinculadas)

### 📥 **Importação de Faturas CSV**
- [x] **4 Bancos suportados:** Nubank, C6, Inter, Generic
- [x] **Preview antes de importar** (detecta duplicatas, sugere categorias)
- [x] **Detecção automática de duplicatas**
- [x] **Categorização automática** via regras
- [x] **Auto-matching com subscriptions** (confiança ≥ 50%)
- [x] **Histórico de importações** com estatísticas
- [x] **Suporte a múltiplos formatos:**
  - Nubank: CSV com vírgula, formato YYYY-MM-DD
  - C6: CSV com ponto-e-vírgula, formato DD/MM/YYYY
  - Inter: CSV padrão
  - Generic: CSV flexível
- [x] Upload via multipart/form-data ou JSON direto
- [x] Validação de formato e codificação
- [x] Normalização de valores (sempre positivos no banco)
- [x] Determinação automática de tipo (Entrada/Saída) por banco

### 🔄 **Assinaturas Recorrentes (Subscriptions)**
- [x] Gerenciamento de contas recorrentes (Netflix, Aluguel, etc.)
- [x] Frequências: DAILY, WEEKLY, MONTHLY, YEARLY
- [x] Valores esperados (min/max) para contas variáveis
- [x] Auto-matching com transações importadas (via pattern)
- [x] Atualização automática de lastPaidDate e nextDueDate
- [x] Controle de assinaturas ativas/inativas

### 📏 **Regras de Categorização**
- [x] Criação de regras por conta (PF/PJ)
- [x] Regras opcionais por wallet
- [x] Pattern matching (ex: "uber" → Transporte)
- [x] Sistema de prioridade
- [x] Aplicação automática na importação

### 🔔 **Lembretes (Reminders)**
- [x] CRUD de lembretes vinculados a wallets
- [x] Controle de status (pago/não pago)
- [x] Data de vencimento

### 💱 **Moedas (Currencies)**
- [x] Suporte a múltiplas moedas
- [x] Taxa de câmbio configurável
- [x] BRL (Real) pré-cadastrado

---

## 📋 Endpoints Disponíveis

### **Autenticação**
```
POST   /auth/register          - Registrar novo usuário
POST   /auth/login             - Login e geração de token JWT
```

### **Usuários**
```
GET    /users                  - Listar usuários
GET    /users/:id              - Buscar usuário por ID
PUT    /users/:id              - Atualizar usuário
DELETE /users/:id              - Deletar usuário
```

### **Contas (Accounts)**
```
POST   /accounts               - Criar conta (PF/PJ)
GET    /accounts               - Listar contas
GET    /accounts/:id           - Buscar conta por ID
PUT    /accounts/:id           - Atualizar conta
DELETE /accounts/:id           - Deletar conta
POST   /accounts/:id/activate  - Ativar conta
POST   /accounts/:id/deactivate - Desativar conta
GET    /accounts/:id/subscriptions/upcoming - Próximas assinaturas
```

### **Carteiras (Wallets)**
```
POST   /wallets                - Criar carteira
GET    /wallets                - Listar carteiras
GET    /wallets/:id            - Buscar carteira por ID
PUT    /wallets/:id            - Atualizar carteira
DELETE /wallets/:id            - Deletar carteira
```

### **Transações**
```
POST   /transactions           - Criar transação
GET    /transactions           - Listar transações (com paginação + 11 filtros)
GET    /transactions/:id       - Buscar transação por ID
PUT    /transactions/:id       - Atualizar transação
DELETE /transactions/:id       - Deletar transação
```

**Filtros disponíveis:**
```
?walletId=6                     - Carteira específica
?accountId=3                    - Todas as transações da conta
?startDate=2025-01-01           - Data inicial
?endDate=2025-01-31             - Data final
?typeId=2                       - Tipo (1=Entrada, 2=Saída)
?categoryId=5                   - Categoria
?subscriptionId=12              - Subscription vinculada
?importedFrom=import_123        - Importação específica
?isImported=true                - Apenas importadas
?hasSubscription=true           - Com subscription
?description=netflix            - Busca por texto
?page=1&limit=50                - Paginação
```

### **Categorias**
```
GET    /categories/types       - Listar tipos (Entrada/Saída)
GET    /categories             - Listar categorias
GET    /categories?typeId=1    - Filtrar por tipo
GET    /categories/:id         - Buscar categoria por ID
POST   /categories             - Criar categoria
PUT    /categories/:id         - Atualizar categoria
DELETE /categories/:id         - Deletar categoria
```

### **Importação de CSV**
```
POST   /accounts/:accountId/wallets/:walletId/import-preview  - Preview da importação
POST   /accounts/:accountId/wallets/:walletId/import-confirm  - Confirmar importação
GET    /accounts/:accountId/import-history                    - Histórico de importações
```

**Formato da requisição (upload):**
```bash
curl -X POST \
  -F "file=@fatura.csv" \
  -F "bankProvider=NUBANK" \
  http://localhost:3000/accounts/3/wallets/6/import-preview
```

**Ou JSON direto:**
```json
{
  "csvContent": "date,title,amount\n...",
  "bankProvider": "NUBANK"
}
```

### **Regras de Categorização**
```
POST   /accounts/:accountId/category-rules     - Criar regra
GET    /accounts/:accountId/category-rules     - Listar regras
GET    /accounts/:accountId/category-rules/:id - Buscar regra
PUT    /accounts/:accountId/category-rules/:id - Atualizar regra
DELETE /accounts/:accountId/category-rules/:id - Deletar regra
```

### **Assinaturas (Subscriptions)**
```
POST   /wallets/:walletId/subscriptions        - Criar subscription
GET    /wallets/:walletId/subscriptions        - Listar subscriptions
GET    /subscriptions/:id                      - Buscar subscription
PUT    /subscriptions/:id                      - Atualizar subscription
DELETE /subscriptions/:id                      - Deletar subscription
```

### **Moedas**
```
GET    /currencies             - Listar moedas
POST   /currencies             - Criar moeda
PUT    /currencies/:id         - Atualizar moeda
DELETE /currencies/:id         - Deletar moeda
```

### **Lembretes**
```
POST   /reminders              - Criar lembrete
GET    /reminders              - Listar lembretes
GET    /reminders/:id          - Buscar lembrete
PUT    /reminders/:id          - Atualizar lembrete
DELETE /reminders/:id          - Deletar lembrete
```

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Executa o projeto compilado |
| `npm run seed` | Popula o banco com dados de exemplo |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Executa migrations |
| `npm run prisma:studio` | Abre Prisma Studio (UI) |
| `npm run prisma:reset` | Reseta banco e aplica migrations |

---

## 🚀 Quick Start

### 1. **Clone e Instale**
```bash
git clone <repo-url>
cd plutos-api
npm install
```

### 2. **Configure o .env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/plutos"
JWT_SECRET="seu_secret_super_seguro"
PORT=3000
```

### 3. **Execute Migrations**
```bash
npm run prisma:migrate
```

### 4. **Popule com Dados de Exemplo**
```bash
npm run seed
```

**Dados criados pelo seed:**
- ✅ 1 usuário (paulo.ecomp@gmail.com / senha123)
- ✅ 2 contas (PF "Pessoal" + PJ "PCS Informática")
- ✅ 5 carteiras (Nubank PF, C6 PJ, Bradesco, etc.)
- ✅ 16 categorias (Salário, Alimentação, Transporte, etc.)
- ✅ 12 regras de categorização
- ✅ 12 subscriptions (Netflix, AWS, Aluguel, etc.)
- ✅ 26+ transações de exemplo
- ✅ 2 históricos de importação (Nubank + C6)

### 5. **Inicie o Servidor**
```bash
npm run dev
```

Servidor rodando em: http://localhost:3000

### 6. **Teste a API**
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"paulo.ecomp@gmail.com","password":"senha123"}'

# Listar transações (use o token retornado)
curl http://localhost:3000/transactions \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📚 Documentação Completa

### **Guias Disponíveis:**
- [IMPORT_FLOW_EXPLAINED.md](IMPORT_FLOW_EXPLAINED.md) - Fluxo completo de importação
- [TRANSACTIONS_FILTERS_DOCUMENTATION.md](TRANSACTIONS_FILTERS_DOCUMENTATION.md) - Todos os filtros de transações
- [CATEGORIES_API_DOCUMENTATION.md](CATEGORIES_API_DOCUMENTATION.md) - API de categorias
- [PAGINATION_GUIDE.md](PAGINATION_GUIDE.md) - Guia de paginação
- [CSV_FORMATS_SUMMARY.md](CSV_FORMATS_SUMMARY.md) - Formatos CSV suportados
- [NUBANK_CSV_IMPLEMENTATION.md](NUBANK_CSV_IMPLEMENTATION.md) - Detalhes Nubank
- [C6_CSV_IMPLEMENTATION.md](C6_CSV_IMPLEMENTATION.md) - Detalhes C6
- [SUBSCRIPTION_IMPLEMENTATION.md](SUBSCRIPTION_IMPLEMENTATION.md) - Sistema de assinaturas
- [FRONTEND_CSV_IMPORT_PROMPT.md](FRONTEND_CSV_IMPORT_PROMPT.md) - Instruções frontend

### **Scripts Utilitários:**
- [test-nubank-csv.ts](test-nubank-csv.ts) - Testa importação Nubank
- [test-c6-csv.ts](test-c6-csv.ts) - Testa importação C6
- [check-import-results.ts](check-import-results.ts) - Verifica resultados
- [check-imported-transactions.sql](check-imported-transactions.sql) - Queries SQL úteis

---

## 🏗️ Arquitetura

```
User (Usuário)
└── Account (Conta PF/PJ)
    ├── Wallets (Carteiras)
    │   ├── Transactions (Transações)
    │   │   ├── Type (Entrada/Saída)
    │   │   ├── Category (Categoria)
    │   │   └── Subscription (Vinculada)
    │   ├── Subscriptions (Assinaturas)
    │   ├── Reminders (Lembretes)
    │   └── ImportHistory (Histórico)
    └── CategoryRules (Regras de Categorização)
```

### **Fluxo de Importação:**
```
1. Upload CSV → 2. Parse → 3. Preview
   ↓
4. Detecta duplicatas
   ↓
5. Aplica regras de categorização
   ↓
6. Auto-match com subscriptions
   ↓
7. Usuário confirma → 8. Salva no banco
   ↓
9. Atualiza subscriptions → 10. Registra histórico
```

---

## 🎯 Casos de Uso

### **Pessoa Física (PF)**
- Importar fatura do Nubank/C6
- Categorizar gastos automaticamente
- Acompanhar assinaturas (Netflix, Spotify)
- Controlar aluguel, contas de luz/água
- Relatórios mensais de entrada/saída

### **Pessoa Jurídica (PJ)**
- Importar fatura empresarial do C6/Inter
- Categorizar despesas (AWS, Google Ads, Marketing)
- Controlar subscriptions (Canva, Adobe, Vercel)
- Separar contas PF e PJ
- Relatórios fiscais por período

---

## 🔐 Segurança

- ✅ Senhas com hash bcrypt
- ✅ JWT com expiração configurável
- ✅ Validação de ownership (wallet pertence à conta)
- ✅ Proteção contra SQL injection (Prisma)
- ✅ Validação de tipos e formatos
- ✅ Limite de upload (5MB)
- ✅ Transações atômicas (rollback em caso de erro)

---

## 🧪 Testes

### **Testar Importação:**
```bash
# Nubank
npx tsx test-nubank-csv.ts

# C6
npx tsx test-c6-csv.ts

# Verificar resultados
npx tsx check-import-results.ts
```

### **Testar Endpoints:**
```bash
# Listar categorias
curl http://localhost:3000/categories

# Buscar transações paginadas
curl "http://localhost:3000/transactions?page=1&limit=20"

# Histórico de importação
curl http://localhost:3000/accounts/3/import-history
```

---

## 🛣️ Roadmap

### ✅ **Fase 1 - MVP (Concluída)**
- [x] Autenticação JWT
- [x] Multi-account (PF/PJ)
- [x] Wallets e Transações
- [x] Categorias e Tipos
- [x] Importação CSV (4 bancos)
- [x] Paginação e Filtros
- [x] Subscriptions
- [x] Categorização automática
- [x] Documentação completa

### 🚧 **Fase 2 - Features Avançadas**
- [ ] Dashboard financeiro (totais, gráficos)
- [ ] Exportação para CSV/PDF
- [ ] Relatórios customizados
- [ ] Metas de gastos por categoria
- [ ] Alertas de orçamento
- [ ] Importação de PDF (Inter)
- [ ] OCR para notas fiscais

### 🔮 **Fase 3 - Escalabilidade**
- [ ] Testes unitários e E2E
- [ ] Cache (Redis)
- [ ] Rate limiting
- [ ] Logs estruturados
- [ ] Monitoramento (Sentry)
- [ ] Deploy automatizado (CI/CD)
- [ ] Mobile App (React Native)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Abrir issues
- Sugerir features
- Enviar pull requests
- Reportar bugs

---

## 📄 Licença

MIT © Paulo Filho
[https://pcsfor.com.br](https://pcsfor.com.br)

---

## 📞 Suporte

- **Email:** paulo.ecomp@gmail.com
- **Documentação:** Ver arquivos `.md` na raiz do projeto
- **Swagger:** http://localhost:3000/api-docs (em desenvolvimento)

---

**Última atualização:** Janeiro 2025
**Versão:** 2.0.0
**Status:** ✅ Produção-ready
