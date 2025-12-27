// Writing Practice Page - Temporarily disabled
/*
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
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    fetchUserLevel();
  }, []);

  useEffect(() => {
    if (userLevel) {
      checkEligibility();
      fetchWritingHistory();
    }
  }, [userLevel]);

  useEffect(() => {
    const count = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(count);
  }, [content]);

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

  const checkEligibility = () => {
    const allowedLevels = ['B1', 'B2', 'C1', 'C2'];
    setIsEligible(allowedLevels.includes(userLevel));
  };

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

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/writing/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || 'Untitled',
          content: content.trim(),
          language: 'German'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFeedback(result.practice.feedback);
        
        // Refresh writing history
        fetchWritingHistory();
        
        // Clear form for next submission
        setTitle('');
        setContent('');
      } else {
        setFeedback(result.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting writing practice:', error);
      setFeedback('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" gutterBottom>
              Please sign in to access writing practice
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You need to be logged in to practice German writing.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!isEligible) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Warning sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Writing Practice Not Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Writing practice is only available for B1 level and above.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your current level: <strong>{userLevel}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Required level: <strong>B1</strong>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#172b4d',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.125rem' }
          }}
        >
          Writing Practice
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b778c',
            fontSize: { xs: '1rem', sm: '1.125rem' }
          }}
        >
          Practice German writing with AI-powered feedback. Write texts and get detailed analysis on grammar, vocabulary, and structure.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`Current Level: ${userLevel}`} 
            color="primary" 
            size="small"
            sx={{ 
              borderRadius: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          />
          <Chip 
            label={`${writingHistory.length} Texts Written`} 
            color="secondary" 
            size="small"
            sx={{ 
              borderRadius: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Writing Form */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: 0.5,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)'
          }}>
            <CardContent sx={{ p: 3 }}>
              {/* Title Input */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#172b4d',
                    mb: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Title (Optional)
                </Typography>
                <TextField
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your text..."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0.5,
                      fontSize: '1rem'
                    }
                  }}
                />
              </Box>

              {/* Content Input */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#172b4d',
                    mb: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Your Text
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your German text here... (maximum 250 words)"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0.5,
                      fontSize: '1rem'
                    }
                  }}
                  helperText={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#6b778c' }}>
                        Word count: {wordCount}/250
                      </Typography>
                      {wordCount > 250 && (
                        <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                          Maximum 250 words allowed
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isLoading || !content.trim() || wordCount > 250}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                  sx={{
                    borderRadius: 0.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 3,
                    py: 1.5,
                    bgcolor: '#0052cc',
                    '&:hover': {
                      bgcolor: '#0047b3'
                    },
                    '&:disabled': {
                      bgcolor: '#f4f5f7',
                      color: '#6b778c'
                    }
                  }}
                >
                  {isLoading ? 'Analyzing...' : 'Get Feedback'}
                </Button>
              </Box>

              {/* Feedback */}
              {feedback && (
                <Alert 
                  severity="info"
                  sx={{ 
                    borderRadius: 0.5,
                    '& .MuiAlert-message': {
                      width: '100%'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Edit sx={{ fontSize: 20, mt: 0.25 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.875rem',
                          lineHeight: 1.6
                        }}
                      >
                        {feedback}
                      </Typography>
                    </Box>
                  </Box>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Writing Tips */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            height: 'fit-content',
            position: 'sticky',
            top: 24,
            borderRadius: 0.5,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#172b4d',
                  mb: 2,
                  fontSize: '1.125rem'
                }}
              >
                Writing Tips
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#172b4d',
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    📝 Structure
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: '0.75rem',
                      lineHeight: 1.5
                    }}
                  >
                    Start with an introduction, develop your main points, and conclude with a summary.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#172b4d',
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    🔤 Grammar
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: '0.75rem',
                      lineHeight: 1.5
                    }}
                  >
                    Pay attention to verb conjugations, cases, and sentence structure appropriate for your level.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#172b4d',
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    📚 Vocabulary
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: '0.75rem',
                      lineHeight: 1.5
                    }}
                  >
                    Use vocabulary appropriate for your level. Don't be afraid to use simpler words correctly.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#172b4d',
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    ⏱️ Length
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: '0.75rem',
                      lineHeight: 1.5
                    }}
                  >
                    Aim for 50-250 words. Quality over quantity - focus on accuracy and clarity.
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Writing History */}
      {writingHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Card sx={{ 
            borderRadius: 0.5,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#172b4d',
                  mb: 2,
                  fontSize: '1.125rem'
                }}
              >
                Writing History
              </Typography>
              
              <Grid container spacing={2}>
                {writingHistory.slice(0, 6).map((practice) => (
                  <Grid item xs={12} sm={6} md={4} key={practice.id}>
                    <Paper 
                      sx={{ 
                        p: 2,
                        borderRadius: 0.5,
                        border: '1px solid #e9ecef',
                        bgcolor: '#f8f9fa',
                        height: '100%'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#172b4d',
                          mb: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        {practice.title || 'Untitled'}
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#6b778c',
                          fontSize: '0.75rem',
                          display: 'block',
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {practice.content.substring(0, 100)}...
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={practice.userLevel} 
                          size="small"
                          sx={{ 
                            fontSize: '0.75rem',
                            height: 20,
                            bgcolor: '#e3f2fd',
                            color: '#1976d2'
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6b778c',
                            fontSize: '0.75rem'
                          }}
                        >
                          {new Date(practice.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
*/