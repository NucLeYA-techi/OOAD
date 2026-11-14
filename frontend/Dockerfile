FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 5173

# Serve the built SPA with Vite preview (proxy /api -> backend:5000)
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]
