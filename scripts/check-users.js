const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        preferredLanguage: true,
        dailyGoal: true,
        userLevel: true,
        defaultCategory: true,
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  Preferred Language: ${user.preferredLanguage || 'N/A'}`);
      console.log(`  Daily Goal: ${user.dailyGoal || 'N/A'}`);
      console.log(`  User Level: ${user.userLevel || 'N/A'}`);
      console.log(`  Default Category: ${user.defaultCategory || 'N/A'}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          preferredLanguage: 'German',
          dailyGoal: 10,
          userLevel: 1,
          defaultCategory: 'General',
        }
      });
      
      console.log('Test user created:', testUser);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 