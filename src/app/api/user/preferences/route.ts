import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        userLevel: true,
        preferredLanguage: true,
        dailyGoal: true,
        streakDays: true,
        lastPracticeDate: true,
        defaultCategory: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userLevel, preferredLanguage, dailyGoal, defaultCategory } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(userLevel && { userLevel }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(dailyGoal && { dailyGoal }),
        ...(defaultCategory && { defaultCategory })
      },
      select: {
        id: true,
        name: true,
        email: true,
        userLevel: true,
        preferredLanguage: true,
        dailyGoal: true,
        streakDays: true,
        lastPracticeDate: true,
        defaultCategory: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 