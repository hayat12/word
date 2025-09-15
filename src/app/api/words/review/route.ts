import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/words/review - Update word level after review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wordId, isCorrect } = body;

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

    // Spaced repetition algorithm
    const intervals = [1, 3, 7, 14, 30]; // Days between reviews for each level
    const currentLevel = word.level;
    const newLevel = isCorrect ? Math.min(currentLevel + 1, 5) : Math.max(currentLevel - 1, 1);
    const daysToAdd = intervals[newLevel - 1];
    const nextReview = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    // Update word with new level and review information
    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: {
        level: newLevel,
        nextReview,
        lastReviewed: new Date(),
        reviewCount: {
          increment: 1,
        },
      },
      include: {
        tags: true,
      },
    });

    // Track progress
    await prisma.wordProgress.create({
      data: {
        wordId,
        userId: session.user.id,
        isCorrect,
        answer: null,
        timeSpent: null,
      },
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error('Error updating word review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 