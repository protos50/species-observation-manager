import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashExistingPasswords() {
  console.log('🔐 Starting password hashing migration...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        email: true,
        password: true,
      },
    });

    console.log(`Found ${users.length} users to process\n`);

    let hashedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        console.log(`⏭️  User ${user.email} - Already hashed, skipping`);
        skippedCount++;
        continue;
      }

      // Hash the plain-text password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      // Update the user with hashed password
      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { password: hashedPassword },
      });

      console.log(`✅ User ${user.email} - Password hashed successfully`);
      hashedCount++;
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   Hashed: ${hashedCount}`);
    console.log(`   Skipped (already hashed): ${skippedCount}`);
    console.log(`\n✅ Password hashing migration completed successfully!`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
hashExistingPasswords()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
