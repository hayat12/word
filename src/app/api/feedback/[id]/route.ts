import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const { title, content, rating } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Find the feedback and check ownership
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    if (feedback.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if feedback is within 1 minute of creation
    const now = new Date();
    const createdAt = new Date(feedback.createdAt);
    const timeDiff = now.getTime() - createdAt.getTime();
    const oneMinute = 60 * 1000; // 60 seconds in milliseconds

    if (timeDiff > oneMinute) {
      return NextResponse.json(
        { error: 'Feedback can only be edited within 1 minute of creation' },
        { status: 403 }
      );
    }

    // Update the feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        title,
        content,
        rating: rating || 0,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Find the feedback and check ownership
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    if (feedback.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if feedback is within 1 minute of creation
    const now = new Date();
    const createdAt = new Date(feedback.createdAt);
    const timeDiff = now.getTime() - createdAt.getTime();
    const oneMinute = 60 * 1000; // 60 seconds in milliseconds

    if (timeDiff > oneMinute) {
      return NextResponse.json(
        { error: 'Feedback can only be deleted within 1 minute of creation' },
        { status: 403 }
      );
    }

    // Delete the feedback
    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 