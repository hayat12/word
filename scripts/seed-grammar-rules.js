const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

async function seedGrammarRules() {
  try {
    console.log('Starting to seed grammar rules...');

    // Check if rules already exist
    const existingCount = await prisma.grammarRule.count();
    if (existingCount > 0) {
      console.log(`Grammar rules already exist (${existingCount} rules found). Skipping seeding.`);
      return;
    }

    // Create grammar rules
    const createdRules = await prisma.grammarRule.createMany({
      data: initialGermanGrammarRules
    });

    console.log(`Successfully created ${createdRules.count} grammar rules!`);
    
    // Display created rules
    const rules = await prisma.grammarRule.findMany({
      orderBy: { level: 'asc' }
    });
    
    console.log('\nCreated grammar rules:');
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.title} (Level ${rule.level}, ${rule.category})`);
    });

  } catch (error) {
    console.error('Error seeding grammar rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGrammarRules(); 