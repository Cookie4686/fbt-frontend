FROM node:26-trixie-slim AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --production

FROM node:26-trixie-slim  AS build-release-stage

WORKDIR /app

COPY --from=build-stage /app/build build/
COPY --from=build-stage /app/node_modules node_modules/
COPY package.json .

USER 12345
CMD [ "node", "build" ]
