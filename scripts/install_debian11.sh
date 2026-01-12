#!/usr/bin/env bash
set -euo pipefail

# install_debian11.sh
# Uso: ejecutar como root desde la raíz del proyecto:
#   sudo bash scripts/install_debian11.sh
# Este script instala dependencias necesarias en Debian 11 (netinstall base)
# - apt packages: curl, git, build-essential, nginx, mysql-server
# - Node.js (NodeSource 18.x), npm
# - pm2 global process manager
# - instala dependencias de todos los paquetes Node (busca package.json)
# - crea DB/MySQL si hay SQL en node_js_api_mysql/firma_app.sql o .env

INSTALL_DIR="/opt/ProyectoFigma"

if [ "$EUID" -ne 0 ]; then
  echo "Este script debe ejecutarse como root. Ejecuta: bash $0 (como root)"
  exit 1
fi

echo "==> Actualizando repositorios e instalando paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl ca-certificates gnupg build-essential git nginx mysql-server

echo "==> Instalando Node.js (NodeSource 18.x)"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

echo "==> Instalando pm2 global"
npm install -g pm2 --no-fund --no-audit

echo "==> Clonando código desde GitHub en $INSTALL_DIR"
REPO_URL="https://github.com/JackCubas/ProyectoFigma.git"
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "-> El repositorio ya existe en $INSTALL_DIR, actualizando (pull)"
  git -C "$INSTALL_DIR" fetch --all --prune
  git -C "$INSTALL_DIR" reset --hard origin/main || true
else
  rm -rf "$INSTALL_DIR"
  git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
fi

PROJECT_ROOT="$INSTALL_DIR"

echo "==> Instalando dependencias de todos los proyectos Node (buscando package.json)"
find "$PROJECT_ROOT" -name package.json -not -path "*/node_modules/*" | while read -r pkg; do
  dir="$(dirname "$pkg")"
  echo "-> Instalando en: $dir"
  cd "$dir"
  if [ -f package-lock.json ]; then
    npm ci --no-audit --no-fund || npm install --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
  cd "$PROJECT_ROOT"
done

echo "==> Configurando PM2 para ejecutar apps encontradas"
find "$PROJECT_ROOT" -name package.json -not -path "*/node_modules/*" | while read -r pkg; do
  dir="$(dirname "$pkg")"
  name="$(basename "$dir")"
  echo "-> Procesando $dir"
  if grep -q '"start"' "$dir/package.json" 2>/dev/null; then
    echo "   arrancando con 'npm start' vía pm2 (nombre: $name)"
    pm2 start npm --name "$name" --prefix "$dir" -- start || true
  elif [ -f "$dir/server.js" ]; then
    echo "   arrancando server.js vía pm2 (nombre: $name)"
    pm2 start "$dir/server.js" --name "$name" || true
  else
    echo "   no se encontró comando de arranque en $dir, omitiendo"
  fi
done

echo "==> Guardando configuración de PM2 para arranque en boot"
pm2 save || true
pm2 startup systemd -u root --hp /root || true

# MySQL setup: intentar leer .env en node_js_api_mysql si existe
DB_NAME_DEFAULT="firma_app_db"
DB_USER_DEFAULT="firma_user"
SQL_FILE="$PROJECT_ROOT/node_js_api_mysql/firma_app.sql"
ENV_FILE="$PROJECT_ROOT/node_js_api_mysql/.env"

MYSQL_ROOT_CMD="mysql"

echo "==> Configuración básica de MySQL (non-interactive)"
DB_NAME="$DB_NAME_DEFAULT"
DB_USER="$DB_USER_DEFAULT"
DB_PASS="$(openssl rand -base64 12)"

if [ -f "$ENV_FILE" ]; then
  echo "-> Leyendo variables desde $ENV_FILE"
  # extraer variables simples en formato KEY=VALUE
  # NOTA: no exporta variables con espacios ni comillas complejas
  while IFS='=' read -r key val; do
    case "$key" in
      DB_NAME|DATABASE_NAME|DB_DATABASE) DB_NAME=${val//"/};;
      DB_USER|DATABASE_USER|DB_USERNAME) DB_USER=${val//"/};;
      DB_PASS|DATABASE_PASS|DB_PASSWORD) DB_PASS=${val//"/};;
    esac
  done < <(grep -E '^(DB_NAME|DATABASE_NAME|DB_DATABASE|DB_USER|DATABASE_USER|DB_USERNAME|DB_PASS|DATABASE_PASS|DB_PASSWORD)=' "$ENV_FILE" || true)
fi

echo "-> Creando usuario/BD MySQL: user=$DB_USER db=$DB_NAME"
${MYSQL_ROOT_CMD} -e "CREATE DATABASE IF NOT EXISTS \\`$DB_NAME\\`;" || true
${MYSQL_ROOT_CMD} -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';" || true
${MYSQL_ROOT_CMD} -e "GRANT ALL PRIVILEGES ON \\`$DB_NAME\\`.* TO '$DB_USER'@'localhost';" || true
${MYSQL_ROOT_CMD} -e "FLUSH PRIVILEGES;" || true

if [ -f "$SQL_FILE" ]; then
  echo "-> Importando esquema desde $SQL_FILE"
  ${MYSQL_ROOT_CMD} "$DB_NAME" < "$SQL_FILE" || true
fi

echo "==> Opcional: configurar nginx para servir carpeta cliente_api_mysql como sitio estático"
NGINX_SITE_CONF="/etc/nginx/sites-available/proyecto_figma"
CLIENT_DIR="$PROJECT_ROOT/cliente_api_mysql"
if [ -d "$CLIENT_DIR" ]; then
  cat > "$NGINX_SITE_CONF" <<EOF
server {
  listen 80;
  server_name _;
  root $CLIENT_DIR;
  index index.html;
  location / {
    try_files \$uri \$uri/ =404;
  }
}
EOF
  ln -sf "$NGINX_SITE_CONF" /etc/nginx/sites-enabled/proyecto_figma
  nginx -t && systemctl restart nginx || true
  echo "-> nginx configurado para servir $CLIENT_DIR en puerto 80"
else
  echo "-> No se encontró $CLIENT_DIR, omito configuración nginx"
fi

echo "\n==> Finalizado. Resumen:"
echo "- Project root: $PROJECT_ROOT"
echo "- PM2 procesos guardados; comprobar con: pm2 ls"
echo "- MySQL DB: $DB_NAME"
echo "- MySQL user: $DB_USER"
echo "- MySQL password: $DB_PASS"
if [ -d "$CLIENT_DIR" ]; then
  echo "- Cliente estático servido por nginx desde: $CLIENT_DIR (puerto 80)"
fi

echo "Si necesitas credenciales distintas o ajustes, edita node_js_api_mysql/.env o ejecuta manualmente los comandos relevantes."

exit 0
