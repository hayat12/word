import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/words - Get all words accessible to the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role to determine what words they can see
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    let whereClause: any = {};

    if (user?.role === 'ADMIN') {
      // Admins can see all words (their own + all approved words + pending words for review)
      whereClause = {
        OR: [
          { userId: session.user.id }, // Their own words
          { approvalStatus: 'APPROVED' }, // All approved words
          { approvalStatus: 'PENDING' } // Pending words for review
        ]
      };
    } else {
      // Regular users can see their own words + all approved words
      whereClause = {
        OR: [
          { userId: session.user.id }, // Their own words
          { approvalStatus: 'APPROVED' } // All approved words
        ]
      };
    }

    const words = await prisma.word.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
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

    // Get user role to determine approval status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    // Admin words are automatically approved, user words need approval
    const approvalStatus = user?.role === 'ADMIN' ? 'APPROVED' : 'PENDING';
    const approvedAt = user?.role === 'ADMIN' ? new Date() : null;
    const approvedBy = user?.role === 'ADMIN' ? session.user.id : null;

    const newWord = await prisma.word.create({
      data: {
        word,
        translation,
        example,
        language,
        userId: session.user.id,
        approvalStatus,
        approvedAt,
        approvedBy,
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