import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get("/pokemon", async (c) => {
  const { limit, offset } = c.req.query();
  const results = await prisma.pokemon.findMany({
    skip: Number(offset),
    take: Number(limit),
  });

  return c.json({ results });
});

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
