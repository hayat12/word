import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words/by-level/[level] - Get words by knowledge level
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level } = await params;
    const levelNum = parseInt(level);

    if (isNaN(levelNum) || levelNum < 1 || levelNum > 5) {
      return NextResponse.json(
        { error: 'Invalid level. Must be between 1 and 5' },
        { status: 400 }
      );
    }

    const words = await prisma.word.findMany({
      where: {
        userId: session.user.id,
        level: levelNum,
      },
      include: {
        tags: true,
      },
      orderBy: {
        lastReviewed: 'asc',
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words by level:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 