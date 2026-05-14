#!/bin/sh
set -e

echo "→ Application des migrations Prisma..."
npx prisma migrate deploy

echo "→ Exécution du seed..."
npx prisma db seed || echo "Seed ignoré (déjà fait ou erreur non bloquante)"

echo "→ Démarrage de l'application..."
exec node server.js