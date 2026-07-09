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
APP_PORT="8080"
APP_HOST="127.0.0.1"

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
# Force Nitro to build a plain Node.js server (VPS), not Cloudflare Workers
export NITRO_PRESET=node-server
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

# 4) PM2: remove SOMENTE processos deste app, inclusive processos antigos que ficaram
#    presos em `npm run dev`. Não mexe em outros sites do VPS.
pm2 jlist | python3 -c '
import json
import sys

target_name = sys.argv[1]
target_cwd = sys.argv[2]

try:
    processes = json.load(sys.stdin)
except json.JSONDecodeError:
    processes = []

for process in processes:
    env = process.get("pm2_env", {})
    name = env.get("name") or process.get("name")
    cwd = env.get("pm_cwd") or env.get("PWD")
    if name == target_name or cwd == target_cwd:
        print(process.get("pm_id"))
' "$PM2_NAME" "$APP_DIR" | while read -r pm_id; do
  if [[ -n "$pm_id" && "$pm_id" != "None" ]]; then
    pm2 delete "$pm_id" || true
  fi
done

pm2 flush "$PM2_NAME" || true

# 5) Inicia o servidor de PRODUÇÃO gerado pelo build. Nunca usa `vite dev` no VPS.
NODE_ENV=production \
HOST="$APP_HOST" \
PORT="$APP_PORT" \
pm2 start "$APP_DIR/.output/server/index.mjs" \
  --name "$PM2_NAME" \
  --cwd "$APP_DIR" \
  --interpreter node \
  --time \
  --update-env

# 6) Health check local: se isto falhar, o Nginx vai retornar 502.
echo "⏳ Verificando servidor local em http://$APP_HOST:$APP_PORT ..."
for attempt in {1..20}; do
  if curl -fsS "http://$APP_HOST:$APP_PORT/" > /dev/null; then
    echo "✅ Servidor local respondeu na porta $APP_PORT"
    break
  fi

  if [[ "$attempt" -eq 20 ]]; then
    echo "❌ O servidor local não respondeu na porta $APP_PORT. Últimos logs:" >&2
    pm2 status >&2 || true
    pm2 logs "$PM2_NAME" --lines 80 --nostream >&2 || true
    exit 1
  fi

  sleep 1
done

pm2 save
echo "✅ Deploy concluído"
echo ""
echo "Admin: https://belezalisoperfeito.online/admin/login  (ou /centraladmin)"
echo "Use as credenciais configuradas no .env do servidor."
echo ""
echo "Fluxo /promocc → checkout InfinitePay (paguemro) → webhook → email SMTP."
echo "Alunos: /admin/students   |   Módulos do curso: /admin/modules"
