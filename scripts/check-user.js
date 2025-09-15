const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'hayat@gmail.com';
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }
    
    console.log('✅ User found:', email);
    console.log('ID:', user.id);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Created:', user.createdAt);
    console.log('Password set:', user.password ? '✅ YES' : '❌ NO');
    
    if (user.password) {
      console.log('Password length:', user.password.length);
      console.log('Password starts with:', user.password.substring(0, 10) + '...');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 