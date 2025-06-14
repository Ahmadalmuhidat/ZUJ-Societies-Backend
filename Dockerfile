# Use an official Node.js runtime as a parent image (Alpine for minimal footprint)
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy only package files to install dependencies first (layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Optional: Run build script if you use TypeScript or build tools
# RUN npm run build

# Use a smaller, non-root image for runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only production node_modules and app files from build stage
COPY --from=build /app /app

# Ensure the app does not run as root
USER node

# Expose app port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
