const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addPassword() {
  try {
    const email = 'hayat@gmail.com';
    const password = 'password123'; // You can change this password
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('User not found:', email);
      return;
    }
    
    if (user.password) {
      console.log('User already has a password set');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update the user with the password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('Password added successfully for:', email);
    console.log('Password is:', password);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPassword(); 