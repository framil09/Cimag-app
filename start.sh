#!/bin/bash
# ===========================================
#  CIMAG App - Start All Services
# ===========================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/nodejs_space"
FRONTEND_DIR="$ROOT_DIR/react_native_space"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  CIMAG App - Iniciando serviços...${NC}"
echo -e "${CYAN}========================================${NC}"

# 1. Install deps if needed
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
  cd "$BACKEND_DIR" && npm install
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
  cd "$FRONTEND_DIR" && npm install
fi

# 2. Start embedded PostgreSQL
echo -e "${GREEN}🐘 Iniciando PostgreSQL local...${NC}"
cd "$BACKEND_DIR"
node -e "
const EmbeddedPostgres = require('embedded-postgres').default;
const pg = new EmbeddedPostgres({
  databaseDir: './pg-data',
  user: process.env.PG_USER || 'cimag',
  password: process.env.PG_PASSWORD || 'cimag123',
  port: parseInt(process.env.PG_PORT || '5433'),
  persistent: true
});
(async () => {
  try { await pg.initialise(); } catch(e) { /* already initialized */ }
  await pg.start();
  try { await pg.createDatabase('cimag_db'); } catch(e) { /* already exists */ }
  console.log('PostgreSQL ready on port 5433');
})().catch(e => { console.error(e); process.exit(1); });
" &
PG_PID=$!
sleep 3

# 3. Prisma generate + push
echo -e "${GREEN}🔧 Sincronizando banco de dados...${NC}"
cd "$BACKEND_DIR"
npx prisma generate --no-hints 2>/dev/null
npx prisma db push --skip-generate 2>/dev/null

# 4. Start NestJS backend
echo -e "${GREEN}🚀 Iniciando backend NestJS (porta 3000)...${NC}"
cd "$BACKEND_DIR"
npx nest start --watch &
NEST_PID=$!

sleep 5

# 5. Start Expo frontend in web mode
echo -e "${GREEN}📱 Iniciando app Expo web (porta 8081)...${NC}"
cd "$FRONTEND_DIR"
EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo start --web &
EXPO_PID=$!

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}  ✅ Tudo rodando!${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "  Backend API:   ${YELLOW}http://localhost:3000/api${NC}"
echo -e "  Swagger Docs:  ${YELLOW}http://localhost:3000/api-docs${NC}"
echo -e "  App (web):     ${YELLOW}http://localhost:8081${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "  Pressione Ctrl+C para parar tudo"
echo ""

# Cleanup on exit
trap "kill $PG_PID $NEST_PID $EXPO_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
