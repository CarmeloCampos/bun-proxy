FROM oven/bun:1
RUN apt-get install -y curl
WORKDIR /home/node/app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

HEALTHCHECK CMD curl http://localhost:3000/ping

CMD ["bun", "src/index.ts"]
