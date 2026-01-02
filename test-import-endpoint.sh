#!/bin/bash

# Script de teste para endpoint de importação CSV
# Testa o endpoint /accounts/:accountId/wallets/:walletId/import-preview

ACCOUNT_ID=3
WALLET_ID=6
BASE_URL="http://localhost:3000"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 Testando Endpoint de Importação CSV"
echo "=========================================="
echo ""

# ========================================
# TESTE 1: Upload de arquivo (multipart/form-data)
# ========================================
echo -e "${YELLOW}📤 TESTE 1: Upload de arquivo CSV (Nubank)${NC}"
echo ""

# Cria arquivo CSV temporário
cat > /tmp/test-nubank.csv <<EOF
date,title,amount
2025-11-24,Mercadolivre*4produto,135.89
2025-11-20,Wt Net Comunicacao,61.38
2025-11-03,Mercadolivre*Mercadoli,39.90
2025-11-03,Claude.Ai Subscription,114.35
2025-11-02,Pagamento recebido,-570.11
EOF

echo "Arquivo criado: /tmp/test-nubank.csv"
echo ""

# Faz upload
curl -X POST "$BASE_URL/accounts/$ACCOUNT_ID/wallets/$WALLET_ID/import-preview" \
  -F "file=@/tmp/test-nubank.csv" \
  -F "bankProvider=NUBANK" \
  -H "Content-Type: multipart/form-data"

echo ""
echo ""

# ========================================
# TESTE 2: JSON direto (application/json)
# ========================================
echo -e "${YELLOW}📨 TESTE 2: JSON direto (Nubank)${NC}"
echo ""

curl -X POST "$BASE_URL/accounts/$ACCOUNT_ID/wallets/$WALLET_ID/import-preview" \
  -H "Content-Type: application/json" \
  -d '{
    "csvContent": "date,title,amount\n2025-11-24,Mercadolivre*4produto,135.89\n2025-11-20,Wt Net Comunicacao,61.38\n2025-11-03,Mercadolivre*Mercadoli,39.90\n2025-11-03,Claude.Ai Subscription,114.35\n2025-11-02,Pagamento recebido,-570.11",
    "bankProvider": "NUBANK"
  }'

echo ""
echo ""

# ========================================
# TESTE 3: Upload de arquivo C6
# ========================================
echo -e "${YELLOW}📤 TESTE 3: Upload de arquivo CSV (C6)${NC}"
echo ""

# Cria arquivo CSV temporário do C6
cat > /tmp/test-c6.csv <<EOF
Data de Compra;Nome no Cartão;Final do Cartão;Categoria;Descrição;Parcela;Valor (em US$);Cotação (em R$);Valor (em R$)
12/10/2025;PAULO FILHO;0680;Transporte;VIACAO JEQUIE CIDADE S;2/6;0;0;29.05
15/11/2025;PAULO FILHO;0680;Serviços pessoais;MP *KOTAS;Única;0;0;11.06
09/11/2025;PAULO FILHO;4736;-;"Inclusao de Pagamento";Única;0;0;-818.65
EOF

echo "Arquivo criado: /tmp/test-c6.csv"
echo ""

# Faz upload
curl -X POST "$BASE_URL/accounts/$ACCOUNT_ID/wallets/$WALLET_ID/import-preview" \
  -F "file=@/tmp/test-c6.csv" \
  -F "bankProvider=C6" \
  -H "Content-Type: multipart/form-data"

echo ""
echo ""

# Cleanup
rm -f /tmp/test-nubank.csv /tmp/test-c6.csv

echo "=========================================="
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo "=========================================="
