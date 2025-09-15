import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/analytics/daily - Get daily learning statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's progress
    const todayProgress = await prisma.wordProgress.findMany({
      where: {
        userId: session.user.id,
        studiedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get words by level distribution
    const levelDistribution = await prisma.word.groupBy({
      by: ['level'],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
    });

    // Get due reviews count
    const dueReviews = await prisma.word.count({
      where: {
        userId: session.user.id,
        OR: [
          {
            nextReview: {
              lte: new Date(),
            },
          },
          {
            nextReview: null,
          },
        ],
      },
    });

    // Get total words count
    const totalWords = await prisma.word.count({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate today's statistics
    const totalStudied = todayProgress.length;
    const correctAnswers = todayProgress.filter(p => p.isCorrect).length;
    const accuracy = totalStudied > 0 ? (correctAnswers / totalStudied) * 100 : 0;

    // Get user's learning preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyGoal: true,
        streakDays: true,
        lastPracticeDate: true,
      },
    });

    // Check if user practiced today
    const practicedToday = todayProgress.length > 0;
    const goalAchieved = practicedToday && totalStudied >= (user?.dailyGoal || 10);

    return NextResponse.json({
      today: {
        totalStudied,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        goalAchieved,
        practicedToday,
      },
      overall: {
        totalWords,
        dueReviews,
        levelDistribution: levelDistribution.map(level => ({
          level: level.level,
          count: level._count.id,
        })),
        dailyGoal: user?.dailyGoal || 10,
        streakDays: user?.streakDays || 0,
        lastPracticeDate: user?.lastPracticeDate,
      },
    });
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 