# Use an official Node.js runtime as the base image
FROM node:18-alpine as build

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies. (--omit=dev or --only=production)
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Start a new, final stage to get a clean image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy only the dependencies installation from the 1st stage image
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/cert ./build/src/cert
COPY --from=build /app/build ./build

RUN npm prune --omit=dev

# Expose port 8080 for the app
EXPOSE 8080

# Run the app
CMD [ "npm", "start" ]
