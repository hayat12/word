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
  Alert,
  LinearProgress,
  Snackbar,
} from "@mui/material";
import { 
  CheckCircle,
  Cancel,
  Star,
  Diamond,
  AccessTime,
} from "@mui/icons-material";
import Link from "next/link";
import { useState, useEffect } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

export default function SubscriptionPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Update current plan ID when session changes
  useEffect(() => {
    if (session?.user?.subscription?.plan) {
      const planMapping: { [key: string]: string } = {
        'FREE': 'free',
        'TRIAL': 'trial',
        'MONTHLY': 'monthly',
        'YEARLY': 'yearly'
      };
      const newPlanId = planMapping[session.user.subscription.plan] || 'free';
      setCurrentPlanId(newPlanId);
      console.log('Session updated, current plan:', session.user.subscription.plan, 'Plan ID:', newPlanId);
    } else {
      // If no subscription, default to free
      setCurrentPlanId('free');
      console.log('No subscription found, defaulting to free');
    }
  }, [session?.user?.subscription?.plan]);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      features: [
        "Basic language learning",
        "Limited training modules",
        "Community feedback access",
        "Basic progress tracking"
      ],
      icon: <Star sx={{ fontSize: 32, color: '#666' }} />
    },
    {
      id: "trial",
      name: "Trial",
      price: "$0",
      features: [
        "All premium features",
        "Full access for 30 days",
        "Unlimited training modules",
        "Advanced progress tracking",
        "Priority support"
      ],
      icon: <AccessTime sx={{ fontSize: 32, color: '#1976d2' }} />
    },
    {
      id: "monthly",
      name: "Monthly",
      price: "$14.99/month",
      features: [
        "All premium features",
        "Monthly billing",
        "Unlimited training modules",
        "Advanced progress tracking",
        "Priority support",
        "Custom learning paths",
        "Progress analytics"
      ],
      icon: <Diamond sx={{ fontSize: 32, color: '#ff9800' }} />
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$149.99/year",
      features: [
        "All premium features",
        "Annual billing (save 17%)",
        "Unlimited training modules",
        "Advanced progress tracking",
        "Priority support",
        "Custom learning paths",
        "Progress analytics",
        "Exclusive content access"
      ],
      popular: true,
      icon: <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />
    }
  ];

  const getCurrentPlan = () => {
    return subscriptionPlans.find(plan => plan.id === currentPlanId) || subscriptionPlans[0];
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

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upgrade subscription');
      }

      const data = await response.json();
      setSnackbarMessage(`Successfully upgraded to ${planId} plan!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Update the current plan ID immediately
      setCurrentPlanId(planId);
      
      // Force session refresh to get latest data
      await update();
      
      // Force a hard refresh to get the latest session data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade subscription.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  const currentPlan = getCurrentPlan();
  const isTrial = session.user.subscription?.plan === "TRIAL";
  const trialProgress = getTrialProgress();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #dfe1e6', mb: 4 }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#172b4d',
              textAlign: 'center'
            }}
          >
            Subscription Plans
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#6b778c',
              textAlign: 'center',
              mt: 1,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Choose the perfect plan for your language learning journey
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Current Plan Status */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: '#172b4d', 
              mb: 3,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Current Plan
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
              background: 'linear-gradient(90deg, #0052cc, #0065ff)',
              zIndex: 1,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0052cc15, #0052cc30)',
                  color: '#0052cc',
                  border: '2px solid #0052cc30'
                }}>
                  {currentPlan.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 0.5 }}>
                    {currentPlan.name} Plan
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b778c', mb: 1 }}>
                    {currentPlan.price}
                  </Typography>
                  <Chip 
                    label={session.user.subscription?.status || 'ACTIVE'} 
                    color={session.user.subscription?.status === 'ACTIVE' ? 'success' : 'warning'}
                    size="small"
                    sx={{ 
                      borderRadius: 0.5,
                      fontWeight: 500
                    }}
                  />
                </Box>
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
                  <Typography variant="caption" sx={{ color: '#e65100', mt: 1, display: 'block' }}>
                    Trial ends: {session.user.subscription?.trialEndDate ? 
                      new Date(session.user.subscription.trialEndDate).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Subscription Plans */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: '#172b4d', 
              mb: 3,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Choose Your Plan
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
            mb: 4
          }}>
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id}
                sx={{ 
                  position: 'relative',
                  bgcolor: 'white',
                  borderRadius: 0.5,
                  border: plan.popular ? '2px solid #ff9800' : '1px solid #dfe1e6',
                  boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  minHeight: { xs: '400px', sm: '450px' },
                  '&:hover': {
                    transform: plan.popular ? 'translateY(-4px)' : 'translateY(-2px)',
                    boxShadow: plan.popular ? '0 8px 24px rgba(255, 152, 0, 0.2)' : '0 4px 12px rgba(9, 30, 66, 0.15)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: plan.popular 
                      ? 'linear-gradient(90deg, #ff9800, #ff5722)' 
                      : 'linear-gradient(90deg, #0052cc, #0065ff)',
                    zIndex: 1,
                  }
                }}
              >
                {plan.popular && (
                  <Box sx={{
                    position: 'absolute',
                    top: 12,
                    right: -32,
                    background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                    color: 'white',
                    padding: '4px 40px',
                    transform: 'rotate(45deg)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 2,
                    borderRadius: 0.5,
                  }}>
                    POPULAR
                  </Box>
                )}
                
                <CardContent sx={{ 
                  p: { xs: 2.5, sm: 3 }, 
                  pt: plan.popular ? 4 : 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 2,
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: plan.popular 
                        ? 'linear-gradient(135deg, #ff980015, #ff980030)' 
                        : 'linear-gradient(135deg, #0052cc15, #0052cc30)',
                      alignItems: 'center',
                      margin: '0 auto',
                      border: `2px solid ${plan.popular ? '#ff980030' : '#0052cc30'}`
                    }}>
                      <Box sx={{ 
                        color: plan.popular ? '#ff9800' : '#0052cc',
                        fontSize: '1.5rem'
                      }}>
                        {plan.icon}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#172b4d', 
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      color: plan.popular ? '#ff9800' : '#0052cc', 
                      mb: 2,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}>
                      {plan.price}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, mb: 3 }}>
                    {plan.features.map((feature, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        mb: 1.5,
                        p: 1,
                        borderRadius: 0.5,
                        bgcolor: 'rgba(76, 175, 80, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.12)',
                        }
                      }}>
                        <CheckCircle sx={{ 
                          fontSize: 18, 
                          color: '#4caf50', 
                          mr: 1.5,
                          mt: 0.25
                        }} />
                        <Typography variant="body2" sx={{ 
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          color: '#172b4d'
                        }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant={plan.id === currentPlanId ? "outlined" : "contained"}
                    fullWidth
                    disabled={plan.id === currentPlanId || isLoading}
                    onClick={() => handleUpgrade(plan.id)}
                    sx={{ 
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      py: 1.5,
                      borderRadius: 0.5,
                      fontWeight: 500,
                      background: plan.id === currentPlanId 
                        ? 'transparent' 
                        : plan.popular 
                          ? 'linear-gradient(135deg, #ff9800, #ff5722)'
                          : 'linear-gradient(135deg, #0052cc, #0065ff)',
                      borderColor: plan.id === currentPlanId ? '#0052cc' : 'transparent',
                      color: plan.id === currentPlanId ? '#0052cc' : 'white',
                      '&:hover': {
                        background: plan.id === currentPlanId 
                          ? 'transparent' 
                          : plan.popular 
                            ? 'linear-gradient(135deg, #ff5722, #ff9800)'
                            : 'linear-gradient(135deg, #0065ff, #0052cc)',
                        borderColor: plan.id === currentPlanId ? '#0052cc' : 'transparent',
                      },
                      '&:disabled': {
                        background: '#f5f5f5',
                        color: '#9e9e9e',
                        borderColor: '#e0e0e0'
                      }
                    }}
                  >
                    {isLoading ? "Upgrading..." : plan.id === currentPlanId ? "Current Plan" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Admin Section */}
        {session.user.role === "ADMIN" && (
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: '#172b4d', 
                mb: 3,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Admin Panel
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
                background: 'linear-gradient(90deg, #7b1fa2, #9c27b0)',
                zIndex: 1,
              }
            }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7b1fa215, #7b1fa230)',
                    color: '#7b1fa2',
                    border: '2px solid #7b1fa230'
                  }}>
                    <Star sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d', mb: 0.5 }}>
                      Admin Access
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b778c' }}>
                      You have access to all features regardless of subscription plan
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2
                }}>
                  <Button
                    variant="outlined"
                    component={Link}
                    href="/admin/users"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 0.5,
                      borderColor: '#7b1fa2',
                      color: '#7b1fa2',
                      fontWeight: 500,
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#7b1fa2',
                        bgcolor: '#7b1fa208',
                      }
                    }}
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    href="/admin/subscriptions"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 0.5,
                      borderColor: '#7b1fa2',
                      color: '#7b1fa2',
                      fontWeight: 500,
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#7b1fa2',
                        bgcolor: '#7b1fa208',
                      }
                    }}
                  >
                    Manage Subscriptions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Back to Dashboard */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Button
            variant="outlined"
            component={Link}
            href="/dashboard"
            sx={{ 
              textTransform: 'none',
              borderRadius: 0.5,
              borderColor: '#0052cc',
              color: '#0052cc',
              fontWeight: 500,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#0052cc',
                bgcolor: '#0052cc08',
              }
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 