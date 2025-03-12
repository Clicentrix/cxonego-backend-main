FROM node:18.16.0-alpine AS builder
 
WORKDIR /usr/src/app
 
ENV NODE_ENV=development
 
# Copy package.json and package-lock.json before other files
# Utilize cache on step npm install
RUN apk update && apk add --no-cache curl
COPY package*.json ./
 
RUN yarn
 
# Copy application files
COPY . .
 
# Build the application
RUN yarn run build
 
WORKDIR /usr/src/app/build
 
# Expose the listening port
EXPOSE 8081
 
# Run the application
CMD ["node", "src/index.js"]