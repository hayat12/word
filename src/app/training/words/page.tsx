'use client';

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
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
  Paper,
  Fab,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Shuffle as ShuffleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  VolumeUp as VolumeIcon,
  Translate as TranslateIcon,
  School as SchoolIcon,
  Label as LabelIcon,
} from '@mui/icons-material';


interface Word {
  id: string;
  word: string;
  translation: string;
  example?: string;
  language: string;
  createdAt: string;
  level?: number;
  tags?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

interface TrainingStats {
  total: number;
  correct: number;
  incorrect: number;
  currentStreak: number;
  bestStreak: number;
}

export default function WordsTrainingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Utility function to update URL parameters
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    router.push(`/training/words?${params.toString()}`, { scroll: false });
  };
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('German');
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState<TrainingStats>({
    total: 0,
    correct: 0,
    incorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [practiceMode, setPracticeMode] = useState<string>('new-words');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [userLevel, setUserLevel] = useState<string>('A1');
  const [isLoading, setIsLoading] = useState(false);

  const languages = ['All', 'English', 'German', 'Spanish'];

  // Helper function to validate practice modes
  const isValidPracticeMode = (mode: string): boolean => {
    const validModes = ['new-words', 'mistakes', 'week', '3weeks', 'month', 'all-studied'];
    return validModes.includes(mode);
  };

  const practiceModes = [
    { value: 'new-words', label: 'New Words', description: 'Practice words you haven\'t studied yet' },
    { value: 'mistakes', label: 'Previous Mistakes', description: 'Review words you got wrong before' },
    { value: 'week', label: 'Last Week', description: 'Practice words studied in the last week' },
    { value: '3weeks', label: 'Last 3 Weeks', description: 'Practice words studied in the last 3 weeks' },
    { value: 'month', label: 'Last Month', description: 'Practice words studied in the last month' },
    { value: 'all-studied', label: 'All Studied Words', description: 'Random review of all studied words' }
  ];

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Fetch user level first
    fetchUserLevel();
  }, [session, status]);

  useEffect(() => {
    if (!userLevel || !session?.user?.id) return;

    // Check for URL parameters
    const mode = searchParams.get('mode');
    const wordIds = searchParams.get('words');
    const tagId = searchParams.get('tag');
    const language = searchParams.get('language');

    // Restore language selection from URL
    if (language && languages.includes(language)) {
      setSelectedLanguage(language);
    }

    if (mode && wordIds) {
      setPracticeMode(mode);
      if (tagId) {
        setSelectedTag(tagId);
      }
      // Fetch specific words by IDs
      fetchWordsByIds(wordIds.split(','));
    } else if (mode && tagId && mode.startsWith('tag-')) {
      // Handle tag-based practice
      setPracticeMode(mode);
      setSelectedTag(tagId);
      fetchWordsByTag(tagId);
    } else if (mode === 'grammar') {
      // Handle grammar practice
      setPracticeMode(mode);
      fetchGrammarWords();
    } else if (mode && isValidPracticeMode(mode)) {
      // Set practice mode from URL and fetch words
      setPracticeMode(mode);
      // Use the mode from URL for fetching
      fetchWordsByPracticeModeWithMode(mode);
    } else {
      // Default to new words practice mode
      setPracticeMode('new-words');
      fetchWordsByPracticeModeWithMode('new-words');
    }
  }, [userLevel, searchParams, session]);

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    
    // Update URL parameters
    updateUrlParams({ 
      language: newLanguage === 'All' ? null : newLanguage 
    });
  };

  useEffect(() => {
    // Filter words based on selected language
    const filtered =
      selectedLanguage === 'All'
        ? words
        : words.filter(word => word.language === selectedLanguage);
    setFilteredWords(filtered);
    setCurrentWordIndex(0);
    setShowTranslation(false);
    setUserAnswer('');
    setIsCorrect(null);
  }, [words, selectedLanguage]);

  const fetchUserLevel = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const userData = await response.json();
        setUserLevel(userData.userLevel || 'A1');
      }
    } catch (error) {
      console.error('Error fetching user level:', error);
      setUserLevel('A1'); // Default fallback
    }
  };

  const fetchWordsByPracticeMode = async () => {
    await fetchWordsByPracticeModeWithMode(practiceMode);
  };

  const fetchWordsByPracticeModeWithMode = async (mode: string) => {
    // Check if session is available
    if (!session?.user?.id) {
      setSnackbar({
        open: true,
        message: 'Please sign in to access words training',
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/words/practice-modes?mode=${mode}&userLevel=${userLevel}&limit=20`,
        {
          credentials: 'include', // Ensure cookies are sent
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to fetch words: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching words by practice mode:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load words',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeModeChange = (newMode: string) => {
    setPracticeMode(newMode);
    
    // Update URL parameters
    const updates: Record<string, string | null> = { mode: newMode };
    
    // Remove tag parameter if switching away from tag-based mode
    if (!newMode.startsWith('tag-')) {
      updates.tag = null;
    }
    
    updateUrlParams(updates);
    fetchWordsByPracticeMode();
  };

  const fetchWords = async () => {
    try {
      const response = await fetch(
        '/api/words/practice?limit=20&excludeRecentHours=24&category=travel'
      );
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        throw new Error('Failed to fetch words');
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load words',
        severity: 'error',
      });
    }
  };

  const fetchWordsByIds = async (wordIds: string[]) => {
    try {
      const response = await fetch('/api/words');
      if (response.ok) {
        const allWords = await response.json();
        const filteredWords = allWords.filter((word: Word) =>
          wordIds.includes(word.id)
        );
        setWords(filteredWords);
      } else {
        throw new Error('Failed to fetch words');
      }
    } catch (error) {
      console.error('Error fetching words by IDs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load selected words',
        severity: 'error',
      });
    }
  };

  const fetchWordsByTag = async (tagId: string) => {
    try {
      const response = await fetch(
        `/api/words/practice?tag=${tagId}&limit=20&excludeRecentHours=24`
      );
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        throw new Error('Failed to fetch words by tag');
      }
    } catch (error) {
      console.error('Error fetching words by tag:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load words by tag',
        severity: 'error',
      });
    }
  };

  const fetchGrammarWords = async () => {
    try {
      const response = await fetch(
        '/api/grammar/practice?limit=20&excludeRecentHours=24'
      );
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        throw new Error('Failed to fetch grammar words');
      }
    } catch (error) {
      console.error('Error fetching grammar words:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load grammar words',
        severity: 'error',
      });
    }
  };

  const startTraining = () => {
    if (filteredWords.length === 0) {
      setSnackbar({
        open: true,
        message: 'No words available for training',
        severity: 'error',
      });
      return;
    }
    setIsTraining(true);
    setCurrentWordIndex(0);
    setShowTranslation(false);
    setUserAnswer('');
    setIsCorrect(null);
    setStats({
      total: 0,
      correct: 0,
      incorrect: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
  };

  const stopTraining = () => {
    setIsTraining(false);
    setShowTranslation(false);
    setUserAnswer('');
    setIsCorrect(null);
  };

  const shuffleWords = () => {
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    setFilteredWords(shuffled);
    setCurrentWordIndex(0);
    setShowTranslation(false);
    setUserAnswer('');
    setIsCorrect(null);
  };

  const nextWord = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowTranslation(false);
      setUserAnswer('');
      setIsCorrect(null);
    } else {
      // Training completed
      setIsTraining(false);
      setSnackbar({
        open: true,
        message: `Training completed! Score: ${stats.correct}/${stats.total}`,
        severity: 'success',
      });
    }
  };

  const checkAnswer = () => {
    const currentWord = filteredWords[currentWordIndex];
    const isAnswerCorrect =
      userAnswer.toLowerCase().trim() ===
      currentWord.translation.toLowerCase().trim();

    setIsCorrect(isAnswerCorrect);

    const newStats = {
      total: stats.total + 1,
      correct: stats.correct + (isAnswerCorrect ? 1 : 0),
      incorrect: stats.incorrect + (isAnswerCorrect ? 0 : 1),
      currentStreak: isAnswerCorrect ? stats.currentStreak + 1 : 0,
      bestStreak: isAnswerCorrect
        ? Math.max(stats.bestStreak, stats.currentStreak + 1)
        : stats.bestStreak,
    };

    setStats(newStats);

    // Track progress in database
    trackWordProgress(currentWord.id, isAnswerCorrect, userAnswer);

    if (isAnswerCorrect) {
      setSnackbar({
        open: true,
        message: 'Correct! Well done!',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: `Incorrect. The answer is: ${currentWord.translation}`,
        severity: 'error',
      });
    }
  };

  const trackWordProgress = async (
    wordId: string,
    isCorrect: boolean,
    answer: string
  ) => {
    try {
      await fetch('/api/words/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId, isCorrect, answer, timeSpent: null }),
      });
    } catch (error) {
      console.error('Error tracking word progress:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isTraining && userAnswer.trim()) {
      checkAnswer();
    }
  };

  const getCurrentWord = () => {
    return filteredWords[currentWordIndex];
  };

  const getProgressPercentage = () => {
    return filteredWords.length > 0
      ? ((currentWordIndex + 1) / filteredWords.length) * 100
      : 0;
  };

  if (status === 'loading') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading training...</Typography>
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
              Words Training
            </Typography>
            {practiceMode && (
              <Chip
                label={practiceMode
                  .replace('-', ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
                size="small"
                color="primary"
                sx={{ ml: 'auto' }}
              />
            )}
          </Box>

          {/* Practice Mode Info */}
          {practiceMode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {practiceMode.startsWith('tag-') && (
                <LabelIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              )}
              <Typography variant="body2" sx={{ color: '#6b778c' }}>
                {practiceMode.startsWith('tag-')
                  ? `Practice by Tag: ${practiceMode.replace('tag-', '')}`
                  : `Practice Mode: ${practiceMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Welcome Screen */}
        {!isTraining && (
          <Box sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: '#172b4d', mb: 1 }}
              >
                Words Training
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#6b778c', mb: 2 }}
              >
                Choose your practice mode and test your knowledge.
              </Typography>
            </Box>

            {/* Practice Mode Selection */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid #dfe1e6' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 3 }}>
                  Choose Practice Mode
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#6b778c' }}>
                    Current Level:
                  </Typography>
                  <Chip label={userLevel} size="small" color="primary" sx={{ ml: 1 }} />
                </Box>
                
                <Grid container spacing={2}>
                  {practiceModes.map((mode) => (
                    <Grid item xs={12} sm={6} md={4} key={mode.value}>
                      <Card
                        onClick={() => handlePracticeModeChange(mode.value)}
                        sx={{
                          cursor: 'pointer',
                          border: practiceMode === mode.value ? '2px solid #1976d2' : '1px solid #dfe1e6',
                          bgcolor: practiceMode === mode.value ? '#f0f7ff' : 'white',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#1976d2',
                            bgcolor: '#f0f7ff',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#172b4d', mb: 1 }}>
                            {mode.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b778c', fontSize: '0.875rem' }}>
                            {mode.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Language Filter */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid #dfe1e6' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 2 }}>
                  Language Filter
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Language</InputLabel>
                  <Select
                    value={selectedLanguage}
                    label="Select Language"
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Start Training Section */}
            {filteredWords.length > 0 ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#172b4d', mb: 2 }}>
                  {filteredWords.length} words ready for practice
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={startTraining}
                  disabled={isLoading}
                  sx={{
                    bgcolor: '#1976d2',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.125rem',
                    '&:hover': {
                      bgcolor: '#1565c0',
                    },
                  }}
                >
                  {isLoading ? 'Loading...' : 'Start Training'}
                </Button>
              </Box>
            ) : (
              <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
                No words available for the selected practice mode. Try a different mode or add some words first.
              </Alert>
            )}
          </Box>
        )}

        {/* Training Interface */}
        {isTraining && filteredWords.length > 0 && (
          <>
            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2" sx={{ color: '#6b778c' }}>
                  Progress: {currentWordIndex + 1} / {filteredWords.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b778c' }}>
                  {Math.round(getProgressPercentage())}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#f4f5f7',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                  },
                }}
              />
            </Box>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={2}>
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #dfe1e6',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#172b4d' }}
                    >
                      {stats.total}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6b778c', fontWeight: 500 }}
                    >
                      Answered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #dfe1e6',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#4caf50' }}
                    >
                      {stats.correct}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6b778c', fontWeight: 500 }}
                    >
                      Correct
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #dfe1e6',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#f44336' }}
                    >
                      {stats.incorrect}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6b778c', fontWeight: 500 }}
                    >
                      Incorrect
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #dfe1e6',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#ff9800' }}
                    >
                      {stats.currentStreak}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6b778c', fontWeight: 500 }}
                    >
                      Current Streak
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #dfe1e6',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#9c27b0' }}
                    >
                      {stats.bestStreak}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6b778c', fontWeight: 500 }}
                    >
                      Best Streak
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #dfe1e6',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#172b4d' }}
                    >
                      {filteredWords.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#6b778c', fontWeight: 500 }}
                    >
                      Total Words
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Training Area */}
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                border: '1px solid #dfe1e6',
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: '#172b4d', mb: 3 }}
                >
                  {getCurrentWord()?.word}
                </Typography>

                {showTranslation && (
                  <Typography variant="h5" sx={{ color: '#4caf50', mb: 3 }}>
                    {getCurrentWord()?.translation}
                  </Typography>
                )}

                {getCurrentWord()?.example && (
                  <Typography
                    variant="body1"
                    sx={{ color: '#6b778c', mb: 3, fontStyle: 'italic' }}
                  >
                    "{getCurrentWord()?.example}"
                  </Typography>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <TextField
                    label="Your Answer"
                    variant="outlined"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isCorrect !== null}
                    sx={{ minWidth: 300 }}
                  />
                  <Button
                    variant="contained"
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim() || isCorrect !== null}
                    sx={{
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#388e3c' },
                    }}
                  >
                    <CheckIcon />
                  </Button>
                </Box>

                {isCorrect !== null && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: isCorrect ? '#4caf50' : '#f44336',
                        mb: 2,
                      }}
                    >
                      {isCorrect ? 'Correct!' : 'Incorrect!'}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={nextWord}
                      sx={{
                        bgcolor: '#1976d2',
                        '&:hover': { bgcolor: '#1565c0' },
                      }}
                    >
                      Next Word
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Controls */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ShuffleIcon />}
                onClick={shuffleWords}
                sx={{ borderColor: '#dfe1e6', color: '#172b4d' }}
              >
                Shuffle
              </Button>
              <Button
                variant="outlined"
                startIcon={<TranslateIcon />}
                onClick={() => setShowTranslation(!showTranslation)}
                sx={{ borderColor: '#dfe1e6', color: '#172b4d' }}
              >
                {showTranslation ? 'Hide' : 'Show'} Translation
              </Button>
              <Button
                variant="outlined"
                startIcon={<PauseIcon />}
                onClick={stopTraining}
                sx={{ borderColor: '#dfe1e6', color: '#172b4d' }}
              >
                Stop Training
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
