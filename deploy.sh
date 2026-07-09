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

# 2) Preserva segredos locais e só valida o .env existente.
#    Importante: NODE_ENV não deve ficar dentro do .env porque quebra o build/dev do Vite.
if [[ ! -f .env ]]; then
  cat > .env <<'ENVEOF'
DATA_DIR=/var/lib/certificados
JWT_SECRET=troque-por-um-segredo-longo
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=troque-esta-senha

# SMTP Hostinger (envio de e-mails do curso)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=suporte@belezalisoperfeito.online
SMTP_PASS=preencha-a-senha-do-email
SMTP_FROM=Beleza Liso Perfeito <suporte@belezalisoperfeito.online>

# InfinitePay
INFINITEPAY_HANDLE=paguemro

# URL pública (usada em webhook / redirect)
PUBLIC_BASE_URL=https://belezalisoperfeito.online
ENVEOF
  chmod 600 .env
  echo "⚠️  .env criado com placeholders. Preencha os segredos reais e rode este script novamente."
  exit 1
fi

sed -i '/^NODE_ENV=/d' .env
chmod 600 .env
echo "✅ .env preservado e validado"

# 3) Pull + build + restart
git pull
npm install --include=dev
npm run build

# Carrega o .env para o processo de produção do PM2 sem imprimir segredos no terminal.
eval "$(python3 - <<'PY'
from pathlib import Path
import re
import shlex

env_path = Path('.env')
for raw_line in env_path.read_text().splitlines():
    line = raw_line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, value = line.split('=', 1)
    key = key.strip()
    if not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', key):
        continue
    print(f'export {key}={shlex.quote(value.strip())}')
PY
)"

# 4) PM2: troca comandos antigos de desenvolvimento por servidor de produção.
#    Deleta somente este app pelo nome; não interfere em outros sites/processos do VPS.
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
  pm2 delete "$PM2_NAME"
fi

NODE_ENV=production \
HOST=127.0.0.1 \
PORT=8080 \
pm2 start ".output/server/index.mjs" \
  --name "$PM2_NAME" \
  --interpreter node \
  --update-env

pm2 save
echo "✅ Deploy concluído"
echo ""
echo "Admin: https://belezalisoperfeito.online/admin/login  (ou /centraladmin)"
echo "Use as credenciais configuradas no .env do servidor."
echo ""
echo "Fluxo /promocc → checkout InfinitePay (paguemro) → webhook → email SMTP."
echo "Alunos: /admin/students   |   Módulos do curso: /admin/modules"
