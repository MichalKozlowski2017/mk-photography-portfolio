import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@portfolio.dev";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";

  const hashed = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed },
  });

  console.log(`✓ Admin user ready: ${user.email}`);

  // Seed default categories
  const categories = ["Krajobraz", "Portret", "Ulica", "Architektura", "Natura"];
  for (const name of categories) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`✓ ${categories.length} categories seeded`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
