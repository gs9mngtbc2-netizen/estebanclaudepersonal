#!/bin/bash
# Double-click this file to stop the API and dashboard servers.

pkill -f "node src/app.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo "Servidores detenidos."
read -p "Presiona Enter para cerrar esta ventana..."
