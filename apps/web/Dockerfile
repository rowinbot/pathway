# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.12.1
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

RUN mkdir -p /app/apps/web

# NodeJS app lives here
WORKDIR /app/apps/web


# Set production environment
ENV NODE_ENV=production

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential 

RUN npm i -g pnpm

# Copy pnpm workspace configuration
COPY --link ./pnpm-lock.yaml /app
COPY --link ./pnpm-workspace.yaml /app

# Copy package.json from related workspace packages
COPY --link ./packages/game-logic/package.json /app/packages/game-logic/package.json
COPY --link ./packages/tsconfig/package.json /app/packages/tsconfig/package.json
COPY --link ./apps/web/package.json .
COPY --link ./package.json /app

# Install node modules
RUN pnpm install --production=false

# Copy application code
COPY --link ./apps/web .

COPY --link ./packages/game-logic /app/packages/game-logic
COPY --link ./packages/tsconfig /app/packages/tsconfig

# Build Stage - Environment variables
ENV PUBLIC_SERVER_API_URL "https://pathway-api.rowinbot.com"
ENV PUBLIC_SERVER_SOCKET_URL "wss://pathway-api.rowinbot.com"

# Build application
RUN pnpm build

# Remove development dependencies
RUN pnpm prune --production

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]
