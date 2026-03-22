#!/bin/bash

set -e  # Detiene el script si ocurre un error

echo "=============================="
echo " Instalación automática proyecto"
echo "=============================="

# Verificar si es root
if [ "$EUID" -ne 0 ]; then
  echo "Por favor ejecuta como root: sudo ./install_proyecto.sh"
  exit 1
fi

echo "Actualizando sistema..."
apt update -y && apt upgrade -y

echo "Instalando dependencias básicas..."
apt install -y curl git build-essential unzip wget

echo "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo "Versiones instaladas:"
node -v
npm -v
git --version

echo "Descargando proyecto..."
cd /tmp
wget -q https://github.com/JackCubas/ProyectoFigma/archive/refs/heads/main.zip
unzip -q main.zip

echo "Instalando Apache..."
apt install -y apache2

echo "Copiando archivos al directorio web..."
rm -rf /var/www/html/*
mv ProyectoFigma-main/cliente_api_mysql/* /var/www/html/

echo "Habilitando módulo SSL..."
a2enmod ssl

echo "Creando certificado SSL autofirmado..."
mkdir -p /etc/apache2/ssl

openssl req -x509 -nodes -days 365 \
-newkey rsa:2048 \
-keyout /etc/apache2/ssl/apache.key \
-out /etc/apache2/ssl/apache.crt \
-subj "/C=ES/ST=Estado/L=Ciudad/O=MiEmpresa/OU=IT/CN=localhost"

echo "Creando VirtualHost HTTPS..."
cat > /etc/apache2/sites-available/localhost-ssl.conf <<EOF
<VirtualHost *:443>
    ServerName localhost
    DocumentRoot /var/www/html

    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/apache.crt
    SSLCertificateKeyFile /etc/apache2/ssl/apache.key

    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

echo "Habilitando sitio HTTPS..."
a2ensite localhost-ssl.conf

echo "Reiniciando Apache..."
systemctl reload apache2

echo "Instalando base de datos..."
cd /tmp/ProyectoFigma-main/node_js_api_mysql
XAMPP_URL="https://sourceforge.net/projects/xampp/files/XAMPP%20Linux/8.2.12/xampp-linux-x64-8.2.12-0-installer.run/download"
INSTALLER="xampp-installer.run"
XAMPP_PATH="/opt/lampp"
MYSQL_USER="root"
MYSQL_PASS="admin"
DB_NAME="firma_app"

apt-get update -y
apt-get install -y wget net-tools

wget -O $INSTALLER $XAMPP_URL

chmod a+x $INSTALLER

./$INSTALLER --mode unattended

chmod a+x $XAMPP_PATH/lampp

$XAMPP_PATH/lampp start

echo "WAITING FOR LAMPP"
sleep 8
echo "LAMPP STARTED"

$XAMPP_PATH/bin/mysqladmin -u root password $MYSQL_PASS 2>/dev/null

$XAMPP_PATH/bin/mysql -u$MYSQL_USER -p$MYSQL_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

$XAMPP_PATH/bin/mysql -u$MYSQL_USER -p$MYSQL_PASS $DB_NAME < firma_app.sql


echo "Instalando dependencias..."
npm install
npm start

echo "=============================="
echo " Instalación completada"
echo " Accede en:"
echo " https://localhost"
echo "=============================="

