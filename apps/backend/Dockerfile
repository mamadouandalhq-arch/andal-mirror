FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/backend ./apps/backend

COPY packages ./packages

RUN pnpm install --filter=backend

CMD ["pnpm", "run", "dev", "--filter=backend"]