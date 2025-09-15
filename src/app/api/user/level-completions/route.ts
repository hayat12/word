import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/user/level-completions - Get user's completed levels
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        levelCompletions: {
          orderBy: {
            completedAt: 'asc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.levelCompletions);
  } catch (error) {
    console.error('Error fetching level completions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/level-completions - Mark a level as completed
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { level, score } = body;

    if (!level || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) {
      return NextResponse.json({ error: 'Valid level is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if level is already completed
    const existingCompletion = await prisma.levelCompletion.findUnique({
      where: {
        userId_level: {
          userId: user.id,
          level: level as any
        }
      }
    });

    if (existingCompletion) {
      return NextResponse.json({ error: 'Level already completed' }, { status: 400 });
    }

    // Create level completion
    const levelCompletion = await prisma.levelCompletion.create({
      data: {
        userId: user.id,
        level: level as any,
        score: score || null
      }
    });

    return NextResponse.json(levelCompletion, { status: 201 });
  } catch (error) {
    console.error('Error creating level completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 