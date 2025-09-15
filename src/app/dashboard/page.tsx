"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Badge,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  LocalFireDepartment,
  Schedule,
  Tag,
  TrendingUp,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  MenuBook,
  Edit
} from "@mui/icons-material";
import Link from "next/link";
import { useState, useEffect } from "react";

interface DailyGoalData {
  dailyGoal: number;
  currentProgress: number;
  progressPercentage: number;
  streakDays: number;
  lastPracticeDate: string | null;
  isCompleted: boolean;
}

interface DueReviewData {
  id: string;
  word: string;
  translation: string;
  level: number;
  tags: Array<{ id: string; name: string; color: string }>;
}

interface TagUsageData {
  id: string;
  name: string;
  color: string;
  totalWords: number;
  studiedWords: number;
  accuracy: number;
  usagePercentage: number;
}

interface StatsData {
  totalStudied: number;
  correctAnswers: number;
  accuracy: number;
  uniqueWordsStudied: number;
  totalWords: number;
  currentStreak: number;
  studyDates: string[];
  languageBreakdown: Array<{ language: string; _count: { id: number } }>;
  recentProgress: Array<{
    id: string;
    wordId: string;
    userId: string;
    studiedAt: string;
    isCorrect: boolean;
    answer?: string;
    timeSpent?: number;
    word: {
      word: string;
      translation: string;
      language: string;
    };
  }>;
}

interface LevelCompletion {
  id: string;
  level: string;
  completedAt: string;
  score?: number;
}

interface PracticeMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  endpoint: string;
  isCompleted?: boolean;
  completedAt?: string;
  isCurrentLevel?: boolean;
}

interface LevelProgress {
  level: string;
  grammar: {
    total: number;
    practiced: number;
    progress: number;
    rules: Array<{
      id: string;
      title: string;
      practiceCount: number;
      lastPracticed: string | null;
    }>;
  };
  vocabulary: {
    total: number;
    progress: number;
    target: number;
  };
  writing: {
    total: number;
    target: number;
    progress: number;
  };
  dailyGoal: {
    current: number;
    target: number;
    progress: number;
    isCompleted: boolean;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [dailyGoalData, setDailyGoalData] = useState<DailyGoalData | null>(null);
  const [dueReviews, setDueReviews] = useState<DueReviewData[]>([]);
  const [tagUsage, setTagUsage] = useState<TagUsageData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [completedLevels, setCompletedLevels] = useState<LevelCompletion[]>([]);
  const [userLevel, setUserLevel] = useState<string>('A1');
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);

  const handlePracticeMode = async (mode: PracticeMode) => {
    if (mode.id === 'grammar') {
      router.push('/practice/grammar');
    } else if (mode.id === 'writing') {
      router.push('/practice/writing');
    } else {
      router.push(`/training/words?mode=${mode.id}`);
    }
  };

  const getLevelInfo = (level: string) => {
    const levelInfo = {
      A1: { title: 'A1 - Beginner', description: 'Basic vocabulary and grammar', color: '#d32f2f', icon: <SchoolIcon /> },
      A2: { title: 'A2 - Elementary', description: 'Everyday expressions and phrases', color: '#f57c00', icon: <TrendingUpIcon /> },
      B1: { title: 'B1 - Intermediate', description: 'Intermediate language skills', color: '#1976d2', icon: <LanguageIcon /> },
      B2: { title: 'B2 - Upper Intermediate', description: 'Advanced intermediate skills', color: '#388e3c', icon: <StarIcon /> },
      C1: { title: 'C1 - Advanced', description: 'Advanced language proficiency', color: '#7b1fa2', icon: <CheckCircleIcon /> },
      C2: { title: 'C2 - Mastery', description: 'Native-like proficiency', color: '#2e7d32', icon: <CheckCircleIcon /> }
    };
    return levelInfo[level as keyof typeof levelInfo] || levelInfo.A1;
  };

  const generateAllLevels = (completedLevels: LevelCompletion[], currentLevel: string): PracticeMode[] => {
    const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const completedLevelSet = new Set(completedLevels.map(cl => cl.level));
    
    return allLevels.map(level => {
      const isCompleted = completedLevelSet.has(level);
      const isCurrentLevel = level === currentLevel && !isCompleted;
      const levelInfo = getLevelInfo(level);
      const completedLevel = completedLevels.find(cl => cl.level === level);
      
      return {
        id: `level-${level.toLowerCase()}`,
        title: levelInfo.title,
        description: isCompleted 
          ? `Completed on ${new Date(completedLevel!.completedAt).toLocaleDateString()}`
          : isCurrentLevel 
            ? 'Current Level - In Progress'
            : levelInfo.description,
        icon: isCompleted ? <CheckCircleIcon /> : isCurrentLevel ? <SchoolIcon /> : levelInfo.icon,
        color: isCompleted ? '#4caf50' : isCurrentLevel ? '#1976d2' : levelInfo.color,
        endpoint: `/api/words/by-level/${level}`,
        isCompleted,
        isCurrentLevel,
        completedAt: completedLevel?.completedAt
      };
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (session?.user?.id) {
        try {
          const [dailyGoalRes, dueReviewsRes, tagUsageRes, statsRes, levelCompletionsRes, userPreferencesRes, levelProgressRes] = await Promise.all([
            fetch('/api/user/daily-goal'),
            fetch('/api/words/due-review'),
            fetch('/api/tags/usage'),
            fetch('/api/words/progress'),
            fetch('/api/user/level-completions'),
            fetch('/api/user/preferences'),
            fetch(`/api/user/level-progress?level=${userLevel}`)
          ]);

          if (dailyGoalRes.ok) {
            const dailyGoal = await dailyGoalRes.json();
            setDailyGoalData(dailyGoal);
          }

          if (dueReviewsRes.ok) {
            const dueReviewsData = await dueReviewsRes.json();
            setDueReviews(dueReviewsData.slice(0, 5));
          }

          if (tagUsageRes.ok) {
            const tagUsageData = await tagUsageRes.json();
            setTagUsage(tagUsageData.topTags || []);
          }

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }

          if (levelCompletionsRes.ok) {
            const levelCompletionsData = await levelCompletionsRes.json();
            setCompletedLevels(levelCompletionsData);
          }

          if (userPreferencesRes.ok) {
            const userData = await userPreferencesRes.json();
            setUserLevel(userData.userLevel || 'A1');
          }

          if (levelProgressRes.ok) {
            const levelProgressData = await levelProgressRes.json();
            setLevelProgress(levelProgressData);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [session, userLevel]);

  if (status === "loading" || loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return (
      <Container maxWidth="sm" sx={{ mt: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const allLevels = generateAllLevels(completedLevels, userLevel);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        
        {/* Welcome Section */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#172b4d',
              mb: 1
            }}
          >
            Welcome back, {session.user.name}!
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#6b778c',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Continue your language learning journey
            </Typography>
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
          </Box>
        </Box>

        {/* Daily Goal Progress and Streak Counter */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
          mb: 2 
        }}>
          {/* Daily Goal Progress */}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp sx={{ color: '#0052cc', fontSize: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#172b4d',
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Daily Goal
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c',
                    fontWeight: 500
                  }}
                >
                  {dailyGoalData?.currentProgress || 0}/{dailyGoalData?.dailyGoal || 10}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={dailyGoalData?.progressPercentage || 0}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#f4f5f7',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: dailyGoalData?.isCompleted 
                        ? 'linear-gradient(90deg, #4caf50, #66bb6a)'
                        : 'linear-gradient(90deg, #0052cc, #0065ff)',
                    }
                  }}
                />
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6b778c',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {dailyGoalData?.isCompleted 
                  ? 'Daily goal completed! 🎉' 
                  : `${dailyGoalData?.dailyGoal || 10 - (dailyGoalData?.currentProgress || 0)} words remaining`
                }
              </Typography>
            </CardContent>
          </Card>

          {/* Streak Counter */}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalFireDepartment sx={{ color: '#ff6b35', fontSize: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#172b4d',
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Streak
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#ff6b35',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  {dailyGoalData?.streakDays || 0}
                </Typography>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6b778c',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {dailyGoalData?.streakDays || 0} day{dailyGoalData?.streakDays !== 1 ? 's' : ''} in a row
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Current Level Progress Section */}
        {userLevel && allLevels.some(level => level.isCurrentLevel) && (
          <Box sx={{ mb: 3 }}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '2px solid #1976d2',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              '&:hover': {
                boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <SchoolIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#172b4d',
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Complete Level {userLevel}
                  </Typography>
                  <Chip 
                    label="Current Level" 
                    color="primary" 
                    size="small"
                    sx={{ 
                      borderRadius: 0.5,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      mb: 2
                    }}
                  >
                    To complete Level {userLevel}, you need to:
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Grammar Practice Requirement */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: '#f8f9fa',
                      borderRadius: 0.5,
                      border: '1px solid #e9ecef'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <MenuBook sx={{ color: '#1976d2', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#172b4d',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            Practice Grammar Rules
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6b778c',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            Complete grammar exercises for Level {userLevel}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={levelProgress?.grammar?.progress || 0} 
                              sx={{ 
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#e9ecef',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: '#1976d2'
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#6b778c',
                                fontSize: '0.75rem',
                                mt: 0.5,
                                display: 'block'
                              }}
                            >
                              {levelProgress?.grammar?.practiced || 0} of {levelProgress?.grammar?.total || 0} grammar rules practiced
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push('/practice/grammar')}
                        sx={{ 
                          borderRadius: 0.5,
                          textTransform: 'none',
                          fontWeight: 500,
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          ml: 2,
                          '&:hover': {
                            borderColor: '#1565c0',
                            color: '#1565c0',
                            bgcolor: '#f0f7ff'
                          }
                        }}
                      >
                        Practice Now
                      </Button>
                    </Box>

                    {/* Vocabulary Practice Requirement */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: '#f8f9fa',
                      borderRadius: 0.5,
                      border: '1px solid #e9ecef'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <SchoolIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#172b4d',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            Learn Vocabulary
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6b778c',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            Study and practice Level {userLevel} vocabulary
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={levelProgress?.vocabulary?.progress || 0} 
                              sx={{ 
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#e9ecef',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: '#1976d2'
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#6b778c',
                                fontSize: '0.75rem',
                                mt: 0.5,
                                display: 'block'
                              }}
                            >
                              {levelProgress?.vocabulary?.total || 0} words studied (target: {levelProgress?.vocabulary?.target || 50})
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push('/training/words')}
                        sx={{ 
                          borderRadius: 0.5,
                          textTransform: 'none',
                          fontWeight: 500,
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          ml: 2,
                          '&:hover': {
                            borderColor: '#1565c0',
                            color: '#1565c0',
                            bgcolor: '#f0f7ff'
                          }
                        }}
                      >
                        Study Now
                      </Button>
                    </Box>

                    {/* Writing Practice Requirement (for B1+) */}
                    {['B1', 'B2', 'C1', 'C2'].includes(userLevel) && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: '#f8f9fa',
                        borderRadius: 0.5,
                        border: '1px solid #e9ecef'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Edit sx={{ color: '#1976d2', fontSize: 20 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600,
                                color: '#172b4d',
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}
                            >
                              Practice Writing
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#6b778c',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              Write and get feedback on Level {userLevel} texts
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={levelProgress?.writing?.progress || 0} 
                                sx={{ 
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#e9ecef',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    bgcolor: '#1976d2'
                                  }
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#6b778c',
                                  fontSize: '0.75rem',
                                  mt: 0.5,
                                  display: 'block'
                                }}
                              >
                                {levelProgress?.writing?.total || 0} of {levelProgress?.writing?.target || 10} writing exercises completed
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => router.push('/practice/writing')}
                          sx={{ 
                            borderRadius: 0.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            ml: 2,
                            '&:hover': {
                              borderColor: '#1565c0',
                              color: '#1565c0',
                              bgcolor: '#f0f7ff'
                            }
                          }}
                        >
                          Write Now
                        </Button>
                      </Box>
                    )}

                    {/* Daily Goal Requirement */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: '#f8f9fa',
                      borderRadius: 0.5,
                      border: '1px solid #e9ecef'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <TrendingUp sx={{ color: '#1976d2', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#172b4d',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            Meet Daily Goals
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6b778c',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            Complete {levelProgress?.dailyGoal?.target || 10} words daily for consistent progress
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={levelProgress?.dailyGoal?.progress || 0} 
                              sx={{ 
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#e9ecef',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: levelProgress?.dailyGoal?.isCompleted ? '#4caf50' : '#1976d2'
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#6b778c',
                                fontSize: '0.75rem',
                                mt: 0.5,
                                display: 'block'
                              }}
                            >
                              {levelProgress?.dailyGoal?.current || 0} of {levelProgress?.dailyGoal?.target || 10} words today
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip 
                        label={levelProgress?.dailyGoal?.isCompleted ? "Completed Today" : "In Progress"} 
                        color={levelProgress?.dailyGoal?.isCompleted ? "success" : "primary"}
                        size="small"
                        sx={{ 
                          borderRadius: 0.5,
                          fontSize: '0.75rem',
                          ml: 2
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f0f7ff', 
                  borderRadius: 0.5,
                  border: '1px solid #bbdefb'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#1976d2',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 500
                    }}
                  >
                    💡 Tip: Focus on completing these activities regularly to advance to the next level!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Levels Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                color: '#172b4d'
              }}
            >
              Your Learning Progress
            </Typography>
            {(!session.user.subscription || session.user.subscription?.plan === 'FREE') && (
              <Chip 
                label="Free Plan - Limited Access" 
                color="warning" 
                size="small"
                sx={{ 
                  fontSize: '0.75rem',
                  bgcolor: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffeaa7'
                }}
              />
            )}
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 3, 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              color: '#6b778c'
            }}
          >
            Completed levels and current progress. Future levels will unlock as you advance.
          </Typography>
          
          {allLevels.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(2, 1fr)', 
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(3, 1fr)'
              },
              gap: { xs: 1.5, sm: 2, md: 2 }
            }}>
              {allLevels.map((mode) => {
                const isFreeUser = !session.user.subscription || session.user.subscription?.plan === 'FREE';
                const isRestricted = isFreeUser && !mode.isCompleted && !mode.isCurrentLevel && !['level-a1', 'level-a2'].includes(mode.id);
                const isFutureLevel = !mode.isCompleted && !mode.isCurrentLevel;
                
                return (
                  <Card 
                    key={mode.id}
                    onClick={isRestricted || isFutureLevel ? undefined : () => handlePracticeMode(mode)}
                    sx={{ 
                      borderRadius: 0.5,
                      bgcolor: isFutureLevel ? '#f8f9fa' : 'white',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: { xs: '160px', sm: '180px', md: '200px' },
                      border: mode.isCurrentLevel ? '2px solid #1976d2' : '1px solid #dfe1e6',
                      boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
                      cursor: isRestricted || isFutureLevel ? 'default' : 'pointer',
                      opacity: isFutureLevel ? 0.6 : 1,
                      '&:hover': {
                        transform: isRestricted || isFutureLevel ? 'none' : 'translateY(-2px)',
                        boxShadow: isRestricted || isFutureLevel ? '0 1px 3px rgba(9, 30, 66, 0.13)' : '0 4px 12px rgba(9, 30, 66, 0.15)',
                        borderColor: isRestricted || isFutureLevel ? '#dfe1e6' : mode.isCurrentLevel ? '#1976d2' : '#0052cc',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(90deg, ${mode.color}, ${mode.color}88)`,
                        zIndex: 1,
                      }
                    }}
                  >
                    {(isRestricted || isFutureLevel) && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: isFutureLevel ? 'rgba(248,249,250,0.8)' : 'rgba(255,255,255,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}>
                        {isFutureLevel ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <LockIcon sx={{ fontSize: 40, color: '#6b778c', mb: 1 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6b778c',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              Not Available Yet
                            </Typography>
                          </Box>
                        ) : (
                          <LockIcon sx={{ fontSize: 40, color: '#6b778c' }} />
                        )}
                      </Box>
                    )}
                    
                    <CardContent sx={{ 
                      p: { xs: 2, sm: 3 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: isFutureLevel ? '#6b778c' : mode.color
                          }}>
                            {mode.icon}
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                color: isFutureLevel ? '#6b778c' : '#172b4d',
                                fontSize: { xs: '1rem', sm: '1.125rem' }
                              }}
                            >
                              {mode.title}
                            </Typography>
                          </Box>
                          {mode.isCompleted && <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />}
                          {mode.isCurrentLevel && <SchoolIcon sx={{ color: '#1976d2', fontSize: 20 }} />}
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isFutureLevel ? '#6b778c' : '#6b778c',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            mb: 2
                          }}
                        >
                          {mode.description}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {mode.isCompleted ? (
                          <Chip 
                            label="Completed" 
                            color="success" 
                            size="small"
                            sx={{ 
                              borderRadius: 0.5,
                              fontSize: '0.75rem'
                            }}
                          />
                        ) : mode.isCurrentLevel ? (
                          <Chip 
                            label="Current Level" 
                            color="primary" 
                            size="small"
                            sx={{ 
                              borderRadius: 0.5,
                              fontSize: '0.75rem'
                            }}
                          />
                        ) : (
                          <Chip 
                            label="Not Available" 
                            color="default" 
                            size="small"
                            sx={{ 
                              borderRadius: 0.5,
                              fontSize: '0.75rem',
                              bgcolor: '#f4f5f7',
                              color: '#6b778c'
                            }}
                          />
                        )}
                        
                        {mode.completedAt && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6b778c',
                              fontSize: '0.75rem'
                            }}
                          >
                            {new Date(mode.completedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              p: { xs: 3, sm: 4 }
            }}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SchoolIcon sx={{ fontSize: 60, color: '#6b778c', mb: 2 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#172b4d',
                    mb: 1
                  }}
                >
                  Start Your Learning Journey
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c',
                    mb: 3
                  }}
                >
                  Begin with A1 level to unlock your language learning progress!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/practice/grammar')}
                  sx={{ 
                    borderRadius: 0.5,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Start Learning
                </Button>
              </Box>
            </Card>
          )}
        </Box>

        {/* Recent Activity and Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3 
        }}>
          {/* Recent Activity */}
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
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#172b4d',
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                Recent Activity
              </Typography>
              
              {stats?.recentProgress && stats.recentProgress.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.recentProgress.slice(0, 5).map((progress) => (
                    <Box 
                      key={progress.id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 1,
                        borderRadius: 0.5,
                        bgcolor: '#f8f9fa'
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: '#172b4d',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          {progress.word.word}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6b778c',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {progress.word.translation}
                        </Typography>
                      </Box>
                      <Chip 
                        label={progress.isCorrect ? 'Correct' : 'Incorrect'} 
                        color={progress.isCorrect ? 'success' : 'error'}
                        size="small"
                        sx={{ 
                          borderRadius: 0.5,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c',
                    textAlign: 'center',
                    py: 4
                  }}
                >
                  No recent activity. Start practicing to see your progress here!
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
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
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#172b4d',
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                Quick Stats
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#172b4d',
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stats?.totalStudied || 0}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Words Studied
                  </Typography>
                </Box>
                
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#172b4d',
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stats?.accuracy ? Math.round(stats.accuracy) : 0}%
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Accuracy
                  </Typography>
                </Box>
                
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#172b4d',
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {completedLevels.length}/6
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Levels Completed
                  </Typography>
                </Box>
                
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#1976d2',
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {userLevel}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b778c',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Current Level
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
} 