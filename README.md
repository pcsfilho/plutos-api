# plutos-api

Controle Financeiro

## Comandos

npm run dev Inicia a API em modo desenvolvimento
npm run build Compila TypeScript para dist/
npm start Executa o projeto compilado
npm run prisma Atalho para qualquer comando Prisma
npm run prisma:generate Gera o cliente Prisma a partir do schema
npm run prisma:migrate Executa as migrações em desenvolvimento
npm run prisma:migrate:deploy Aplica migrações em produção
npm run prisma:studio Abre o Prisma Studio (UI web para ver os dados)
npm run prisma:format Formata o schema.prisma
npm run prisma:reset Apaga tudo, recria o banco e aplica migrações

# ROADMAP

📊 1. Dashboard com Resumo Financeiro

- Destaques por carteira, mês e categoria: - Saldo atual - Total de entradas e saídas no mês - Gráfico de pizza por categoria - Gráfico de linha de saldo acumulado - Exemplo: GET /dashboard?walletId=1&month=04&year=2025
  🏷️ 2. Filtros e Buscas
- Permitir filtros nas transações: - Por data, categoria, tipo (entrada/saída) - Exemplo: GET /transactions?walletId=1&typeId=2&month=04&year=2025
  🔁 3. Transações recorrentes
  Adicione uma lógica para marcar uma transação como recorrente (isRecurring: true) e gerar as próximas mensalmente de forma automática (pode ser via cronjob ou agendamento manual).

🔔 4. Notificações por e-mail (ou push futuramente) - Lembretes de contas com vencimento próximo - Alerta de saldo negativo - Confirmação de transações
💱 5. Conversão de moedas
Se você tiver múltiplas carteiras com moedas diferentes (BRL, USD, EUR...), pode usar uma API externa para converter saldos e mostrar um total unificado.

👥 6. Compartilhamento de carteiras
Possibilidade de compartilhar uma carteira com outro usuário (ex: casal, sócio)

Definir permissões: visualizar, editar, só adicionar

🧾 7. Upload de comprovantes / anexos
Adicionar imagens ou PDFs em transações

Salvar caminho do arquivo na transação

🔐 8. 2FA ou reforço de segurança
Autenticação em dois fatores (2FA)

Verificação de e-mail

Revalidação de senha para ações sensíveis

🛠 9. Exportação de dados
Gerar relatórios em CSV, Excel ou PDF por período

Enviar por e-mail ou baixar direto

📱 10. Modo mobile / app
Com a API pronta, você pode futuramente fazer um app com Vue (Quasar) ou Flutter, consumindo sua própria API.

✅ Fase 1 – MVP Básico (já iniciado)
Item Status Prioridade Observações
Autenticação com JWT ✅ Pronto Alta Login, proteção de rotas
Cadastro de usuários ✅ Pronto Alta
CRUD de carteiras ✅ Pronto Alta
CRUD de transações (entradas/saídas) ✅ Pronto Alta Com categorias e tipos
CRUD de lembretes de contas ✅ Pronto Alta Alerta de contas a pagar
Swagger documentado ✅ Pronto Média

🚧 Fase 2 – Funcionalidades Avançadas
Item Descrição Prioridade
🔄 Transações recorrentes Gerar transações futuras automaticamente com base em uma inicial Alta
📊 Dashboard financeiro Exibir saldo total, entradas/saídas do mês, gráficos Alta
🧾 Filtros nas transações Filtrar por carteira, categoria, tipo, data Alta
🛑 Validação por usuário Garantir que os dados consultados pertencem ao usuário autenticado Alta
📁 Anexar comprovantes Upload de imagem ou PDF em transações Média
📤 Exportação para CSV/PDF Exportar transações por período Média
🌐 Conversão de moedas Mostrar saldo total considerando taxas de câmbio Baixa

🧪 Fase 3 – Experiência do Usuário e Escalabilidade
Item Descrição Prioridade
🛡️ 2FA ou verificação de e-mail Reforço de segurança na autenticação Média
🧑‍🤝‍🧑 Compartilhamento de carteiras Carteiras compartilhadas com outros usuários Média
🔔 Notificações por e-mail Alertas de lembretes, saldo baixo, etc. Média
📱 Início de um App (Vue ou Flutter) Consumir API para uso mobile Baixa

📆 Fase 4 – Manutenção, Testes e Deploy
Item Descrição Prioridade
🔧 Testes unitários e integração Garantir qualidade do código Alta
📦 Deploy em ambiente cloud Subir API no Render, Railway ou VPS Alta
🗄️ Seed e dados de teste Popular base com exemplos para simulações Média
📝 Documentação técnica Explicar como rodar, usar e colaborar no projeto Média

💡 Extras Futuramente
Item Descrição
💬 IA para análise Sugestões de economia, hábitos, alertas
📍 Geolocalização Marcar local da compra, útil no app
🔗 API pública Permitir integrações com apps externos
