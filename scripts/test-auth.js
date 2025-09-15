const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    const email = 'hayat@gmail.com';
    const password = 'password123';
    
    console.log('🔍 Testing authentication for:', email);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found');
    console.log('Password field exists:', !!user.password);
    
    if (!user.password) {
      console.log('❌ User has no password set');
      return;
    }

    // Test password comparison
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isValidPassword);
    
    if (isValidPassword) {
      console.log('✅ Password is valid!');
      console.log('User ID:', user.id);
      console.log('User name:', user.name);
      console.log('User role:', user.role);
    } else {
      console.log('❌ Password is invalid');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth(); 