# Use a base image that includes Node.js
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy your application files into the container
COPY . .

# Install Vite globally using npm
RUN npm install -g vite

# Install your application dependencies using npm
RUN npm install

# Build your application with Vite
RUN npm run build

# Expose the port your application will run on (default for Vite.js is 3000)
EXPOSE 5173

# Define the command to start your applications
CMD ["npm", "run", "dev"]
