FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

ENV NODE_ENV=development
ENV VITE_DEV_SERVER_HOST=0.0.0.0
ENV VITE_DEV_SERVER_PORT=3000

CMD ["npm", "start"] 