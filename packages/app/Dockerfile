# Stage 1 - Build the app
FROM node:22-bullseye-slim AS build

WORKDIR /app

# Copy yarn configuration first
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn

# Install dependencies using proper Yarn version
RUN yarn set version berry
# Remove --immutable flag to allow lockfile updates for peer dependency resolution
RUN yarn install --network-timeout 600000

# Copy the rest of the application
COPY . .

# Build the app using the workspace-specific build command
RUN yarn --cwd packages/app build

# Stage 2 - Create the production image using NGINX
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/packages/app/dist /usr/share/nginx/html

# Copy NGINX configuration
COPY --from=build /app/packages/app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]