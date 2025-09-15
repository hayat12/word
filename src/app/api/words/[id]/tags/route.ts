import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/words/[id]/tags - Add tags to a word
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: 'Tag IDs array is required' },
        { status: 400 }
      );
    }

    // Verify the word belongs to the user
    const word = await prisma.word.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found or unauthorized' },
        { status: 404 }
      );
    }

    // Verify all tags belong to the user
    const tags = await prisma.tag.findMany({
      where: {
        id: {
          in: tagIds,
        },
        userId: session.user.id,
      },
    });

    if (tags.length !== tagIds.length) {
      return NextResponse.json(
        { error: 'Some tags not found or unauthorized' },
        { status: 404 }
      );
    }

    // Add tags to the word
    const updatedWord = await prisma.word.update({
      where: { id },
      data: {
        tags: {
          connect: tagIds.map(tagId => ({ id: tagId })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error('Error adding tags to word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/words/[id]/tags - Remove tags from a word
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    // Verify the word belongs to the user
    const word = await prisma.word.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found or unauthorized' },
        { status: 404 }
      );
    }

    // Remove tag from the word
    const updatedWord = await prisma.word.update({
      where: { id },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error('Error removing tag from word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 