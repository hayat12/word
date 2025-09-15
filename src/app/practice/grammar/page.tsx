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
  Chip,
  Alert,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School,
  PlayArrow,
  CheckCircle,
  Cancel,
  MenuBook,
  MyLocation,
  Schedule,
  Info,
  TrendingUp
} from '@mui/icons-material';

interface GrammarRule {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  category: string;
  examples: string[];
}

interface GrammarPractice {
  id: string;
  grammarRule: GrammarRule;
  practiceCount: number;
  lastPracticed: string | null;
  attempts: Array<{
    id: string;
    userInput: string;
    isCorrect: boolean;
    createdAt: string;
  }>;
}

export default function GrammarPracticePage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
    errorMessage?: string;
  } | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<GrammarPractice[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [userLevel, setUserLevel] = useState<string>('A1');

  useEffect(() => {
    fetchUserLevel();
  }, []);

  useEffect(() => {
    if (userLevel) {
      fetchGrammarRules();
      fetchPracticeHistory();
    }
  }, [userLevel]);

  useEffect(() => {
    const count = userInput.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(count);
  }, [userInput]);

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

  const fetchGrammarRules = async () => {
    try {
      const response = await fetch('/api/grammar/rules');
      if (response.ok) {
        const rules = await response.json();
        // Filter rules based on user's current level
        const filteredRules = filterRulesByLevel(rules, userLevel);
        setGrammarRules(filteredRules);
      }
    } catch (error) {
      console.error('Error fetching grammar rules:', error);
    }
  };

  const filterRulesByLevel = (rules: GrammarRule[], currentLevel: string) => {
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentLevelIndex = levelOrder.indexOf(currentLevel);
    
    // Include rules up to and including the user's current level
    return rules.filter(rule => {
      const ruleLevelIndex = levelOrder.indexOf(rule.level);
      return ruleLevelIndex <= currentLevelIndex;
    });
  };

  const fetchPracticeHistory = async () => {
    try {
      const response = await fetch('/api/grammar/practice');
      if (response.ok) {
        const history = await response.json();
        setPracticeHistory(history);
      }
    } catch (error) {
      console.error('Error fetching practice history:', error);
    }
  };

  const handlePractice = async () => {
    if (!selectedRule || !userInput.trim()) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/grammar/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grammarRuleId: selectedRule.id,
          userInput: userInput.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFeedback({
          isCorrect: result.isCorrect,
          message: result.message,
          errorMessage: result.errorMessage
        });
        setUserInput('');
        fetchPracticeHistory(); // Refresh history
      } else {
        setFeedback({
          isCorrect: false,
          message: `Error: ${result.error}`,
        });
      }
    } catch (error) {
      setFeedback({
        isCorrect: false,
        message: 'Network error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'error';
      case 'A2': return 'warning';
      case 'B1': return 'info';
      case 'B2': return 'primary';
      case 'C1': return 'secondary';
      case 'C2': return 'success';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'verbs': return 'primary';
      case 'nouns': return 'secondary';
      case 'adjectives': return 'success';
      case 'pronouns': return 'warning';
      case 'prepositions': return 'info';
      case 'articles': return 'error';
      default: return 'default';
    }
  };

  if (!session) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
        <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Alert severity="info" sx={{ width: '100%' }}>
              Please sign in to access grammar practice.
            </Alert>
          </Box>
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
            Grammar Practice
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Practice German grammar rules with AI-powered feedback - Current Level: {userLevel}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Grammar Rules List */}
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
                  <MenuBook sx={{ color: '#0052cc', fontSize: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#172b4d',
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Grammar Rules (Level {userLevel} and below)
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Select a grammar rule to practice
                </Typography>
                
                {grammarRules.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {grammarRules.map((rule) => (
                      <Paper
                        key={rule.id}
                        sx={{
                          cursor: 'pointer',
                          border: selectedRule?.id === rule.id ? '2px solid #0052cc' : '1px solid #dfe1e6',
                          bgcolor: selectedRule?.id === rule.id ? '#f0f7ff' : 'transparent',
                          borderRadius: 0.5,
                          '&:hover': {
                            borderColor: selectedRule?.id === rule.id ? '#0052cc' : '#0052cc',
                            bgcolor: selectedRule?.id === rule.id ? '#f0f7ff' : '#f4f5f7'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setSelectedRule(rule)}
                      >
                        <Box sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#172b4d',
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}
                            >
                              {rule.title}
                            </Typography>
                            <Chip
                              label={`Level ${rule.level}`}
                              size="small"
                              color={getLevelColor(rule.level)}
                              sx={{ 
                                fontSize: '0.75rem',
                                borderRadius: 0.5
                              }}
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              mb: 1
                            }}
                          >
                            {rule.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              label={rule.category}
                              size="small"
                              color={getCategoryColor(rule.category)}
                              sx={{ 
                                fontSize: '0.75rem',
                                borderRadius: 0.5
                              }}
                            />
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <School sx={{ fontSize: 40, color: '#6b778c', mb: 2 }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      No grammar rules available for your current level ({userLevel})
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Practice Area */}
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
                  <MyLocation sx={{ color: '#0052cc', fontSize: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#172b4d',
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Practice Area
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {selectedRule ? `Practice: ${selectedRule.title}` : 'Select a grammar rule to start practicing'}
                </Typography>

                {selectedRule && (
                  <>
                    <Paper sx={{ 
                      bgcolor: '#f8f9fa', 
                      mb: 3,
                      border: '1px solid #dfe1e6',
                      borderRadius: 0.5
                    }}>
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 2, 
                            color: '#172b4d',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          Examples:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {selectedRule.examples.map((example, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemText
                                primary={`• ${example}`}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  color: 'text.secondary',
                                  sx: { 
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    lineHeight: 1.4
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Paper>

                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={isMobile ? 3 : 4}
                        label="Your sentence (max 5 words)"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Write your sentence here..."
                        variant="outlined"
                        disabled={isLoading}
                        inputProps={{ maxLength: 100 }}
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
                          Word count: {wordCount}/5
                        </Typography>
                        <Chip 
                          label={`Level ${selectedRule.level}`} 
                          color={getLevelColor(selectedRule.level)} 
                          size="small"
                          sx={{ borderRadius: 0.5 }}
                        />
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={handlePractice}
                      disabled={!userInput.trim() || wordCount > 5 || isLoading}
                      startIcon={isLoading ? <CircularProgress size={16} /> : <PlayArrow />}
                      sx={{
                        bgcolor: '#0052cc',
                        borderRadius: 0.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#0047b3' },
                        '&:disabled': { bgcolor: '#dfe1e6' }
                      }}
                    >
                      {isLoading ? 'Checking...' : 'Check Grammar'}
                    </Button>

                    {feedback && (
                      <Box sx={{ mt: 3 }}>
                        <Alert 
                          severity={feedback.isCorrect ? 'success' : 'error'}
                          icon={feedback.isCorrect ? <CheckCircle /> : <Cancel />}
                          sx={{ 
                            borderRadius: 0.5,
                            '& .MuiAlert-message': {
                              color: feedback.isCorrect ? '#2e7d32' : '#d32f2f'
                            }
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {feedback.message}
                          </Typography>
                          {feedback.errorMessage && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {feedback.errorMessage}
                            </Typography>
                          )}
                        </Alert>
                      </Box>
                    )}
                  </>
                )}

                {!selectedRule && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    color: '#6b778c'
                  }}>
                    <School sx={{ fontSize: 60, color: '#dfe1e6', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Select a grammar rule to start practicing
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose from the available rules on the left
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