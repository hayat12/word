import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/tags/usage - Get tag usage statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all tags with word counts and usage statistics
    const tagsWithUsage = await prisma.tag.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            words: true,
          },
        },
        words: {
          include: {
            progress: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
      orderBy: {
        _count: {
          words: 'desc',
        },
      },
    });

    // Calculate usage statistics for each tag
    const tagsWithStats = tagsWithUsage.map(tag => {
      const totalWords = tag._count.words;
      const studiedWords = tag.words.filter(word => word.progress.length > 0).length;
      const totalProgress = tag.words.reduce((sum, word) => sum + word.progress.length, 0);
      const correctProgress = tag.words.reduce((sum, word) => 
        sum + word.progress.filter(p => p.isCorrect).length, 0
      );
      
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        description: tag.description,
        totalWords,
        studiedWords,
        totalProgress,
        correctProgress,
        accuracy: totalProgress > 0 ? Math.round((correctProgress / totalProgress) * 100) : 0,
        usagePercentage: totalWords > 0 ? Math.round((studiedWords / totalWords) * 100) : 0,
      };
    });

    // Get top 10 most used tags
    const topTags = tagsWithStats
      .filter(tag => tag.totalWords > 0)
      .sort((a, b) => b.totalWords - a.totalWords)
      .slice(0, 10);

    return NextResponse.json({
      allTags: tagsWithStats,
      topTags,
      totalTags: tagsWithStats.length,
      totalWords: tagsWithStats.reduce((sum, tag) => sum + tag.totalWords, 0),
    });
  } catch (error) {
    console.error('Error fetching tag usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 