const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupGrammar() {
  try {
    console.log('🚀 Setting up Grammar Practice feature...\n');

    // Step 1: Generate Prisma client
    console.log('1. Generating Prisma client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully\n');
    } catch (error) {
      console.log('⚠️  Prisma client generation failed. Make sure DATABASE_URL is set.\n');
    }

    // Step 2: Check if database is accessible
    console.log('2. Checking database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful\n');
    } catch (error) {
      console.log('❌ Database connection failed. Please check your DATABASE_URL in .env.local\n');
      console.log('Make sure to set: DATABASE_URL="postgresql://username:password@localhost:5432/database_name"\n');
      return;
    }

    // Step 3: Check if grammar rules exist
    console.log('3. Checking existing grammar rules...');
    const existingRules = await prisma.grammarRule.count();
    
    if (existingRules > 0) {
      console.log(`✅ Found ${existingRules} existing grammar rules\n`);
    } else {
      console.log('📝 No grammar rules found. You can seed them using the API endpoint.\n');
      console.log('To seed grammar rules, make a PUT request to /api/grammar/rules (requires admin access)\n');
    }

    // Step 4: Display setup instructions
    console.log('📋 Setup Instructions:');
    console.log('1. Make sure your .env.local file contains:');
    console.log('   DATABASE_URL="your_postgresql_connection_string"');
    console.log('   OPENAI_API_KEY="your_openai_api_key"');
    console.log('');
    console.log('2. Run database migration:');
    console.log('   npx prisma migrate dev --name add_grammar_practice');
    console.log('');
    console.log('3. Seed grammar rules (if you have admin access):');
    console.log('   curl -X PUT http://localhost:3000/api/grammar/rules');
    console.log('');
    console.log('4. Start the development server:');
    console.log('   npm run dev');
    console.log('');
    console.log('5. Visit: http://localhost:3000/practice/grammar');
    console.log('');
    console.log('🎉 Grammar Practice feature is ready!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupGrammar(); 