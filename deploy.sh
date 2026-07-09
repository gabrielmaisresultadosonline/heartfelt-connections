#!/usr/bin/env bash
# ============================================================
# Deploy belezalisoperfeito.online
# Uso na VPS:
#   cd /var/www/belezalisoperfeito.online
#   bash deploy.sh
# ============================================================
set -euo pipefail

APP_DIR="/var/www/belezalisoperfeito.online"
PM2_NAME="belezalisoperfeito"
DATA_DIR="/var/lib/certificados"

cd "$APP_DIR"

# 1) Garante diretório de dados
sudo mkdir -p "$DATA_DIR/files"
sudo chown -R "$(whoami)" "$DATA_DIR"

# 2) Escreve .env (idempotente — sobrescreve sempre com os valores atuais)
cat > .env <<'ENVEOF'
NODE_ENV=production
DATA_DIR=/var/lib/certificados
JWT_SECRET=9f38bdaa74123aad3108c0ae69ba6393853718221a6f84525e3c01cff558dbfb698f677a6ba565e311e288c6fb1f1d2e
ADMIN_EMAIL=mro@gmail.com
ADMIN_PASSWORD=Ga145523@

# SMTP Hostinger (envio de e-mails do curso)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=suporte@belezalisoperfeito.online
SMTP_PASS=Ga145523@
SMTP_FROM=Beleza Liso Perfeito <suporte@belezalisoperfeito.online>

# InfinitePay
INFINITEPAY_HANDLE=paguemro

# URL pública (usada em webhook / redirect)
PUBLIC_BASE_URL=https://belezalisoperfeito.online
ENVEOF
chmod 600 .env
echo "✅ .env atualizado"

# 3) Pull + build + restart
git pull
npm install
npm run build

# 4) PM2: cria se não existir, restart se existir
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start ".output/server/index.mjs" --name "$PM2_NAME" --update-env
fi

pm2 save
echo "✅ Deploy concluído"
echo ""
echo "Admin: https://belezalisoperfeito.online/admin/login  (ou /centraladmin)"
echo "  email: mro@gmail.com"
echo "  senha: Ga145523@"
echo ""
echo "Fluxo /promocc → checkout InfinitePay (paguemro) → webhook → email SMTP."
echo "Alunos: /admin/students   |   Módulos do curso: /admin/modules"
