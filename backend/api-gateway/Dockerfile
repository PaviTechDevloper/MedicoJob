# ---------- Stage 1: Dependencies ----------
FROM node:18-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production


# ---------- Stage 2: Runtime ----------
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=deps --chown=node:node --chmod=0555 /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --chmod=0555 . .


USER node

EXPOSE 5000

CMD ["npm", "start"]