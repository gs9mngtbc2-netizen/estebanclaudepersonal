#!/bin/bash
# Double-click this file in Finder to start the dashboard.
# It launches the API and the Next.js dashboard, then opens your browser.

cd "$(dirname "$0")"

mkdir -p artifacts

echo "Starting API on :3000..."
(npm start > /tmp/artifacts-api.log 2>&1 &)

sleep 3

echo "Starting dashboard on :3001..."
(cd dashboard && npm run dev > /tmp/artifacts-dashboard.log 2>&1 &)

sleep 5

open http://localhost:3001

echo ""
echo "Dashboard abierto en http://localhost:3001"
echo "Para detenerlo, cierra esta ventana o ejecuta: pkill -f 'node src/app.js' && pkill -f 'next dev'"
echo ""
read -p "Presiona Enter para cerrar esta ventana (los servidores seguirán corriendo en segundo plano)..."
