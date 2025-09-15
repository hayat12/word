import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/user/daily-goal - Get user's daily goal progress
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyGoal: true,
        streakDays: true,
        lastPracticeDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayProgress = await prisma.wordProgress.count({
      where: {
        userId: session.user.id,
        studiedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Calculate progress percentage
    const progressPercentage = user.dailyGoal > 0 
      ? Math.min((todayProgress / user.dailyGoal) * 100, 100) 
      : 0;

    return NextResponse.json({
      dailyGoal: user.dailyGoal,
      currentProgress: todayProgress,
      progressPercentage: Math.round(progressPercentage),
      streakDays: user.streakDays,
      lastPracticeDate: user.lastPracticeDate,
      isCompleted: todayProgress >= user.dailyGoal,
    });
  } catch (error) {
    console.error('Error fetching daily goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/daily-goal - Update user's daily goal
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dailyGoal } = body;

    if (typeof dailyGoal !== 'number' || dailyGoal < 1 || dailyGoal > 100) {
      return NextResponse.json(
        { error: 'Daily goal must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { dailyGoal },
      select: {
        dailyGoal: true,
        streakDays: true,
        lastPracticeDate: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating daily goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 