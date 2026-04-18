import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const gestorPassword = await bcrypt.hash('admin123', 10);
  const motoristaPassword = await bcrypt.hash('johndoe123', 10);

  // Gestor (manager) - can view and generate reports
  await prisma.user.upsert({
    where: { email: 'sec.executivo@cimag.org.com.br' },
    update: { role: 'gestor', password: gestorPassword },
    create: {
      email: 'sec.executivo@cimag.org.com.br',
      password: gestorPassword,
      name: 'Secretario Executivo',
      role: 'gestor',
    },
  });

  // Motorista (driver) - regular user
  await prisma.user.upsert({
    where: { email: 'motorista@cimag.com' },
    update: { role: 'motorista' },
    create: {
      email: 'motorista@cimag.com',
      password: motoristaPassword,
      name: 'Carlos Silva',
      role: 'motorista',
    },
  });

  console.log('Seed completed successfully');
  console.log('  Gestor: sec.executivo@cimag.org.com.br');
  console.log('  Motorista: motorista@cimag.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
