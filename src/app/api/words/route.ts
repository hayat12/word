import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words - Get all words for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const words = await prisma.word.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/words - Create a new word
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { word, translation, example, language } = body;

    // Validate required fields
    if (!word || !translation || !language) {
      return NextResponse.json(
        { error: 'Word, translation, and language are required' },
        { status: 400 }
      );
    }

    const newWord = await prisma.word.create({
      data: {
        word,
        translation,
        example,
        language,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newWord, { status: 201 });
  } catch (error) {
    console.error('Error creating word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 