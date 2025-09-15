import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words/due-review - Get words due for review
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Get words due for review (nextReview <= now or nextReview is null)
    const dueWords = await prisma.word.findMany({
      where: {
        userId: session.user.id,
        OR: [
          {
            nextReview: {
              lte: now,
            },
          },
          {
            nextReview: null,
          },
        ],
      },
      include: {
        tags: true,
      },
      orderBy: [
        {
          level: 'asc', // Prioritize lower level words
        },
        {
          lastReviewed: 'asc', // Then by last reviewed date
        },
      ],
    });

    return NextResponse.json(dueWords);
  } catch (error) {
    console.error('Error fetching due words:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 