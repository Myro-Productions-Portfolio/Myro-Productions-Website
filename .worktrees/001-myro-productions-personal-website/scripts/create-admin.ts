/**
 * Create Admin User Script
 *
 * Usage:
 *   npx ts-node scripts/create-admin.ts
 *
 * Or with custom values:
 *   EMAIL=admin@example.com PASSWORD=secure123 NAME="Admin Name" npx ts-node scripts/create-admin.ts
 */

import { hashPassword } from '../lib/auth/password';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  // Get values from environment or use defaults
  const email = process.env.EMAIL || 'admin@myroproductions.com';
  const password = process.env.PASSWORD || 'changeme123';
  const name = process.env.NAME || 'Admin User';
  const role = (process.env.ROLE as 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER') || 'SUPER_ADMIN';

  console.log('\n📝 Creating admin user...\n');
  console.log('Email:', email);
  console.log('Name:', name);
  console.log('Role:', role);
  console.log('\n');

  try {
    // Check if user already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      console.error('❌ Error: Admin user with this email already exists');
      process.exit(1);
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await hashPassword(password);

    // Create the admin user
    console.log('💾 Creating admin user in database...');
    const admin = await prisma.adminUser.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        role,
      },
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('\n⚠️  Make sure to change the password after first login!\n');
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin();
