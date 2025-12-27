import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words/[id] - Get a specific word
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const word = await prisma.word.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        tags: true,
      },
    });

    if (!word) {
      return NextResponse.json(
        { error: 'Word not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error('Error fetching word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/words/[id] - Update a word
export async function PUT(
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
    const { word, translation, example, language } = body;

    // Validate required fields
    if (!word || !translation || !language) {
      return NextResponse.json(
        { error: 'Word, translation, and language are required' },
        { status: 400 }
      );
    }

    // Verify the word belongs to the user
    const existingWord = await prisma.word.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingWord) {
      return NextResponse.json(
        { error: 'Word not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the word
    const updatedWord = await prisma.word.update({
      where: { id },
      data: {
        word,
        translation,
        example,
        language,
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/words/[id] - Delete a word
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

    // Delete the word (this will also delete related progress records due to cascade)
    await prisma.word.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
