// Test script to verify word approval workflow
// This script tests the word approval system functionality

const testWordApprovalWorkflow = async () => {
  console.log('Testing Word Approval Workflow...\n');

  try {
    // Test 1: Create a word as a regular user (should be PENDING)
    console.log('1. Testing word creation as regular user...');
    const userWordResponse = await fetch('/api/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: 'Test Word',
        translation: 'Test Translation',
        example: 'This is a test example',
        language: 'German'
      })
    });

    if (userWordResponse.ok) {
      const userWord = await userWordResponse.json();
      console.log('✅ User word created:', userWord.approvalStatus); // Should be PENDING
    } else {
      console.log('❌ Failed to create user word');
    }

    // Test 2: Create a word as admin (should be APPROVED)
    console.log('\n2. Testing word creation as admin...');
    const adminWordResponse = await fetch('/api/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: 'Admin Word',
        translation: 'Admin Translation',
        example: 'This is an admin example',
        language: 'German'
      })
    });

    if (adminWordResponse.ok) {
      const adminWord = await adminWordResponse.json();
      console.log('✅ Admin word created:', adminWord.approvalStatus); // Should be APPROVED
    } else {
      console.log('❌ Failed to create admin word');
    }

    // Test 3: Fetch words (should only show approved + own words)
    console.log('\n3. Testing word fetching...');
    const wordsResponse = await fetch('/api/words');
    if (wordsResponse.ok) {
      const words = await wordsResponse.json();
      console.log('✅ Words fetched:', words.length, 'words');
      words.forEach(word => {
        console.log(`  - ${word.word}: ${word.approvalStatus} (by ${word.user?.name || 'Unknown'})`);
      });
    } else {
      console.log('❌ Failed to fetch words');
    }

    // Test 4: Admin word approval (if admin)
    console.log('\n4. Testing admin word approval...');
    const adminWordsResponse = await fetch('/api/admin/words?status=PENDING');
    if (adminWordsResponse.ok) {
      const pendingWords = await adminWordsResponse.json();
      console.log('✅ Pending words fetched:', pendingWords.length);
      
      if (pendingWords.length > 0) {
        const approveResponse = await fetch('/api/admin/words', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordIds: [pendingWords[0].id],
            action: 'approve'
          })
        });

        if (approveResponse.ok) {
          const result = await approveResponse.json();
          console.log('✅ Word approved:', result.message);
        } else {
          console.log('❌ Failed to approve word');
        }
      }
    } else {
      console.log('❌ Failed to fetch pending words (may not be admin)');
    }

    console.log('\n✅ Word approval workflow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for use in other files
export { testWordApprovalWorkflow };

// Run if this file is executed directly
if (typeof window === 'undefined') {
  testWordApprovalWorkflow();
}
