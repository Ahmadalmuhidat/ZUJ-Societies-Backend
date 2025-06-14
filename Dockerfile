# Step 1: Build the React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the React app for production
RUN npm run build

# Step 2: Serve with a production web server (nginx)
FROM nginx:stable-alpine as production

# Copy built React app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port nginx runs on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
