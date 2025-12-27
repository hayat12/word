// Grammar Practice API Route - Temporarily disabled
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

    const body = await request.json();
    const { grammarRuleId, userInput } = body;

    // Validate input
    if (!grammarRuleId || !userInput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate user input length (max 5 words)
    const wordCount = userInput.trim().split(/\s+/).length;
    if (wordCount > 5) {
      return NextResponse.json({ 
        error: 'Input too long. Maximum 5 words allowed.',
        wordCount 
      }, { status: 400 });
    }

    // Get grammar rule
    const grammarRule = await prisma.grammarRule.findUnique({
      where: { id: grammarRuleId }
    });

    if (!grammarRule) {
      return NextResponse.json({ error: 'Grammar rule not found' }, { status: 404 });
    }

    // Get or create grammar practice record
    let grammarPractice = await prisma.grammarPractice.findUnique({
      where: {
        userId_grammarRuleId: {
          userId: user.id,
          grammarRuleId: grammarRuleId
        }
      }
    });

    if (!grammarPractice) {
      grammarPractice = await prisma.grammarPractice.create({
        data: {
          userId: user.id,
          grammarRuleId: grammarRuleId
        }
      });
    }

    // Create OpenAI prompt for grammar checking
    const prompt = `You are a German language grammar expert. Your task is to check if the user's input correctly applies the specific grammar rule provided.

GRAMMAR RULE TO CHECK: 
Title: ${grammarRule.title}
Description: ${grammarRule.description}
Examples: ${grammarRule.examples.join(', ')}

USER INPUT: "${userInput}"

Please analyze the user's input and determine if it correctly follows the grammar rule. Consider:
1. Does the input follow the grammatical structure described in the rule?
2. Are the words used correctly according to the rule?
3. Is the sentence structure appropriate?

Respond with a JSON object containing:
{
  "isCorrect": boolean,
  "feedback": "Brief explanation of why it's correct or what needs to be improved",
  "suggestions": "Optional suggestions for improvement if incorrect"
}

Be concise but helpful in your feedback.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const aiResponse = completion.choices[0]?.message?.content;
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(aiResponse || '{}');
      } catch (parseError) {
        // Fallback if JSON parsing fails
        parsedResponse = {
          isCorrect: false,
          feedback: aiResponse || "Unable to analyze the input.",
          suggestions: "Please try again with a different input."
        };
      }

      // Create practice attempt record
      const attempt = await prisma.grammarPracticeAttempt.create({
        data: {
          practiceId: grammarPractice.id,
          userInput: userInput,
          isCorrect: parsedResponse.isCorrect,
          aiFeedback: parsedResponse.feedback,
          errorMessage: parsedResponse.suggestions
        }
      });

      // Update practice count and last practiced date
      await prisma.grammarPractice.update({
        where: { id: grammarPractice.id },
        data: {
          practiceCount: { increment: 1 },
          lastPracticed: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        attempt: {
          id: attempt.id,
          isCorrect: parsedResponse.isCorrect,
          feedback: parsedResponse.feedback,
          suggestions: parsedResponse.suggestions
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Create attempt record with error
      const attempt = await prisma.grammarPracticeAttempt.create({
        data: {
          practiceId: grammarPractice.id,
          userInput: userInput,
          isCorrect: false,
          errorMessage: "AI service temporarily unavailable. Please try again later."
        }
      });

      return NextResponse.json({
        success: false,
        error: 'AI service temporarily unavailable',
        attempt: {
          id: attempt.id,
          isCorrect: false,
          feedback: "AI service temporarily unavailable. Please try again later.",
          suggestions: "Please try again in a few minutes."
        }
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Grammar practice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
*/