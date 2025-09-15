# Grammar Practice Feature

A comprehensive German grammar practice system with AI-powered feedback using OpenAI integration.

## Features

- **Grammar Rules Library**: Pre-built German grammar rules with examples
- **AI-Powered Feedback**: Real-time grammar checking using OpenAI GPT-3.5-turbo
- **Practice Tracking**: Monitor your progress and practice history
- **Input Validation**: Maximum 5 words per practice attempt
- **Cost Optimization**: Efficient prompts to minimize API costs
- **Modern UI**: Clean, responsive interface with Material-UI components

## Database Schema

### New Models Added

1. **GrammarRule**: Stores grammar rules with examples
2. **GrammarPractice**: Tracks user practice sessions
3. **GrammarPracticeAttempt**: Records individual practice attempts

### Schema Details

```prisma
model GrammarRule {
  id          String   @id @default(cuid())
  title       String
  description String
  language    String
  level       Int      @default(1)
  category    String
  examples    String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  practices   GrammarPractice[]
}

model GrammarPractice {
  id            String   @id @default(cuid())
  userId        String
  grammarRuleId String
  createdAt     DateTime @default(now())
  lastPracticed DateTime?
  practiceCount Int      @default(0)
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  grammarRule   GrammarRule @relation(fields: [grammarRuleId], references: [id], onDelete: Cascade)
  attempts      GrammarPracticeAttempt[]
  
  @@unique([userId, grammarRuleId])
}

model GrammarPracticeAttempt {
  id                String   @id @default(cuid())
  practiceId        String
  userInput         String   // Max 5 words
  isCorrect         Boolean
  aiFeedback        String?  // Max 100 words
  errorMessage      String?  // Max 50 words
  createdAt         DateTime @default(now())
  
  practice          GrammarPractice @relation(fields: [practiceId], references: [id], onDelete: Cascade)
}
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
OPENAI_API_KEY="your_openai_api_key"
```

### 2. Database Migration

Run the migration to create the new tables:

```bash
npx prisma migrate dev --name add_grammar_practice
```

### 3. Seed Grammar Rules

Option 1: Using the API endpoint (requires admin access):
```bash
curl -X PUT http://localhost:3000/api/grammar/rules
```

Option 2: Using the seed script:
```bash
node scripts/seed-grammar-rules.js
```

### 4. Install Dependencies

```bash
npm install openai @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Access the Feature

Visit: `http://localhost:3000/practice/grammar`

## API Endpoints

### GET /api/grammar/rules
- **Description**: Fetch all grammar rules
- **Authentication**: Required
- **Response**: Array of grammar rules

### POST /api/grammar/rules
- **Description**: Create a new grammar rule (Admin only)
- **Authentication**: Required (Admin)
- **Body**: `{ title, description, language, level, category, examples }`

### PUT /api/grammar/rules
- **Description**: Seed initial German grammar rules (Admin only)
- **Authentication**: Required (Admin)

### POST /api/grammar/practice
- **Description**: Practice grammar with AI feedback
- **Authentication**: Required
- **Body**: `{ grammarRuleId, userInput }`
- **Validation**: 
  - `userInput` must be ≤ 5 words
  - `grammarRuleId` must be valid

### GET /api/grammar/practice
- **Description**: Get practice history
- **Authentication**: Required
- **Query Params**: `grammarRuleId` (optional)

## OpenAI Integration

### Prompt Structure
The system uses carefully crafted prompts to:
- Focus only on the specific grammar rule
- Provide concise feedback (max 100 words)
- Minimize API costs with efficient token usage
- Ensure consistent response format

### Cost Optimization
- Uses GPT-3.5-turbo (cheaper than GPT-4)
- Limited to 150 max tokens per response
- Structured prompts to avoid unnecessary verbosity
- Temperature set to 0.1 for consistent responses

### Response Format
```
Status: CORRECT/INCORRECT
Explanation: (only if incorrect, max 50 words)
```

## Included Grammar Rules

### Level 1 (Beginner)
1. **German Articles (Der, Die, Das)**
2. **German Verb Conjugation - Present Tense**
3. **German Cases - Nominative**

### Level 2 (Intermediate)
4. **German Cases - Accusative**
5. **German Adjective Endings**
6. **German Modal Verbs**
7. **German Past Tense - Perfekt**
8. **German Prepositions**

## UI Components

### Custom Components Created
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button` with variants
- `Input` with validation
- `Badge` with color variants
- `Alert` for feedback display

### Features
- **Responsive Design**: Works on desktop and mobile
- **Real-time Word Count**: Shows current word count (max 5)
- **Visual Feedback**: Color-coded success/error states
- **Practice History**: Shows recent practice attempts
- **Grammar Rule Selection**: Easy-to-use rule picker

## Usage Flow

1. **Select Grammar Rule**: Choose from the list of available rules
2. **View Examples**: See correct usage examples for the selected rule
3. **Practice**: Type a sentence (max 5 words) following the rule
4. **Get Feedback**: Receive instant AI-powered feedback
5. **Track Progress**: Monitor your practice history and success rate

## Security & Validation

- **Input Sanitization**: All user inputs are validated and sanitized
- **Authentication**: All endpoints require valid session
- **Admin Protection**: Grammar rule creation/seed requires admin role
- **Rate Limiting**: Consider implementing rate limiting for production

## Future Enhancements

- **Spaced Repetition**: Implement spaced repetition algorithm
- **Difficulty Progression**: Automatic difficulty adjustment based on performance
- **More Languages**: Extend to other languages beyond German
- **Grammar Rule Editor**: Admin interface for managing grammar rules
- **Practice Analytics**: Detailed analytics and progress reports
- **Offline Mode**: Basic practice without AI feedback

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env.local
   - Ensure PostgreSQL is running

2. **OpenAI API Error**
   - Verify OPENAI_API_KEY is set correctly
   - Check API key permissions and quota

3. **Migration Errors**
   - Run `npx prisma generate` first
   - Check for conflicting migrations

4. **UI Components Not Loading**
   - Ensure all dependencies are installed
   - Check for TypeScript compilation errors

### Support

For issues related to this feature, check:
1. Browser console for JavaScript errors
2. Server logs for API errors
3. Database connection status
4. Environment variable configuration 