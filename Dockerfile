FROM oven/bun:1

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY . .

# Generate prisma client during build as a fallback
RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "src/index.ts"]