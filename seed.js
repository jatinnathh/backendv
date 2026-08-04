import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "timing-demo@backendvisualizer.dev";
  const password = "timing-demo-password";
  
  const hash = bcrypt.hashSync(password, 12);
  
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: {
      email,
      name: "Demo User",
      passwordHash: hash,
      role: "USER"
    }
  });

  const dummyHash = bcrypt.hashSync("dummy_password", 12);
  console.log("Use this dummy hash:");
  console.log(dummyHash);
}

main().catch(console.error).finally(() => prisma.$disconnect());
