// Grammar Rules API Route - Temporarily disabled
/*
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Seed initial German grammar rules
const initialGermanGrammarRules = [
  {
    title: "German Articles (Der, Die, Das)",
    description: "Learn the correct usage of German definite articles based on gender and case",
    language: "German",
    level: 1,
    category: "Articles",
    examples: [
      "Der Mann ist groß. (The man is tall.)",
      "Die Frau ist schön. (The woman is beautiful.)",
      "Das Kind spielt. (The child plays.)"
    ]
  },
  {
    title: "German Verb Conjugation - Present Tense",
    description: "Basic verb conjugation patterns in present tense",
    language: "German",
    level: 1,
    category: "Verb Conjugation",
    examples: [
      "Ich spiele Fußball. (I play football.)",
      "Du spielst Fußball. (You play football.)",
      "Er spielt Fußball. (He plays football.)"
    ]
  },
  {
    title: "German Cases - Nominative",
    description: "Understanding the nominative case for subjects",
    language: "German",
    level: 1,
    category: "Cases",
    examples: [
      "Der Hund läuft. (The dog runs.)",
      "Die Katze schläft. (The cat sleeps.)",
      "Das Auto ist rot. (The car is red.)"
    ]
  },
  {
    title: "German Cases - Accusative",
    description: "Understanding the accusative case for direct objects",
    language: "German",
    level: 2,
    category: "Cases",
    examples: [
      "Ich sehe den Hund. (I see the dog.)",
      "Er kauft die Zeitung. (He buys the newspaper.)",
      "Sie trinkt das Wasser. (She drinks the water.)"
    ]
  },
  {
    title: "German Adjective Endings",
    description: "Adjective endings based on gender, case, and article type",
    language: "German",
    level: 2,
    category: "Adjectives",
    examples: [
      "Der große Hund. (The big dog.)",
      "Die schöne Frau. (The beautiful woman.)",
      "Das kleine Kind. (The small child.)"
    ]
  },
  {
    title: "German Modal Verbs",
    description: "Usage of modal verbs like können, müssen, wollen",
    language: "German",
    level: 2,
    category: "Modal Verbs",
    examples: [
      "Ich kann Deutsch sprechen. (I can speak German.)",
      "Du musst lernen. (You must study.)",
      "Er will reisen. (He wants to travel.)"
    ]
  },
  {
    title: "German Past Tense - Perfekt",
    description: "Forming the past tense with haben and sein",
    language: "German",
    level: 2,
    category: "Past Tense",
    examples: [
      "Ich habe gelernt. (I have studied.)",
      "Er ist gegangen. (He has gone.)",
      "Wir haben gegessen. (We have eaten.)"
    ]
  },
  {
    title: "German Prepositions",
    description: "Common prepositions and their cases",
    language: "German",
    level: 2,
    category: "Prepositions",
    examples: [
      "Ich gehe in die Schule. (I go to school.)",
      "Das Buch liegt auf dem Tisch. (The book lies on the table.)",
      "Er kommt aus Deutschland. (He comes from Germany.)"
    ]
  }
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all grammar rules
    const grammarRules = await prisma.grammarRule.findMany({
      orderBy: [
        { level: 'asc' },
        { category: 'asc' },
        { title: 'asc' }
      ]
    });

    return NextResponse.json(grammarRules);
  } catch (error) {
    console.error('Error fetching grammar rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, language, level, category, examples } = body;

    const grammarRule = await prisma.grammarRule.create({
      data: {
        title,
        description,
        language,
        level,
        category,
        examples
      }
    });

    return NextResponse.json(grammarRule);
  } catch (error) {
    console.error('Error creating grammar rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Seed function to populate initial grammar rules
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if rules already exist
    const existingRules = await prisma.grammarRule.count();
    if (existingRules > 0) {
      return NextResponse.json({ message: 'Grammar rules already seeded' });
    }

    // Create initial grammar rules
    const createdRules = await prisma.grammarRule.createMany({
      data: initialGermanGrammarRules
    });

    return NextResponse.json({ 
      message: `Created ${createdRules.count} grammar rules`,
      count: createdRules.count 
    });
  } catch (error) {
    console.error('Error seeding grammar rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
*/