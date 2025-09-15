import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words/practice - Get words for practice, excluding recently practiced ones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '20');
    const excludeRecentHours = parseInt(searchParams.get('excludeRecentHours') || '24');

    // Calculate the cutoff date for recently practiced words
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - excludeRecentHours);

    // Get recently practiced word IDs
    const recentProgress = await prisma.wordProgress.findMany({
      where: {
        userId: session.user.id,
        studiedAt: {
          gte: cutoffDate
        }
      },
      select: {
        wordId: true
      }
    });

    const recentlyPracticedWordIds = recentProgress.map(p => p.wordId);

    // Build the where clause for words
    let whereClause: any = {
      userId: session.user.id,
    };

    // Exclude recently practiced words
    if (recentlyPracticedWordIds.length > 0) {
      whereClause.id = {
        notIn: recentlyPracticedWordIds
      };
    }

    // Add tag filter if specified
    if (tagId) {
      whereClause.tags = {
        some: {
          id: tagId
        }
      };
    }

    // Fetch words for practice
    const words = await prisma.word.findMany({
      where: whereClause,
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
        { level: 'asc' }, // Prioritize lower level words
        { createdAt: 'desc' } // Then by creation date
      ],
      take: limit
    });

    // If we don't have enough words, include some recently practiced ones
    if (words.length < Math.min(limit, 5) && recentlyPracticedWordIds.length > 0) {
      const additionalWords = await prisma.word.findMany({
        where: {
          userId: session.user.id,
          id: {
            in: recentlyPracticedWordIds
          }
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
        take: limit - words.length
      });

      words.push(...additionalWords);
    }

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words for practice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 