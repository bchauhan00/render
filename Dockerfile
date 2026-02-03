# Use Node 18 (safe default)
FROM node:18

# Create app directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build (if your app has a build step)
# If this fails, we can remove it later
RUN npm run build || echo "No build step"

# Expose the port Render uses
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
