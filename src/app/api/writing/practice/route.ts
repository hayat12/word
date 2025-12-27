// Writing Practice API Route - Temporarily disabled
/*
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
    const prompt = `You are a German language writing expert. Analyze the following text written by a 
${user.userLevel} level German learner and provide constructive feedback.

TEXT TO ANALYZE:
Title: ${title || 'Untitled'}
Content: "${content}"

Please provide feedback on:
1. Grammar accuracy
2. Vocabulary usage and appropriateness for ${user.userLevel} level
3. Sentence structure and flow
4. Overall coherence and clarity
5. Specific suggestions for improvement

Respond with a JSON object containing:
{
  "overallScore": number (1-10),
  "grammarScore": number (1-10),
  "vocabularyScore": number (1-10),
  "structureScore": number (1-10),
  "feedback": "Detailed feedback explaining the scores and suggestions",
  "strengths": ["List of what the student did well"],
  "improvements": ["Specific areas to focus on for improvement"],
  "levelAppropriate": boolean
}

Be encouraging but honest in your assessment.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const aiResponse = completion.choices[0]?.message?.content;
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(aiResponse || '{}');
      } catch (parseError) {
        // Fallback if JSON parsing fails
        parsedResponse = {
          overallScore: 5,
          grammarScore: 5,
          vocabularyScore: 5,
          structureScore: 5,
          feedback: aiResponse || "Unable to analyze the text.",
          strengths: ["Text submitted successfully"],
          improvements: ["Please try again with a different text"],
          levelAppropriate: true
        };
      }

      // Create writing practice record
      const writingPractice = await prisma.writingPractice.create({
        data: {
          userId: user.id,
          title: title || 'Untitled',
          content: content,
          language: language,
          level: user.userLevel,
          overallScore: parsedResponse.overallScore,
          grammarScore: parsedResponse.grammarScore,
          vocabularyScore: parsedResponse.vocabularyScore,
          structureScore: parsedResponse.structureScore,
          aiFeedback: parsedResponse.feedback,
          strengths: parsedResponse.strengths,
          improvements: parsedResponse.improvements,
          isLevelAppropriate: parsedResponse.levelAppropriate
        }
      });

      return NextResponse.json({
        success: true,
        practice: {
          id: writingPractice.id,
          overallScore: parsedResponse.overallScore,
          grammarScore: parsedResponse.grammarScore,
          vocabularyScore: parsedResponse.vocabularyScore,
          structureScore: parsedResponse.structureScore,
          feedback: parsedResponse.feedback,
          strengths: parsedResponse.strengths,
          improvements: parsedResponse.improvements,
          levelAppropriate: parsedResponse.levelAppropriate
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      return NextResponse.json({
        success: false,
        error: 'AI service temporarily unavailable',
        message: 'Please try again in a few minutes.'
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Writing practice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
*/