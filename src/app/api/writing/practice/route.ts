import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user level is B1 or above
    const allowedLevels = ['B1', 'B2', 'C1', 'C2'];
    if (!allowedLevels.includes(user.userLevel)) {
      return NextResponse.json({ 
        error: 'Writing practice is only available for B1 level and above',
        currentLevel: user.userLevel,
        requiredLevel: 'B1'
      }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, language = 'German' } = body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check word count (max 250 words)
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 250) {
      return NextResponse.json({ 
        error: 'Content too long. Maximum 250 words allowed.',
        wordCount 
      }, { status: 400 });
    }

    // Create OpenAI prompt for writing feedback
    const prompt = `You are a German language writing expert. Analyze the following text written by a ${user.userLevel} level student.

STUDENT LEVEL: ${user.userLevel}
LANGUAGE: ${language}
TEXT LENGTH: ${wordCount} words

STUDENT TEXT:
${content}

INSTRUCTIONS:
1. Analyze the text for grammar, vocabulary, structure, and coherence
2. Provide constructive feedback suitable for ${user.userLevel} level
3. Focus on the most important areas for improvement
4. Be encouraging and specific
5. Provide maximum 10 short feedback points

RESPONSE FORMAT:
1. [Feedback point 1]
2. [Feedback point 2]
3. [Feedback point 3]
...
(maximum 10 points)

Keep each feedback point concise and actionable.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a German writing expert. Provide constructive, level-appropriate feedback. Focus on the most important areas for improvement. Be encouraging and specific. Maximum 10 feedback points."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const aiFeedback = completion.choices[0]?.message?.content || '';

    // Create writing practice record
    const writingPractice = await prisma.writingPractice.create({
      data: {
        userId: user.id,
        title: title || `Writing Practice - ${new Date().toLocaleDateString()}`,
        content: content.trim(),
        language,
        userLevel: user.userLevel,
        aiFeedback: aiFeedback.length > 1000 ? aiFeedback.substring(0, 1000) + '...' : aiFeedback
      }
    });

    return NextResponse.json({
      success: true,
      writingPractice: {
        id: writingPractice.id,
        title: writingPractice.title,
        content: writingPractice.content,
        language: writingPractice.language,
        userLevel: writingPractice.userLevel,
        aiFeedback: writingPractice.aiFeedback,
        createdAt: writingPractice.createdAt
      },
      wordCount
    });

  } catch (error) {
    console.error('Error in writing practice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user's writing practices
    const writingPractices = await prisma.writingPractice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(writingPractices);
  } catch (error) {
    console.error('Error fetching writing practices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 