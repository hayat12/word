import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words/practice-modes - Get words for different practice modes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'new-words';
    const userLevel = searchParams.get('userLevel') || 'A1';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user's current level for filtering
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userLevel: true }
    });

    const currentUserLevel = user?.userLevel || userLevel;
    
    // Map user levels to numeric values for filtering
    const levelMap: { [key: string]: number[] } = {
      'A1': [1],
      'A2': [1, 2],
      'B1': [1, 2, 3],
      'B2': [1, 2, 3, 4],
      'C1': [1, 2, 3, 4, 5],
      'C2': [1, 2, 3, 4, 5]
    };

    const allowedLevels = levelMap[currentUserLevel] || [1];

    let words: Array<{
      id: string;
      word: string;
      translation: string;
      example?: string;
      language: string;
      createdAt: Date;
      level?: number;
      tags?: Array<{
        id: string;
        name: string;
        color?: string;
      }>;
    }> = [];

    switch (mode) {
      case 'new-words':
        // Get words that haven't been studied yet, filtered by user level
        words = await getNewWords(session.user.id, allowedLevels, limit);
        break;
      
      case 'mistakes':
        // Get words that were answered incorrectly recently
        words = await getMistakeWords(session.user.id, allowedLevels, limit);
        break;
      
      case 'week':
        // Get words studied in the last week
        words = await getWordsByTimeframe(session.user.id, allowedLevels, 7, limit);
        break;
      
      case '3weeks':
        // Get words studied in the last 3 weeks
        words = await getWordsByTimeframe(session.user.id, allowedLevels, 21, limit);
        break;
      
      case 'month':
        // Get words studied in the last month
        words = await getWordsByTimeframe(session.user.id, allowedLevels, 30, limit);
        break;
      
      case 'all-studied':
        // Get all words that have been studied (random order)
        words = await getAllStudiedWords(session.user.id, allowedLevels, limit);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid practice mode' }, { status: 400 });
    }

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words for practice mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get new words (not studied yet)
async function getNewWords(userId: string, allowedLevels: number[], limit: number) {
  // Get words that have never been studied
  const studiedWordIds = await prisma.wordProgress.findMany({
    where: { userId },
    select: { wordId: true },
    distinct: ['wordId']
  });

  const studiedIds = studiedWordIds.map(p => p.wordId);

  return await prisma.word.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId }, // User's own words
            { approvalStatus: 'APPROVED' } // All approved words
          ]
        },
        { level: { in: allowedLevels } },
        ...(studiedIds.length > 0 ? [{
          id: { notIn: studiedIds }
        }] : [])
      ]
    },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: [
      { level: 'asc' },
      { createdAt: 'desc' }
    ],
    take: limit
  });
}

// Helper function to get words that were answered incorrectly
async function getMistakeWords(userId: string, allowedLevels: number[], limit: number) {
  // Get words that were answered incorrectly in recent attempts
  const mistakeProgress = await prisma.wordProgress.findMany({
    where: {
      userId,
      isCorrect: false,
      studiedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    select: { wordId: true },
    orderBy: { studiedAt: 'desc' }
  });

  const mistakeWordIds = mistakeProgress.map(p => p.wordId);

  if (mistakeWordIds.length === 0) {
    return [];
  }

  return await prisma.word.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId }, // User's own words
            { approvalStatus: 'APPROVED' } // All approved words
          ]
        },
        { id: { in: mistakeWordIds } },
        { level: { in: allowedLevels } }
      ]
    },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: [
      { level: 'asc' },
      { createdAt: 'desc' }
    ],
    take: limit
  });
}

// Helper function to get words studied within a specific timeframe
async function getWordsByTimeframe(userId: string, allowedLevels: number[], days: number, limit: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const studiedWordIds = await prisma.wordProgress.findMany({
    where: {
      userId,
      studiedAt: { gte: startDate }
    },
    select: { wordId: true },
    distinct: ['wordId']
  });

  const studiedIds = studiedWordIds.map(p => p.wordId);

  if (studiedIds.length === 0) {
    return [];
  }

  return await prisma.word.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId }, // User's own words
            { approvalStatus: 'APPROVED' } // All approved words
          ]
        },
        { id: { in: studiedIds } },
        { level: { in: allowedLevels } }
      ]
    },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: [
      { level: 'asc' },
      { createdAt: 'desc' }
    ],
    take: limit
  });
}

// Helper function to get all studied words in random order
async function getAllStudiedWords(userId: string, allowedLevels: number[], limit: number) {
  const studiedWordIds = await prisma.wordProgress.findMany({
    where: { userId },
    select: { wordId: true },
    distinct: ['wordId']
  });

  const studiedIds = studiedWordIds.map(p => p.wordId);

  if (studiedIds.length === 0) {
    return [];
  }

  return await prisma.word.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId }, // User's own words
            { approvalStatus: 'APPROVED' } // All approved words
          ]
        },
        { id: { in: studiedIds } },
        { level: { in: allowedLevels } }
      ]
    },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: [
      { level: 'asc' },
      { createdAt: 'desc' }
    ],
    take: limit
  });
}
