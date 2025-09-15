"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  Grid,
  LinearProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { 
  Person,
  Email,
  CalendarToday,
  Star,
  Diamond,
  AccessTime,
  CheckCircle,
  Edit,
  Settings,
  School,
  TrendingUp,
  Feedback,
  CardMembership,
  ArrowBack,
  Security,
  Notifications,
} from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";
import React from "react";

interface ProfileStats {
  totalFeedbacks: number;
  averageRating: number;
  memberSince: string;
  lastActive: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<ProfileStats>({
    totalFeedbacks: 12,
    averageRating: 4.2,
    memberSince: "2024-01-15",
    lastActive: "2024-08-06",
  });

  // Settings state
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settings, setSettings] = useState({
    preferredLanguage: 'German',
    dailyGoal: 10,
    userLevel: 'A1',
    defaultCategory: 'General',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Available options
  const languages = ['English', 'German', 'Spanish'];
  const levels = [
    { value: 'A1', label: 'A1 - Beginner' },
    { value: 'A2', label: 'A2 - Elementary' },
    { value: 'B1', label: 'B1 - Intermediate' },
    { value: 'B2', label: 'B2 - Upper Intermediate' },
    { value: 'C1', label: 'C1 - Advanced' },
    { value: 'C2', label: 'C2 - Mastery' },
  ];
  const categories = ['General', 'Business', 'Travel', 'Food', 'Technology', 'Sports', 'Health', 'Education'];

  // Load user preferences
  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          preferredLanguage: data.preferredLanguage || 'German',
          dailyGoal: data.dailyGoal || 10,
          userLevel: data.userLevel || 'A1',
          defaultCategory: data.defaultCategory || 'General',
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Save user preferences
  const saveUserPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
        setShowSettingsDialog(false);
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Failed to save settings', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Load preferences on component mount
  React.useEffect(() => {
    if (session?.user?.id) {
      loadUserPreferences();
    }
  }, [session]);

  const getPlanIcon = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'free':
        return <Star sx={{ fontSize: 24, color: '#6b778c' }} />;
      case 'trial':
        return <AccessTime sx={{ fontSize: 24, color: '#1976d2' }} />;
      case 'weekly':
        return <CheckCircle sx={{ fontSize: 24, color: '#4caf50' }} />;
      case 'monthly':
        return <Diamond sx={{ fontSize: 24, color: '#ff9800' }} />;
      default:
        return <Star sx={{ fontSize: 24, color: '#6b778c' }} />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'free':
        return '#6b778c';
      case 'trial':
        return '#1976d2';
      case 'weekly':
        return '#4caf50';
      case 'monthly':
        return '#ff9800';
      default:
        return '#6b778c';
    }
  };

  const getTrialProgress = () => {
    if (!session?.user?.subscription?.trialEndDate) return 0;
    
    const trialEnd = new Date(session.user.subscription.trialEndDate);
    const now = new Date();
    const total = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const remaining = trialEnd.getTime() - now.getTime();
    const used = total - remaining;
    
    return Math.max(0, Math.min(100, (used / total) * 100));
  };

  if (status === "loading") {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Typography>Loading...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Typography>Loading...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const isTrial = session.user.subscription?.plan === "TRIAL";
  const trialProgress = getTrialProgress();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #dfe1e6', mb: 4 }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton
              component={Link}
              href="/dashboard"
              sx={{ 
                color: '#172b4d',
                '&:hover': { bgcolor: '#f4f5f7' }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#172b4d'
              }}
            >
              Profile
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#6b778c',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Manage your account settings and view your learning progress
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        
        {/* Profile Overview */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 0.5,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #0052cc, #0065ff)',
              zIndex: 1,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { xs: 'center', md: 'flex-start' } }}>
                {/* Avatar Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: { xs: 80, sm: 100, md: 120 }, 
                      height: { xs: 80, sm: 100, md: 120 }, 
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      background: 'linear-gradient(135deg, #0052cc, #0065ff)',
                      fontWeight: 600,
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0, 82, 204, 0.3)'
                    }}
                  >
                    {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 0.5,
                      borderColor: '#0052cc',
                      color: '#0052cc',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: '#0052cc',
                        bgcolor: '#0052cc08',
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>

                {/* User Info Section */}
                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#172b4d',
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
                    }}
                  >
                    {session.user.name || 'User'}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#6b778c',
                      mb: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {session.user.email}
                  </Typography>
                  
                  {/* Subscription Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getPlanColor(session.user.subscription?.plan || 'FREE')}15, ${getPlanColor(session.user.subscription?.plan || 'FREE')}30)`,
                      color: getPlanColor(session.user.subscription?.plan || 'FREE'),
                      border: `2px solid ${getPlanColor(session.user.subscription?.plan || 'FREE')}30`
                    }}>
                      {getPlanIcon(session.user.subscription?.plan || 'FREE')}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#172b4d' }}>
                        {session.user.subscription?.plan || 'FREE'} Plan
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b778c' }}>
                        Status: {session.user.subscription?.status || 'ACTIVE'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Trial Progress */}
                  {isTrial && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 500, mb: 1 }}>
                        Trial Progress: {Math.round(trialProgress)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={trialProgress}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: '#ffe0b2',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #ff9800, #ff5722)'
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Quick Stats */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'row', md: 'column' }, 
                  gap: 2,
                  justifyContent: { xs: 'space-between', md: 'flex-start' }
                }}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172b4d' }}>
                      {stats.totalFeedbacks}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b778c' }}>
                      Feedbacks
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172b4d' }}>
                      {stats.averageRating}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b778c' }}>
                      Avg Rating
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Account Details */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#172b4d',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Person />
            Account Details
          </Typography>
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 1,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Email sx={{ fontSize: { xs: 18, sm: 20 }, color: '#6b778c' }} />
                    <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500 }}>
                      Email Address
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#172b4d', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {session.user.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <CalendarToday sx={{ fontSize: { xs: 18, sm: 20 }, color: '#6b778c' }} />
                    <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500 }}>
                      Member Since
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#172b4d', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Subscription Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#172b4d',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CardMembership />
            Subscription
          </Typography>
          
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 0.5,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #ff9800, #ff5722)',
              zIndex: 1,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getPlanColor(session.user.subscription?.plan || 'FREE')}15, ${getPlanColor(session.user.subscription?.plan || 'FREE')}30)`,
                  color: getPlanColor(session.user.subscription?.plan || 'FREE'),
                  border: `2px solid ${getPlanColor(session.user.subscription?.plan || 'FREE')}30`
                }}>
                  {getPlanIcon(session.user.subscription?.plan || 'FREE')}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 0.5 }}>
                    {session.user.subscription?.plan || 'FREE'} Plan
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b778c', mb: 1 }}>
                    Status: {session.user.subscription?.status || 'ACTIVE'}
                  </Typography>
                  {session.user.subscription?.trialEndDate && (
                    <Typography variant="caption" sx={{ color: '#e65100' }}>
                      Trial ends: {new Date(session.user.subscription.trialEndDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/subscription"
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 0.5,
                    borderColor: '#ff9800',
                    color: '#ff9800',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#ff9800',
                      bgcolor: '#ff980008',
                    }
                  }}
                >
                  Manage
                </Button>
              </Box>
              
              {isTrial && (
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 0.5, 
                  bgcolor: '#fff3e0', 
                  border: '1px solid #ffe0b2' 
                }}>
                  <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 500, mb: 1 }}>
                    Trial Progress: {Math.round(trialProgress)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={trialProgress}
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: '#ffe0b2',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #ff9800, #ff5722)'
                      }
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Creative Statistics Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#172b4d',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <TrendingUp />
            Your Progress
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.5
          }}>
            {/* Feedback Card */}
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2196f3, #42a5f5)',
                zIndex: 1,
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2196f315, #42a5f530)',
                    color: '#2196f3',
                    border: '2px solid #2196f330'
                  }}>
                    <Feedback sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#172b4d', mb: 0.5 }}>
                      {stats.totalFeedbacks}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500 }}>
                      Feedbacks Given
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 0.5, 
                  bgcolor: '#e3f2fd', 
                  border: '1px solid #bbdefb' 
                }}>
                  <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 500 }}>
                    💬 Helping improve the app
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Rating Card */}
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
                zIndex: 1,
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff980015, #ffb74d30)',
                    color: '#ff9800',
                    border: '2px solid #ff980030'
                  }}>
                    <Star sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#172b4d', mb: 0.5 }}>
                      {stats.averageRating}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500 }}>
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.5, 
                  mb: 1 
                }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      sx={{ 
                        fontSize: 16, 
                        color: i < Math.floor(stats.averageRating) ? '#ff9800' : '#e0e0e0' 
                      }} 
                    />
                  ))}
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 0.5, 
                  bgcolor: '#fff3e0', 
                  border: '1px solid #ffe0b2' 
                }}>
                  <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 500 }}>
                    ⭐ Excellent feedback quality
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Plan Card */}
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #9c27b0, #ba68c8)',
                zIndex: 1,
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9c27b015, #ba68c830)',
                    color: '#9c27b0',
                    border: '2px solid #9c27b030'
                  }}>
                    <Diamond sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172b4d', mb: 0.5 }}>
                      {session.user.subscription?.plan || 'FREE'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500 }}>
                      Current Plan
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 0.5, 
                  bgcolor: '#f3e5f5', 
                  border: '1px solid #e1bee7' 
                }}>
                  <Typography variant="caption" sx={{ color: '#7b1fa2', fontWeight: 500 }}>
                    💎 Premium features unlocked
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Account Type Card */}
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
                zIndex: 1,
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4caf5015, #66bb6a30)',
                    color: '#4caf50',
                    border: '2px solid #4caf5030'
                  }}>
                    <Security sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172b4d', mb: 0.5 }}>
                      {session.user.role}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b778c', fontWeight: 500 }}>
                      Account Type
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 0.5, 
                  bgcolor: '#e8f5e8', 
                  border: '1px solid #c8e6c9' 
                }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                    🔐 {session.user.role === 'ADMIN' ? 'Full access' : 'Standard access'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Admin Notice */}
        {session.user.role === "ADMIN" && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4,
              bgcolor: '#e3f2fd',
              border: '1px solid #bbdefb',
              '& .MuiAlert-icon': {
                color: '#1976d2'
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#172b4d' }}>
              Admin Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#1976d2' }}>
              As an administrator, you have access to all features and can manage user accounts.
            </Typography>
          </Alert>
        )}

        {/* Learning Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#172b4d',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Settings />
            Learning Settings
          </Typography>
          
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 0.5,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
              zIndex: 1,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Current Settings Display */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#172b4d', mb: 2 }}>
                    Current Settings
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={`Study Language: ${settings.preferredLanguage}`}
                      size="small"
                      sx={{ 
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500,
                        borderRadius: 0.5
                      }}
                    />
                    <Chip 
                      label={`Daily Goal: ${settings.dailyGoal} words`}
                      size="small"
                      sx={{ 
                        bgcolor: '#e8f5e8',
                        color: '#2e7d32',
                        fontWeight: 500,
                        borderRadius: 0.5
                      }}
                    />
                    <Chip 
                      label={`Level: ${levels.find(l => l.value === settings.userLevel)?.label || settings.userLevel}`}
                      size="small"
                      sx={{ 
                        bgcolor: '#fff3e0',
                        color: '#f57c00',
                        fontWeight: 500,
                        borderRadius: 0.5
                      }}
                    />
                    <Chip 
                      label={`Category: ${settings.defaultCategory}`}
                      size="small"
                      sx={{ 
                        bgcolor: '#f3e5f5',
                        color: '#7b1fa2',
                        fontWeight: 500,
                        borderRadius: 0.5
                      }}
                    />
                  </Box>
                </Box>
                
                {/* Settings Button */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => setShowSettingsDialog(true)}
                    startIcon={<Settings />}
                    sx={{ 
                      borderRadius: 0.5,
                      textTransform: 'none',
                      fontWeight: 500,
                      bgcolor: '#4caf50',
                      '&:hover': {
                        bgcolor: '#388e3c'
                      }
                    }}
                  >
                    Edit Settings
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Settings Dialog */}
        <Dialog 
          open={showSettingsDialog} 
          onClose={() => setShowSettingsDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0.5,
              boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #dfe1e6' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d' }}>
                Learning Settings
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Study Language</InputLabel>
              <Select
                value={settings.preferredLanguage}
                onChange={(e) => setSettings({ ...settings, preferredLanguage: e.target.value })}
                label="Study Language"
                sx={{ borderRadius: 0.5 }}
              >
                {languages.map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Daily Goal</InputLabel>
              <Select
                value={settings.dailyGoal}
                onChange={(e) => setSettings({ ...settings, dailyGoal: e.target.value as number })}
                label="Daily Goal"
                sx={{ borderRadius: 0.5 }}
              >
                <MenuItem value={5}>5 words</MenuItem>
                <MenuItem value={10}>10 words</MenuItem>
                <MenuItem value={15}>15 words</MenuItem>
                <MenuItem value={20}>20 words</MenuItem>
                <MenuItem value={25}>25 words</MenuItem>
                <MenuItem value={30}>30 words</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Learning Level</InputLabel>
              <Select
                value={settings.userLevel}
                onChange={(e) => setSettings({ ...settings, userLevel: e.target.value as string })}
                label="Learning Level"
                sx={{ borderRadius: 0.5 }}
              >
                {levels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Default Category</InputLabel>
              <Select
                value={settings.defaultCategory}
                onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value })}
                label="Default Category"
                sx={{ borderRadius: 0.5 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setShowSettingsDialog(false)}
              sx={{ 
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveUserPreferences} 
              variant="contained"
              disabled={loading}
              sx={{ 
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 500,
                bgcolor: '#4caf50',
                '&:hover': {
                  bgcolor: '#388e3c'
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
} 