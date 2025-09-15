import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words/by-tag/[tagId] - Get words by tag
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tagId } = await params;

    // Verify the tag belongs to the user
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id,
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found or unauthorized' },
        { status: 404 }
      );
    }

    const words = await prisma.word.findMany({
      where: {
        userId: session.user.id,
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      include: {
        tags: true,
      },
      orderBy: [
        {
          level: 'asc',
        },
        {
          lastReviewed: 'asc',
        },
      ],
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words by tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 