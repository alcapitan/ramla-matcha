# Ramla رملة Matcha — image unique (site + API + admin)
FROM node:26-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/data

WORKDIR /app

# Dépendances d'abord (meilleur cache)
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Code + site
COPY server.js wilayas.js ./
COPY config ./config
COPY admin ./admin
COPY public ./public

# Dossier des données (commandes, abonnées) — monté en volume
RUN mkdir -p /data && chown -R node:node /data /app
USER node
VOLUME ["/data"]

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "server.js"]
