FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node ./src-mern ./src-mern

USER node

EXPOSE 3000

CMD ["node", "src-mern/server.js"]
