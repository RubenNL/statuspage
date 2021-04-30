FROM node:lts-alpine AS frontend
WORKDIR /tmp
COPY frontend/package* ./
RUN npm install
COPY frontend .
RUN npm run build

FROM node:lts-alpine AS backend
WORKDIR /tmp
COPY backend/package* ./
RUN npm install
COPY backend .
COPY --from=frontend /tmp/dist dist
EXPOSE 8080
ENTRYPOINT ["npm","start"]
