FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .

ENV NODE_ENV=production
ENV QILING_DATA_DIR=/data
RUN mkdir -p /data

EXPOSE 3001
CMD ["node", "index.js"]
