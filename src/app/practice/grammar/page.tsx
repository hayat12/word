// Grammar Practice Page - Temporarily disabled

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
  userId: string;
  grammarRuleId: string;
  createdAt: string;
  lastPracticed: string | null;
  practiceCount: number;
  attempts: Array<{
    id: string;
    userInput: string;
    isCorrect: boolean;
    aiFeedback: string | null;
    errorMessage: string | null;
    createdAt: string;
  }>;
}

export default function GrammarPracticePage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);
  const [isRulesLoading, setIsRulesLoading] = useState<boolean>(true);
  const [rulesError, setRulesError] = useState<string | null>(null);
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
      setIsRulesLoading(true);
      setRulesError(null);
      const response = await fetch('/api/grammar/rules');
      if (response.ok) {
        const rules = await response.json();
        // Filter rules based on user's current level
        const filteredRules = filterRulesByLevel(rules, userLevel);
        setGrammarRules(filteredRules);
      } else {
        const result = await response.json().catch(() => ({}));
        setRulesError(result.error || 'Unable to load grammar rules.');
        setGrammarRules([]);
      }
    } catch (error) {
      console.error('Error fetching grammar rules:', error);
      setRulesError('Network error while loading grammar rules.');
      setGrammarRules([]);
    } finally {
      setIsRulesLoading(false);
    }
  };

  const normalizeRuleLevel = (level: string | number): string => {
    // Map numeric levels from the DB to CEFR-style levels
    const numeric = Number(level);
    if (!Number.isNaN(numeric)) {
      switch (numeric) {
        case 1:
          return 'A1';
        case 2:
          return 'A2';
        case 3:
          return 'B1';
        case 4:
          return 'B2';
        case 5:
          return 'C1';
        case 6:
          return 'C2';
        default:
          return 'A1';
      }
    }
    return level as string;
  };

  const filterRulesByLevel = (rules: GrammarRule[], currentLevel: string): GrammarRule[] => {
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    
    return rules.filter(rule => {
      const normalizedLevel = normalizeRuleLevel(rule.level);
      const ruleIndex = levelOrder.indexOf(normalizedLevel);
      return ruleIndex <= currentIndex;
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

  const handleRuleSelect = (rule: GrammarRule) => {
    setSelectedRule(rule);
    setUserInput('');
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!selectedRule || !userInput.trim()) {
      return;
    }

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
          userInput: userInput.trim()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFeedback({
          isCorrect: result.attempt.isCorrect,
          message: result.attempt.feedback,
          errorMessage: result.attempt.suggestions
        });
        
        // Refresh practice history
        fetchPracticeHistory();
        
        // Clear input for next attempt
        setUserInput('');
      } else {
        setFeedback({
          isCorrect: false,
          message: result.error || 'An error occurred',
          errorMessage: 'Please try again'
        });
      }
    } catch (error) {
      console.error('Error submitting practice:', error);
      setFeedback({
        isCorrect: false,
        message: 'Network error occurred',
        errorMessage: 'Please check your connection and try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      A1: '#d32f2f',
      A2: '#f57c00',
      B1: '#1976d2',
      B2: '#388e3c',
      C1: '#7b1fa2',
      C2: '#2e7d32'
    };
    return colors[level as keyof typeof colors] || '#6b778c';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'articles':
        return <MenuBook />;
      case 'verb conjugation':
        return <PlayArrow />;
      case 'cases':
        return <MyLocation />;
      case 'adjectives':
        return <TrendingUp />;
      case 'modal verbs':
        return <School />;
      case 'past tense':
        return <Schedule />;
      default:
        return <School />;
    }
  };

  if (!session) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" gutterBottom>
              Please sign in to access grammar practice
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You need to be logged in to practice German grammar rules.
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
          Grammar Practice
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b778c',
            fontSize: { xs: '1rem', sm: '1.125rem' }
          }}
        >
          Practice German grammar rules with AI-powered feedback. Choose a rule and create sentences to test your understanding.
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
            label={`${grammarRules.length} Rules Available`} 
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
        {/* Grammar Rules List */}
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
                Available Rules
              </Typography>
              
              {isRulesLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 2, color: '#6b778c' }}>
                    Loading grammar rules...
                  </Typography>
                </Box>
              ) : rulesError ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#d32f2f' }}>
                    {rulesError}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b778c' }}>
                    Please try again later or contact the administrator.
                  </Typography>
                </Box>
              ) : grammarRules.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {grammarRules.map((rule, index) => (
                    <Box key={rule.id}>
                      <ListItem
                        onClick={() => handleRuleSelect(rule)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 0.5,
                          mb: 1,
                          bgcolor: selectedRule?.id === rule.id ? '#f0f7ff' : 'transparent',
                          border: selectedRule?.id === rule.id ? '1px solid #0052cc' : '1px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: selectedRule?.id === rule.id ? '#e6f3ff' : '#f4f5f7',
                            borderColor: selectedRule?.id === rule.id ? '#0052cc' : '#dfe1e6'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                          <Box sx={{ color: getLevelColor(rule.level) }}>
                            {getCategoryIcon(rule.category)}
                          </Box>
                        </Box>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: selectedRule?.id === rule.id ? 600 : 500,
                                color: selectedRule?.id === rule.id ? '#0052cc' : '#172b4d',
                                fontSize: '0.875rem'
                              }}
                            >
                              {rule.title}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Chip 
                                label={rule.level} 
                                size="small"
                                sx={{ 
                                  height: 20,
                                  fontSize: '0.75rem',
                                  bgcolor: getLevelColor(rule.level),
                                  color: 'white',
                                  fontWeight: 600,
                                  mr: 1
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#6b778c',
                                  fontSize: '0.75rem'
                                }}
                              >
                                {rule.category}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < grammarRules.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#6b778c' }}>
                    No grammar rules available yet for your level.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Practice Area */}
        <Grid item xs={12} lg={8}>
          {selectedRule ? (
            <Card sx={{ 
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)'
            }}>
              <CardContent sx={{ p: 3 }}>
                {/* Selected Rule Info */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ color: getLevelColor(selectedRule.level) }}>
                      {getCategoryIcon(selectedRule.category)}
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#172b4d',
                        fontSize: '1.125rem'
                      }}
                    >
                      {selectedRule.title}
                    </Typography>
                    <Chip 
                      label={selectedRule.level} 
                      size="small"
                      sx={{ 
                        height: 24,
                        fontSize: '0.75rem',
                        bgcolor: getLevelColor(selectedRule.level),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#172b4d',
                      mb: 2,
                      fontSize: '1rem'
                    }}
                  >
                    {selectedRule.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#172b4d',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Examples:
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {selectedRule.examples.map((example, index) => (
                        <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#6b778c',
                                  fontSize: '0.875rem',
                                  fontStyle: 'italic'
                                }}
                              >
                                {example}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>

                {/* Practice Input */}
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
                    Create a sentence using this grammar rule:
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your sentence here (maximum 5 words)..."
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
                          Word count: {wordCount}/5
                        </Typography>
                        {wordCount > 5 && (
                          <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                            Maximum 5 words allowed
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
                    disabled={isLoading || !userInput.trim() || wordCount > 5}
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
                    {isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Checking...
                      </Box>
                    ) : (
                      'Check My Answer'
                    )}
                  </Button>
                </Box>

                {/* Feedback */}
                {feedback && (
                  <Alert 
                    severity={feedback.isCorrect ? 'success' : 'error'}
                    sx={{ 
                      borderRadius: 0.5,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      {feedback.isCorrect ? (
                        <CheckCircle sx={{ fontSize: 20, mt: 0.25 }} />
                      ) : (
                        <Cancel sx={{ fontSize: 20, mt: 0.25 }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            mb: feedback.errorMessage ? 1 : 0
                          }}
                        >
                          {feedback.message}
                        </Typography>
                        {feedback.errorMessage && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: feedback.isCorrect ? 'inherit' : '#d32f2f',
                              fontSize: '0.875rem'
                            }}
                          >
                            {feedback.errorMessage}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ 
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <School sx={{ fontSize: 60, color: '#6b778c', mb: 2 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#172b4d',
                    mb: 1
                  }}
                >
                  Select a Grammar Rule
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c',
                    maxWidth: 400,
                    mx: 'auto'
                  }}
                >
                  Choose a grammar rule from the list on the left to start practicing. 
                  Create sentences and get instant AI feedback on your German grammar.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Practice History */}
      {practiceHistory.length > 0 && (
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
                Practice History
              </Typography>
              
              <Grid container spacing={2}>
                {practiceHistory.slice(0, 6).map((practice) => (
                  <Grid item xs={12} sm={6} md={4} key={practice.id}>
                    <Paper 
                      sx={{ 
                        p: 2,
                        borderRadius: 0.5,
                        border: '1px solid #e9ecef',
                        bgcolor: '#f8f9fa'
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
                        {practice.attempts.length > 0 ? practice.attempts[0].userInput : 'No attempts yet'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`${practice.practiceCount} attempts`} 
                          size="small"
                          sx={{ 
                            fontSize: '0.75rem',
                            height: 20,
                            bgcolor: '#e3f2fd',
                            color: '#1976d2'
                          }}
                        />
                        {practice.lastPracticed && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6b778c',
                              fontSize: '0.75rem'
                            }}
                          >
                            {new Date(practice.lastPracticed).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      {practice.attempts.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {practice.attempts[practice.attempts.length - 1].isCorrect ? (
                            <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                          ) : (
                            <Cancel sx={{ fontSize: 16, color: '#d32f2f' }} />
                          )}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: practice.attempts[practice.attempts.length - 1].isCorrect ? '#4caf50' : '#d32f2f',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            {practice.attempts[practice.attempts.length - 1].isCorrect ? 'Correct' : 'Incorrect'}
                          </Typography>
                        </Box>
                      )}
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
