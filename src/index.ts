import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Prisma, PrismaClient } from "@prisma/client";
import { start } from "repl";

const prisma = new PrismaClient();
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/pokemon", async (c) => {
  const { limit, offset } = c.req.query();
  const queryLimit = Number(limit);
  const queryOffset = Number(offset);
  const results = await prisma.pokemon.findMany({
    skip: queryOffset,
    take: queryLimit,
  });
  const count = await prisma.pokemon.count();

  const url = "http://localhost:3000/pokemon";

  // POINTER 1 = OFFSET + 1
  // POINTER 2 = OFFSET + LIMIT
  // MAKE SURE AND TO TAKE INTO ACCOUNT OF NEGATIVE VALUES
  let prevOffset = queryOffset - queryLimit;

  if (prevOffset < 0) {
    prevOffset = 0;
  }
  let previous: any = `${url}?limit=${queryLimit}&offset=${prevOffset}`;
  let next: any = `${url}?limit=${queryLimit}&offset=${
    queryOffset + queryLimit
  }`;
  // THIS IS TO CHECK WE ARE AT THE FIRST RECORD BEING RETURN
  if (queryOffset === 0) {
    previous = null;
  }

  // IF POINTER 2 IS LESS THAN COUNT 

  //   OFFSET = 2    LIMIT = 1   COUNT = 4
  // 1. WE HAVE HAVE TO CHECK THE REMAING RECORDS TO BE RETURNED
  //         COUNT - LIMIT- OFFSET
  // 
  if (queryOffset + queryLimit < count) {
    next = `${url}?limit=${count - queryLimit - queryOffset}&offset=${
      queryOffset + queryLimit
    }`;
  }
  // POINTER 2 IS AT COUNT OR MORE THAN COUNT
  if (queryOffset + queryLimit >= count) {
    // queryOffset = count - queryLimit;
    next = null;
  }

  return c.json({ count, results, previous, next });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
