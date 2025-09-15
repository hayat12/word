'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Box,
  Grid,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  Edit,
  Send,
  History,
  School,
  Warning
} from '@mui/icons-material';

interface WritingPractice {
  id: string;
  title: string;
  content: string;
  language: string;
  userLevel: string;
  aiFeedback: string | null;
  createdAt: string;
}

export default function WritingPracticePage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [writingHistory, setWritingHistory] = useState<WritingPractice[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [userLevel, setUserLevel] = useState<string>('A1');

  useEffect(() => {
    fetchWritingHistory();
    fetchUserLevel();
  }, []);

  useEffect(() => {
    const count = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(count);
  }, [content]);

  const fetchWritingHistory = async () => {
    try {
      const response = await fetch('/api/writing/practice');
      if (response.ok) {
        const history = await response.json();
        setWritingHistory(history);
      }
    } catch (error) {
      console.error('Error fetching writing history:', error);
    }
  };

  const fetchUserLevel = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const userData = await response.json();
        setUserLevel(userData.userLevel || 'A1');
      }
    } catch (error) {
      console.error('Error fetching user level:', error);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/writing/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content: content.trim(),
          language: 'German'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFeedback(result.writingPractice.aiFeedback);
        setTitle('');
        setContent('');
        fetchWritingHistory(); // Refresh history
      } else {
        setFeedback(`Error: ${result.error}`);
      }
    } catch (error) {
      setFeedback('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isB1OrAbove = ['B1', 'B2', 'C1', 'C2'].includes(userLevel);

  if (!session) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
        <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Alert severity="info" sx={{ width: '100%' }}>
              Please sign in to access writing practice.
            </Alert>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!isB1OrAbove) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 700, 
                color: '#172b4d',
                mb: 1
              }}
            >
              Writing Practice
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Practice German writing with AI-powered feedback
            </Typography>
          </Box>

          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 0.5,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
            '&:hover': {
              boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Alert severity="warning" icon={<Warning />}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Writing practice is only available for B1 level and above
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="body2">
                    Your current level:
                  </Typography>
                  <Chip label={userLevel} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="body2">
                    Required level:
                  </Typography>
                  <Chip label="B1" color="success" size="small" />
                </Box>
              </Alert>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700, 
              color: '#172b4d',
              mb: 1
            }}
          >
            Writing Practice
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Practice German writing with AI-powered feedback (B1+ level)
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Writing Area */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              '&:hover': {
                boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Edit sx={{ color: '#0052cc', fontSize: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#172b4d',
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Write Your Text
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your writing..."
                    variant="outlined"
                    size="small"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0.5,
                      }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={isMobile ? 6 : 8}
                    label="Your text (max 250 words)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your German text here..."
                    variant="outlined"
                    disabled={isLoading}
                    inputProps={{ maxLength: 2000 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0.5,
                      }
                    }}
                  />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 1,
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Word count: {wordCount}/250
                    </Typography>
                    <Chip 
                      label={`Level ${userLevel}`} 
                      color="primary" 
                      size="small"
                      sx={{ borderRadius: 0.5 }}
                    />
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!content.trim() || wordCount > 250 || isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} /> : <Send />}
                  sx={{
                    bgcolor: '#0052cc',
                    borderRadius: 0.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#0047b3' },
                    '&:disabled': { bgcolor: '#dfe1e6' }
                  }}
                >
                  {isLoading ? 'Analyzing...' : 'Submit for Feedback'}
                </Button>

                {feedback && (
                  <Box sx={{ mt: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 2, 
                        color: '#172b4d',
                        fontSize: { xs: '1rem', sm: '1.125rem' }
                      }}
                    >
                      AI Feedback
                    </Typography>
                    <Paper sx={{ 
                      bgcolor: '#f8f9fa',
                      border: '1px solid #dfe1e6',
                      borderRadius: 0.5
                    }}>
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography 
                          variant="body2" 
                          component="div"
                          sx={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6,
                            color: '#172b4d'
                          }}
                        >
                          {feedback}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Writing History */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              '&:hover': {
                boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <History sx={{ color: '#0052cc', fontSize: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#172b4d',
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Writing History
                  </Typography>
                </Box>
                
                {writingHistory.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {writingHistory.slice(0, isMobile ? 3 : 5).map((practice) => (
                      <Paper 
                        key={practice.id} 
                        sx={{ 
                          bgcolor: '#f8f9fa',
                          border: '1px solid #dfe1e6',
                          borderRadius: 0.5,
                          '&:hover': {
                            bgcolor: '#f1f3f4',
                          }
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#172b4d', 
                              mb: 1,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {practice.title || 'Untitled'}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 1,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {practice.content.length > 100 
                              ? practice.content.substring(0, 100) + '...' 
                              : practice.content
                            }
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1
                          }}>
                            <Chip 
                              label={`Level ${practice.userLevel}`} 
                              size="small" 
                              color="primary"
                              sx={{ borderRadius: 0.5 }}
                            />
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {new Date(practice.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: '#6b778c'
                  }}>
                    <School sx={{ fontSize: 40, color: '#dfe1e6', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No writing practices yet. Start writing to see your history here!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 