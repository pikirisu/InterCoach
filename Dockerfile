FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p uploads/resumes && chown -R node:node /app

USER node

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
