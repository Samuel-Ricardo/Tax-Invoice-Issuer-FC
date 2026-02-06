FROM node:25-slim AS build

RUN apt-get update -y && apt-get install -y openssl

USER node 
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
RUN npm ci 

COPY --chown=node:node . .
RUN npm run build


FROM node:25-slim AS production 

RUN apt-get update -y && apt-get install -y openssl

USER node
WORKDIR /home/node/app

COPY --chown=node:node --from=build /home/node/app/node_modules ./node_modules
COPY --chown=node:node --from=build /home/node/app/package*.json ./
COPY --chown=node:node --from=build /home/node/app/dist ./dist
COPY --chown=node:node --from=build /home/node/app/ ./

CMD ["npm", "run", "start:docker"]
