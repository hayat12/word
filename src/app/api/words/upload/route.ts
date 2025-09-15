import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/words/upload - Upload words from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string;

    if (!file || !language) {
      return NextResponse.json(
        { error: 'File and language are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Read CSV content
    const csvContent = await file.text();
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header row if it exists
    const dataLines = lines.slice(1);
    
    const words = [];
    const errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length < 2) {
        errors.push(`Row ${i + 2}: Invalid format - need at least word and translation`);
        continue;
      }

      const [word, translation, example] = columns;

      if (!word || !translation) {
        errors.push(`Row ${i + 2}: Word and translation are required`);
        continue;
      }

      words.push({
        word,
        translation,
        example: example || null,
        language,
        userId: session.user.id,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV validation failed', details: errors },
        { status: 400 }
      );
    }

    // Insert words in batches
    const batchSize = 100;
    let totalCreated = 0;

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const result = await prisma.word.createMany({
        data: batch,
        skipDuplicates: true, // Skip if word already exists for this user
      });
      totalCreated += result.count;
    }

    return NextResponse.json({
      message: `Successfully imported ${totalCreated} words`,
      imported: totalCreated,
      total: words.length,
      errors: errors.length,
    });
  } catch (error) {
    console.error('Error uploading words:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 