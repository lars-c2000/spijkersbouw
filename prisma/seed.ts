import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("Admin1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@spijkersbouw.nl" },
    update: {},
    create: {
      name: "Lars",
      email: "admin@spijkersbouw.nl",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin gebruiker aangemaakt: ${admin.email}`);
  console.log("Wachtwoord: Admin1234! — verander dit na eerste login!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
