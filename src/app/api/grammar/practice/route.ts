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

GRAMMAR RULE TO CHECK: ${grammarRule.title}
RULE DESCRIPTION: ${grammarRule.description}
CORRECT EXAMPLES: ${grammarRule.examples.join(' | ')}

USER INPUT: "${userInput}"

ANALYSIS INSTRUCTIONS:
1. Focus ONLY on the specific grammar rule mentioned above
2. Ignore other grammar aspects not related to this rule
3. Compare the user input with the provided examples
4. If the user input correctly applies the grammar rule, mark as CORRECT
5. Only mark as INCORRECT if the specific rule is violated

RESPONSE FORMAT:
Status: CORRECT
OR
Status: INCORRECT
Explanation: [brief explanation of the specific rule violation, max 50 words]`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a German grammar expert. You must focus ONLY on the specific grammar rule being tested. Do not check for other grammar aspects. If the user input correctly applies the specific rule, mark it as CORRECT. Be generous in marking correct answers that demonstrate understanding of the rule."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.1
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    
    // Debug: Log the AI response
    console.log('AI Response for grammar check:', aiResponse);
    
    // Parse AI response with fallback
    let isCorrect = aiResponse.includes('CORRECT');
    let explanation = null;
    
    // If the response doesn't contain CORRECT, check if it's a clear error
    if (!isCorrect && !aiResponse.includes('INCORRECT')) {
      // Fallback: if the response is unclear, default to correct for safety
      console.log('Unclear AI response, defaulting to correct');
      isCorrect = true;
    } else if (aiResponse.includes('INCORRECT')) {
      isCorrect = false;
      explanation = aiResponse.includes('Explanation:') 
        ? aiResponse.split('Explanation:')[1]?.trim() || null
        : 'Grammar rule not applied correctly';
    }

    // Create practice attempt record
    const attempt = await prisma.grammarPracticeAttempt.create({
      data: {
        practiceId: grammarPractice.id,
        userInput: userInput.trim(),
        isCorrect,
        aiFeedback: aiResponse.length > 100 ? aiResponse.substring(0, 100) + '...' : aiResponse,
        errorMessage: !isCorrect && explanation ? 
          (explanation.length > 50 ? explanation.substring(0, 50) + '...' : explanation) : 
          null
      }
    });

    // Update practice record
    await prisma.grammarPractice.update({
      where: { id: grammarPractice.id },
      data: {
        lastPracticed: new Date(),
        practiceCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      isCorrect,
      feedback: aiResponse,
      errorMessage: !isCorrect ? explanation : null,
      attempt: {
        id: attempt.id,
        userInput: attempt.userInput,
        isCorrect: attempt.isCorrect,
        createdAt: attempt.createdAt
      }
    });

  } catch (error) {
    console.error('Error in grammar practice:', error);
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
    const grammarRuleId = searchParams.get('grammarRuleId');

    if (grammarRuleId) {
      // Get practice history for specific grammar rule
      const practice = await prisma.grammarPractice.findUnique({
        where: {
          userId_grammarRuleId: {
            userId: user.id,
            grammarRuleId: grammarRuleId
          }
        },
        include: {
          grammarRule: true,
          attempts: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      return NextResponse.json(practice);
    } else {
      // Get all user's grammar practices
      const practices = await prisma.grammarPractice.findMany({
        where: { userId: user.id },
        include: {
          grammarRule: true,
          attempts: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { lastPracticed: 'desc' }
      });

      return NextResponse.json(practices);
    }
  } catch (error) {
    console.error('Error fetching grammar practice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 