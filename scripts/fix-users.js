const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixUsers() {
  try {
    // Find all users without passwords
    const usersWithoutPasswords = await prisma.user.findMany({
      where: {
        password: null
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    console.log(`Found ${usersWithoutPasswords.length} users without passwords:`);
    
    for (const user of usersWithoutPasswords) {
      console.log(`- ${user.email} (${user.name || 'No name'})`);
    }
    
    if (usersWithoutPasswords.length === 0) {
      console.log('All users have passwords set!');
      return;
    }
    
    // Add passwords for all users without passwords
    for (const user of usersWithoutPasswords) {
      const defaultPassword = 'password123'; // You can change this
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log(`✅ Added password for: ${user.email}`);
      console.log(`   Password: ${defaultPassword}`);
    }
    
    console.log('\n🎉 All users now have passwords set!');
    console.log('Default password for all users: password123');
    console.log('Please change these passwords after first login.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUsers(); 