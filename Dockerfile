# ── Build stage ─────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# copy lockfile + manifest
COPY package.json yarn.lock ./

# install all deps (builder only)
RUN yarn install

# copy source & build
COPY . .
RUN yarn build

# ── Run stage ──────────────────────────────────────
FROM node:18-alpine

WORKDIR /usr/src/app

# copy only prod manifest
COPY package.json yarn.lock ./

# install only production deps
RUN yarn install --production

# bring in compiled output
COPY --from=builder /usr/src/app/dist ./dist

# ── ADD THIS LINE ─────────────────────────────────
# tell Node to ship in the webcrypto API on globalThis
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# expose & launch
EXPOSE 3000
CMD ["yarn", "start:prod"]

