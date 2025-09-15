"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Label as LabelIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

interface Word {
  id: string;
  word: string;
  translation: string;
  example?: string;
  language: string;
  level: number;
  nextReview?: string;
  lastReviewed?: string;
  reviewCount: number;
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  _count: {
    words: number;
  };
}

interface PracticeMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  endpoint: string;
}

export default function PracticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });

  const practiceModes: PracticeMode[] = [
    {
      id: 'due-review',
      title: 'Due Reviews',
      description: 'Practice words that are due for review',
      icon: <ScheduleIcon />,
      color: '#f57c00',
      endpoint: '/api/words/due-review',
    },
    {
      id: 'level-1',
      title: 'Level 1 - New Words',
      description: 'Practice beginner level words',
      icon: <SchoolIcon />,
      color: '#4caf50',
      endpoint: '/api/words/by-level/1',
    },
    {
      id: 'level-2',
      title: 'Level 2 - Intermediate',
      description: 'Practice intermediate level words',
      icon: <TrendingUpIcon />,
      color: '#2196f3',
      endpoint: '/api/words/by-level/2',
    },
    {
      id: 'level-3',
      title: 'Level 3 - Advanced',
      description: 'Practice advanced level words',
      icon: <StarIcon />,
      color: '#9c27b0',
      endpoint: '/api/words/by-level/3',
    },
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if we have a tag parameter in the URL
    const tagId = searchParams.get('tag');
    if (tagId) {
      // If we have a tag parameter, immediately fetch words and redirect to training
      handleTagPracticeAndRedirect(tagId);
    } else {
      fetchTags();
    }
  }, [session, status, searchParams]);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handlePracticeMode = async (mode: PracticeMode) => {
    setLoading(true);
    try {
      const response = await fetch(mode.endpoint);
      if (response.ok) {
        const data = await response.json();
        setWords(data);
        setSelectedMode(mode.id);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagPractice = async (tagId: string) => {
    // Redirect directly to words training with the tag parameter
    router.replace(`/training/words?mode=tag-${tagId}&tag=${tagId}`);
  };

  const handleTagPracticeAndRedirect = async (tagId: string) => {
    // Redirect directly to words training with the tag parameter
    router.replace(`/training/words?mode=tag-${tagId}&tag=${tagId}`);
  };

  const startPractice = () => {
    if (words.length > 0) {
      // Redirect to words training with the filtered words
      const wordIds = words.map(w => w.id).join(',');
      const mode = selectedMode || 'custom';
      
      // Always redirect to words training page (not practice page)
      const trainingUrl = `/training/words?mode=${mode}&words=${wordIds}`;
      router.replace(trainingUrl);
    }
  };

  if (status === 'loading') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading practice options...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7', pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #dfe1e6', mb: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button 
              onClick={() => router.push('/dashboard')}
              startIcon={<ArrowBackIcon />}
              sx={{ color: '#172b4d', textTransform: 'none' }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#172b4d' }}>
              Practice Modes
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        
        {/* Practice Modes */}
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#172b4d', mb: 3 }}>
          Choose Practice Mode
        </Typography>
        
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4
        }}>
          {practiceModes.map((mode) => (
            <Card key={mode.id} sx={{ 
              bgcolor: 'white', 
              borderRadius: 1, 
              border: '1px solid #dfe1e6',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => handlePracticeMode(mode)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: mode.color,
                  color: 'white',
                  mb: 2
                }}>
                  {mode.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 1 }}>
                  {mode.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b778c' }}>
                  {mode.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Tags Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#172b4d', mb: 3 }}>
            Practice by Topic
          </Typography>
          
          {tags.length > 0 ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2
            }}>
              {tags.map((tag) => (
                <Card key={tag.id} sx={{ 
                  bgcolor: 'white', 
                  borderRadius: 1, 
                  border: '1px solid #dfe1e6',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleTagPractice(tag.id)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LabelIcon sx={{ color: tag.color || '#1976d2' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#172b4d' }}>
                          {tag.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b778c' }}>
                          {tag._count.words} words
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No tags created yet. Create tags to organize your words by topic!
            </Alert>
          )}
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#6b778c' }}>
              Loading words...
            </Typography>
          </Box>
        )}

        {/* Selected Mode Info */}
        {selectedMode && words.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Card sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid #dfe1e6' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d' }}>
                    Ready to Practice
                  </Typography>
                  <Chip 
                    label={`${words.length} words`} 
                    size="small" 
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#6b778c', mb: 3 }}>
                  You have {words.length} words ready for practice. Click the button below to start training.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={startPractice}
                  sx={{ 
                    bgcolor: '#1976d2',
                    '&:hover': {
                      bgcolor: '#1565c0'
                    }
                  }}
                >
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* No Words Alert */}
        {selectedMode && words.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 4 }}>
            No words found for this practice mode. Try a different mode or add more words to your collection.
          </Alert>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 