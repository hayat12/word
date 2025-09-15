const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Predefined tags with colors and descriptions
const predefinedTags = [
  { name: 'Business', color: '#1976d2', description: 'Business and professional vocabulary' },
  { name: 'Technology', color: '#d32f2f', description: 'Technology and IT related words' },
  { name: 'Travel', color: '#388e3c', description: 'Travel and tourism vocabulary' },
  { name: 'Food', color: '#f57c00', description: 'Food and cooking related words' },
  { name: 'Health', color: '#7b1fa2', description: 'Health and medical vocabulary' },
  { name: 'Education', color: '#c2185b', description: 'Education and academic words' },
  { name: 'Sports', color: '#009688', description: 'Sports and fitness vocabulary' },
  { name: 'Family', color: '#795548', description: 'Family and relationships' },
  { name: 'Nature', color: '#4caf50', description: 'Nature and environment words' },
  { name: 'Entertainment', color: '#ff9800', description: 'Entertainment and leisure' },
  { name: 'Daily Life', color: '#607d8b', description: 'Everyday vocabulary' },
  { name: 'Emotions', color: '#e91e63', description: 'Emotions and feelings' },
  { name: 'Transportation', color: '#3f51b5', description: 'Transportation and vehicles' },
  { name: 'Shopping', color: '#8bc34a', description: 'Shopping and commerce' },
  { name: 'Weather', color: '#00bcd4', description: 'Weather and climate' }
];

async function addRandomTags() {
  try {
    console.log('Starting to add random tags to words...');

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Processing user: ${user.email || user.id}`);

      // Get all words for this user
      const words = await prisma.word.findMany({
        where: { userId: user.id },
        include: { tags: true }
      });

      console.log(`Found ${words.length} words for user ${user.email || user.id}`);

      if (words.length === 0) {
        console.log(`No words found for user ${user.email || user.id}, skipping...`);
        continue;
      }

      // Create tags for this user if they don't exist
      for (const tagData of predefinedTags) {
        const existingTag = await prisma.tag.findFirst({
          where: {
            name: tagData.name,
            userId: user.id
          }
        });

        if (!existingTag) {
          await prisma.tag.create({
            data: {
              name: tagData.name,
              color: tagData.color,
              description: tagData.description,
              userId: user.id
            }
          });
          console.log(`Created tag: ${tagData.name} for user ${user.email || user.id}`);
        }
      }

      // Get all tags for this user
      const userTags = await prisma.tag.findMany({
        where: { userId: user.id }
      });

      console.log(`Found ${userTags.length} tags for user ${user.email || user.id}`);

      // Add random tags to each word
      for (const word of words) {
        // Skip if word already has tags
        if (word.tags.length > 0) {
          console.log(`Word "${word.word}" already has tags, skipping...`);
          continue;
        }

        // Randomly select 1-3 tags for each word
        const numTags = Math.floor(Math.random() * 3) + 1;
        const selectedTags = [];
        const availableTags = [...userTags];

        for (let i = 0; i < numTags && availableTags.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableTags.length);
          const selectedTag = availableTags.splice(randomIndex, 1)[0];
          selectedTags.push(selectedTag);
        }

        // Add tags to the word
        if (selectedTags.length > 0) {
          await prisma.word.update({
            where: { id: word.id },
            data: {
              tags: {
                connect: selectedTags.map(tag => ({ id: tag.id }))
              }
            }
          });

          const tagNames = selectedTags.map(tag => tag.name).join(', ');
          console.log(`Added tags [${tagNames}] to word "${word.word}"`);
        }
      }
    }

    console.log('Successfully added random tags to all words!');
  } catch (error) {
    console.error('Error adding random tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addRandomTags(); 