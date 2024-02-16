# Building layer
FROM node:18-alpine as development

ENV NODE_ENV=production

WORKDIR /app

# Copy configuration files
COPY ["package*", "tsconfig*.json*", "./"]

# Install dependencies from package-lock.json
RUN npm ci

# Copy application sources (.ts, .tsx, js)
COPY src/ src/

# Build application (produces dist/ folder)
RUN npm run build

# Runtime (production) layer
FROM node:16-alpine as production


WORKDIR /app

# Copy dependencies files
COPY package*.json ./

# Install runtime dependecies (without dev/test dependecies)
RUN npm ci --omit=dev

# Copy production build
COPY --from=development /app/dist/ ./dist/

# Expose application port
EXPOSE 8080

# Start application
CMD [ "node", "dist/main.js" ]