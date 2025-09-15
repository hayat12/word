"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyWordsTrainingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the words page
    router.push('/words');
  }, [router]);

  return (
    <div>
      Redirecting to My Words...
    </div>
  );
} 