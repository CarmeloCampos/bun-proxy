FROM oven/bun:1
WORKDIR /home/node/app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

CMD ["bun", "src/index.ts"]
