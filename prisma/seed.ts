import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const adminName = process.env.ADMIN_SEED_NAME ?? 'Admin';

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set. Refusing to seed with default credentials.',
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists. Skipping creation.`);
    return;
  }

  const admin = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      password_hash: passwordHash,
      name: adminName,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Created admin user:', {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  console.log('Database seeded successfully.');
  console.log(`Admin email: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
