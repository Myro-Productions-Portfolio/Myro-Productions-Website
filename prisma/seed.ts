import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create initial admin user
  const adminEmail = 'pmnicolasm@gmail.com';
  const adminPassword = 'ChangeMe123!';

  // Hash password with bcrypt (10 salt rounds)
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists. Skipping creation.`);
    return;
  }

  // Create admin user
  const admin = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      password_hash: passwordHash,
      name: 'Myro Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Created admin user:', {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📧 Admin Login:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n⚠️  IMPORTANT: Change this password after first login!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
