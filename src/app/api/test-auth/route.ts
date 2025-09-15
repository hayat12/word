import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Testing auth for:', email);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found');
    console.log('Password field exists:', !!user.password);
    console.log('User role:', user.role);

    if (!user.password) {
      console.log('❌ User has no password set');
      return NextResponse.json({ error: 'User has no password set' }, { status: 401 });
    }

    // Test password comparison
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    console.log('✅ Authentication successful');
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 