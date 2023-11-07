FROM oven/bun:latest

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y curl

COPY package*.json bun.lockb ./

RUN bun install

COPY src ./src

ENV NODE_ENV production

# run the app
USER bun
ENTRYPOINT [ "bun", "run", "app" ]

