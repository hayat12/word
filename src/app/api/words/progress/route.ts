import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface WordProgressRecord {
  id: string;
  wordId: string;
  userId: string;
  studiedAt: Date;
  isCorrect: boolean;
  answer?: string;
  timeSpent?: number;
  word: {
    word: string;
    translation: string;
    language: string;
  };
}

// POST /api/words/progress - Track word study progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wordId, isCorrect, answer, timeSpent } = body;

    // Validate required fields
    if (!wordId || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'Word ID and correctness are required' },
        { status: 400 }
      );
    }

    // Verify the word belongs to the user
    const word = await prisma.word.findUnique({
      where: { id: wordId },
    });

    if (!word || word.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Word not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create progress record
    const progress = await prisma.wordProgress.create({
      data: {
        wordId,
        userId: session.user.id,
        isCorrect,
        answer: answer || null,
        timeSpent: timeSpent || null,
      },
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error('Error tracking word progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/words/progress - Get user's word study statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all progress records for the user
    const progressRecords = await prisma.wordProgress.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        word: {
          select: {
            word: true,
            translation: true,
            language: true,
          },
        },
      },
      orderBy: {
        studiedAt: 'desc',
      },
    });

    // If no progress records, return empty statistics
    if (progressRecords.length === 0) {
      const totalWords = await prisma.word.count({
        where: {
          userId: session.user.id,
        },
      });

      const languageBreakdown = await prisma.word.groupBy({
        by: ['language'],
        where: {
          userId: session.user.id,
        },
        _count: {
          id: true,
        },
      });

      return NextResponse.json({
        totalStudied: 0,
        correctAnswers: 0,
        accuracy: 0,
        uniqueWordsStudied: 0,
        totalWords,
        currentStreak: 0,
        studyDates: [],
        languageBreakdown,
        recentProgress: [],
      });
    }

    // Calculate statistics
    const totalStudied = progressRecords.length;
    const correctAnswers = progressRecords.filter((p: WordProgressRecord) => p.isCorrect).length;
    const accuracy = totalStudied > 0 ? (correctAnswers / totalStudied) * 100 : 0;

    // Get unique words studied
    const uniqueWordsStudied = new Set(progressRecords.map((p: WordProgressRecord) => p.wordId)).size;

    // Get total words available
    const totalWords = await prisma.word.count({
      where: {
        userId: session.user.id,
      },
    });

    // Get study streak (consecutive days with study activity)
    const studyDates = [...new Set(progressRecords.map((p: WordProgressRecord) => 
      p.studiedAt.toISOString().split('T')[0]
    ))].sort().reverse();

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    for (const date of studyDates) {
      if (date === checkDate) {
        currentStreak++;
        const yesterday = new Date(checkDate);
        yesterday.setDate(yesterday.getDate() - 1);
        checkDate = yesterday.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    // Get language breakdown
    const languageBreakdown = await prisma.word.groupBy({
      by: ['language'],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      totalStudied,
      correctAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      uniqueWordsStudied,
      totalWords,
      currentStreak,
      studyDates: studyDates.slice(0, 30), // Last 30 days
      languageBreakdown,
      recentProgress: progressRecords.slice(0, 10), // Last 10 study sessions
    });
  } catch (error) {
    console.error('Error fetching word progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 