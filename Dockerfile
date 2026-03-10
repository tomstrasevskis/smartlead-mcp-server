FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts

COPY tsconfig.json ./
COPY src/ src/

RUN npx tsc

EXPOSE 8083

CMD ["node", "dist/index.js"]
