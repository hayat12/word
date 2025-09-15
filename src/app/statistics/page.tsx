"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface WordProgress {
  id: string;
  studiedAt: string;
  isCorrect: boolean;
  answer?: string;
  timeSpent?: number;
  word: {
    word: string;
    translation: string;
    language: string;
  };
}

interface Statistics {
  totalStudied: number;
  correctAnswers: number;
  accuracy: number;
  uniqueWordsStudied: number;
  totalWords: number;
  currentStreak: number;
  studyDates: string[];
  languageBreakdown: Array<{
    language: string;
    _count: { id: number };
  }>;
  recentProgress: WordProgress[];
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchStatistics();
  }, [session, status]);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/words/progress');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading statistics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7', pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #dfe1e6', mb: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton 
              onClick={() => router.push('/dashboard')}
              sx={{ color: '#172b4d' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#172b4d' }}>
              Study Statistics
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {statistics ? (
          <>
            {/* Overview Cards */}
            <Box sx={{ mb: 2 }}>
              <Card sx={{ 
                bgcolor: 'white', 
                borderRadius: 1, 
                border: '1px solid #dfe1e6',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 3, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                    Study Overview
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <SchoolIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#0052cc', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#172b4d', mb: 1, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                        {statistics.totalStudied}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Total Studied
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#4caf50', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                        {statistics.correctAnswers}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Correct Answers
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ff9800', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800', mb: 1, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                        {statistics.accuracy}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Accuracy Rate
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <TrophyIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#9c27b0', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                        {statistics.currentStreak}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Day Streak
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Progress Section */}
            <Box sx={{ mb: 2 }}>
              <Card sx={{ 
                bgcolor: 'white', 
                borderRadius: 1, 
                border: '1px solid #dfe1e6',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 3, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                    Progress & Language Breakdown
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#172b4d', mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                        Word Progress
                      </Typography>
                      
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body1" sx={{ color: '#172b4d', fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            Words Studied
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {statistics.uniqueWordsStudied} / {statistics.totalWords}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={statistics.totalWords > 0 ? (statistics.uniqueWordsStudied / statistics.totalWords) * 100 : 0}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: '#e3f2fd',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              bgcolor: '#0052cc'
                            }
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body1" sx={{ color: '#172b4d', fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            Accuracy
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {statistics.accuracy}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={statistics.accuracy}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: '#e8f5e8',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              bgcolor: '#4caf50'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#172b4d', mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                        Language Breakdown
                      </Typography>
                      
                      {statistics.languageBreakdown.length > 0 ? (
                        statistics.languageBreakdown.map((lang, index) => (
                          <Box key={lang.language} sx={{ mb: index < statistics.languageBreakdown.length - 1 ? 3 : 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Typography variant="body1" sx={{ color: '#172b4d', fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                {lang.language}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {lang._count.id} words
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={statistics.totalWords > 0 ? (lang._count.id / statistics.totalWords) * 100 : 0}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: '#f4f5f7',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  bgcolor: '#1976d2'
                                }
                              }}
                            />
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <LanguageIcon sx={{ fontSize: 48, color: '#6b778c', mb: 2 }} />
                          <Typography variant="body1" sx={{ color: '#6b778c' }}>
                            No words added yet
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Recent Activity */}
            <Card sx={{ 
              bgcolor: 'white', 
              borderRadius: 1, 
              border: '1px solid #dfe1e6',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 3, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                  Recent Study Activity
                </Typography>
                
                {statistics.recentProgress.length > 0 ? (
                  <TableContainer sx={{ borderRadius: 1, overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#172b4d', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Word</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#172b4d', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Translation</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#172b4d', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Language</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#172b4d', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Result</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#172b4d', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statistics.recentProgress.map((progress) => (
                          <TableRow key={progress.id} hover sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                            <TableCell sx={{ fontWeight: 500, color: '#172b4d', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {progress.word.word}
                            </TableCell>
                            <TableCell sx={{ color: '#6b778c', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {progress.word.translation}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={progress.word.language} 
                                size="small"
                                sx={{ 
                                  bgcolor: '#e3f2fd', 
                                  color: '#1976d2', 
                                  fontWeight: 500,
                                  fontSize: { xs: '0.625rem', sm: '0.75rem' }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={progress.isCorrect ? 'Correct' : 'Incorrect'} 
                                size="small"
                                color={progress.isCorrect ? 'success' : 'error'}
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: { xs: '0.625rem', sm: '0.75rem' }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#6b778c', fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                              {new Date(progress.studiedAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <TimelineIcon sx={{ fontSize: 48, color: '#6b778c', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#6b778c', mb: 1 }}>
                      No study activity yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b778c' }}>
                      Start training to see your progress!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
              No statistics available. Start studying words to see your progress!
            </Alert>
          </Box>
        )}
      </Box>
    </Box>
  );
} 