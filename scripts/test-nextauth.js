const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Simulate the NextAuth credentials provider logic
async function testNextAuthCredentials() {
  const prisma = new PrismaClient();
  
  try {
    const credentials = {
      email: 'hayat@gmail.com',
      password: 'password123'
    };
    
    console.log('🔍 Testing NextAuth credentials provider...');
    console.log('Email:', credentials.email);
    console.log('Password provided:', credentials.password);
    
    if (!credentials.email || !credentials.password) {
      console.log("❌ Missing credentials");
      return null;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      console.log("❌ User not found:", credentials.email);
      return null;
    }

    console.log("✅ User found:", credentials.email);
    console.log("User ID:", user.id);
    console.log("User name:", user.name);
    console.log("User role:", user.role);
    console.log("Password field exists:", !!user.password);

    // Verify password for existing users
    if (!user.password) {
      console.log("❌ User has no password set:", credentials.email);
      return null;
    }
    
    console.log("✅ Password field exists, comparing...");
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    console.log("Password comparison result:", isValidPassword);
    
    if (!isValidPassword) {
      console.log("❌ Invalid password for user:", credentials.email);
      return null;
    }
    
    console.log("✅ User authenticated successfully:", user.id);
    return user;
    
  } catch (error) {
    console.error("❌ Auth error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

testNextAuthCredentials(); 