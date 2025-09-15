import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/user/level-progress - Get user's progress for current level
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || user.userLevel;

    // Get grammar rules for the current level
    const grammarRules = await prisma.grammarRule.findMany({
      where: {
        level: level as any
      }
    });

    // Get user's grammar practice for the current level
    const grammarPractices = await prisma.grammarPractice.findMany({
      where: {
        userId: user.id,
        grammarRule: {
          level: level as any
        }
      },
      include: {
        grammarRule: true,
        attempts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Calculate grammar progress
    const totalGrammarRules = grammarRules.length;
    const practicedGrammarRules = grammarPractices.length;
    const grammarProgress = totalGrammarRules > 0 ? (practicedGrammarRules / totalGrammarRules) * 100 : 0;

    // Get vocabulary progress (words studied for current level)
    // Convert level to number (A1=1, A2=2, B1=3, B2=4, C1=5, C2=6)
    const levelToNumber: Record<string, number> = {
      'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
    };
    const levelNumber = levelToNumber[level] || 1;

    const vocabularyProgress = await prisma.wordProgress.count({
      where: {
        userId: user.id,
        word: {
          level: levelNumber
        }
      }
    });

    // Get writing practice progress (for B1+ levels)
    let writingProgress = 0;
    let totalWritingExercises = 0;
    
    if (['B1', 'B2', 'C1', 'C2'].includes(level)) {
      const writingPractices = await prisma.writingPractice.findMany({
        where: {
          userId: user.id,
          userLevel: level as any
        }
      });
      
      writingProgress = writingPractices.length;
      totalWritingExercises = 10; // Set a target of 10 writing exercises per level
    }

    // Get daily goal progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayProgress = await prisma.wordProgress.count({
      where: {
        userId: user.id,
        studiedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const dailyGoalProgress = user.dailyGoal > 0 
      ? Math.min((todayProgress / user.dailyGoal) * 100, 100) 
      : 0;

    return NextResponse.json({
      level,
      grammar: {
        total: totalGrammarRules,
        practiced: practicedGrammarRules,
        progress: Math.round(grammarProgress),
        rules: grammarPractices.map((practice: any) => ({
          id: practice.grammarRule.id,
          title: practice.grammarRule.title,
          practiceCount: practice.practiceCount,
          lastPracticed: practice.lastPracticed
        }))
      },
      vocabulary: {
        total: vocabularyProgress,
        progress: Math.min((vocabularyProgress / 50) * 100, 100), // Target 50 words per level
        target: 50
      },
      writing: {
        total: writingProgress,
        target: totalWritingExercises,
        progress: totalWritingExercises > 0 ? (writingProgress / totalWritingExercises) * 100 : 0
      },
      dailyGoal: {
        current: todayProgress,
        target: user.dailyGoal,
        progress: Math.round(dailyGoalProgress),
        isCompleted: todayProgress >= user.dailyGoal
      }
    });
  } catch (error) {
    console.error('Error fetching level progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 