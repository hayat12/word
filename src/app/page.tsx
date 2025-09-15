"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { Rating } from "@mui/material";
import Link from "next/link";
import { useEffect } from "react";
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Language as LanguageIcon,
  EmojiEvents as EmojiEventsIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

interface Feedback {
  id: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const {
    data: feedbacks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async (): Promise<Feedback[]> => {
      const response = await fetch("/api/feedback");
      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }
      return response.json();
    },
  });

    return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f4f5f7',
      pt: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 6, md: 8 },
          py: { xs: 4, md: 6 }
        }}>
          {/* Educational Illustration */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 4,
            position: 'relative'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0052cc15, #0065ff30)',
                color: '#0052cc',
                border: '3px solid #0052cc30',
                position: 'relative'
              }}>
                <LanguageIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00c85315, #4caf5030)',
                color: '#00c853',
                border: '3px solid #00c85330',
                position: 'relative'
              }}>
                <SchoolIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff980015, #ff572230)',
                color: '#ff9800',
                border: '3px solid #ff980030',
                position: 'relative'
              }}>
                <TrendingUpIcon sx={{ fontSize: 40 }} />
              </Box>
            </Box>
          </Box>

          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 800,
              color: '#172b4d',
              mb: 3,
              lineHeight: 1.2
            }}
          >
            Master Languages
            <Box component="span" sx={{ 
              background: 'linear-gradient(135deg, #0052cc, #0065ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block'
            }}>
              One Word at a Time
            </Box>
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#6b778c',
              mb: 4,
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.5
            }}
          >
            Join thousands of learners who are already improving their language skills with our innovative spaced repetition system
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            mb: 6
          }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href={session ? "/dashboard" : "/auth/signup"}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.125rem',
                fontWeight: 600,
                bgcolor: '#0052cc',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0047b3',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 82, 204, 0.3)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {session ? "Go to Dashboard" : "Start Learning Now"}
            </Button>
            
            {!session && (
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/auth/signin"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  borderColor: '#0052cc',
                  color: '#0052cc',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#0047b3',
                    color: '#0047b3',
                    bgcolor: '#f0f7ff'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography 
            variant="h3" 
            align="center"
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#172b4d',
              mb: 4
            }}
          >
            Why Choose Our Platform?
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 6
          }}>
            {[
              {
                icon: <PsychologyIcon sx={{ fontSize: 48, color: '#0052cc' }} />,
                title: 'Spaced Repetition',
                description: 'Learn efficiently with scientifically proven spaced repetition algorithms that adapt to your memory patterns',
                color: '#0052cc'
              },
              {
                icon: <TrendingUpIcon sx={{ fontSize: 48, color: '#00c853' }} />,
                title: 'Progress Tracking',
                description: 'Monitor your learning progress with detailed statistics, insights, and personalized recommendations',
                color: '#00c853'
              },
              {
                icon: <LanguageIcon sx={{ fontSize: 48, color: '#ff9800' }} />,
                title: 'Smart Organization',
                description: 'Organize words with custom tags, categories, and intelligent grouping for better retention',
                color: '#ff9800'
              }
            ].map((feature, index) => (
              <Card key={index} sx={{ 
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #dfe1e6',
                boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
                p: 4,
                textAlign: 'center',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(9, 30, 66, 0.15)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${feature.color}, ${feature.color}88)`,
                  zIndex: 1,
                }
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}30)`,
                  border: `2px solid ${feature.color}30`,
                  mx: 'auto',
                  mb: 3
                }}>
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#172b4d',
                    mb: 2
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Statistics Section */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography 
            variant="h3" 
            align="center"
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#172b4d',
              mb: 4
            }}
          >
            Learning Success Stories
          </Typography>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 6
          }}>
            {[
              {
                icon: <GroupIcon sx={{ fontSize: 32, color: '#0052cc' }} />,
                number: '10,000+',
                label: 'Active Learners',
                color: '#0052cc'
              },
              {
                icon: <SpeedIcon sx={{ fontSize: 32, color: '#00c853' }} />,
                number: '50,000+',
                label: 'Words Learned',
                color: '#00c853'
              },
              {
                icon: <EmojiEventsIcon sx={{ fontSize: 32, color: '#ff9800' }} />,
                number: '95%',
                label: 'Success Rate',
                color: '#ff9800'
              },
              {
                icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#9c27b0' }} />,
                number: '24/7',
                label: 'Available',
                color: '#9c27b0'
              }
            ].map((stat, index) => (
              <Card key={index} sx={{ 
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #dfe1e6',
                boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
                p: 3,
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}30)`,
                  border: `2px solid ${stat.color}30`,
                  mx: 'auto',
                  mb: 2
                }}>
                  {stat.icon}
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#172b4d',
                    mb: 1
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c',
                    fontWeight: 500
                  }}
                >
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Community Feedback Section */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography 
            variant="h3" 
            align="center"
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#172b4d',
              mb: 4
            }}
          >
            What Our Learners Say
          </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            Failed to load feedback. Please try again later.
          </Alert>
        ) : feedbacks && feedbacks.length > 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            flexWrap: 'wrap', 
            gap: { xs: 2, md: 3 } 
          }}>
            {feedbacks.map((feedback) => (
              <Box key={feedback.id} sx={{ 
                flex: { md: '1 1 400px' }, 
                minWidth: 0,
                width: '100%'
              }}>
                <Card sx={{ 
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: '1px solid #dfe1e6',
                  boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.15)'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      textAlign: { xs: 'center', sm: 'left' }
                    }}>
                      <Avatar sx={{ 
                        mr: { xs: 0, sm: 2 }, 
                        mb: { xs: 1, sm: 0 },
                        width: { xs: 48, sm: 40 },
                        height: { xs: 48, sm: 40 }
                      }}>
                        {feedback.user?.name?.[0] || feedback.user?.email?.[0] || "U"}
                      </Avatar>
                      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                          {feedback.user?.name || "Anonymous"}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                        >
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        textAlign: { xs: 'center', sm: 'left' }
                      }}
                    >
                      {feedback.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '0.875rem' },
                        textAlign: { xs: 'center', sm: 'left' }
                      }}
                    >
                      {feedback.content}
                    </Typography>
                    
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center",
                      justifyContent: { xs: 'center', sm: 'flex-start' }
                    }}>
                      <Rating
                        value={feedback.rating}
                        readOnly
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                      >
                        {feedback.rating}/5 stars
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #dfe1e6',
            boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
            p: 6,
            textAlign: "center"
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: '#172b4d',
                mb: 2
              }}
            >
              No feedback yet
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#6b778c',
                mb: 4,
                lineHeight: 1.5
              }}
            >
              Be the first to share your experience!
            </Typography>
            {session ? (
              <Button
                variant="contained"
                component={Link}
                href="/my-feedbacks"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  bgcolor: '#0052cc',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#0047b3'
                  }
                }}
              >
                View My Feedbacks
              </Button>
            ) : (
              <Button
                variant="contained"
                component={Link}
                href="/auth/signin"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  bgcolor: '#0052cc',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#0047b3'
                  }
                }}
              >
                Sign In to Share
              </Button>
            )}
          </Card>
        )}
      </Box>

      {/* Call to Action */}
      <Box sx={{ 
        textAlign: "center", 
        py: { xs: 6, md: 8 }, 
        px: { xs: 4, md: 6 },
        bgcolor: "white", 
        borderRadius: 2,
        border: '1px solid #dfe1e6',
        boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
        mx: { xs: -2, md: 0 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Educational Icons */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4
        }}>
          {[...Array(8)].map((_, i) => (
            <SchoolIcon key={i} sx={{ fontSize: 120, color: '#0052cc' }} />
          ))}
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Educational Icons Row */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3,
            mb: 4,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0052cc15, #0065ff30)',
              color: '#0052cc',
              border: '2px solid #0052cc30'
            }}>
              <LanguageIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00c85315, #4caf5030)',
              color: '#00c853',
              border: '2px solid #00c85330'
            }}>
              <TrendingUpIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff980015, #ff572230)',
              color: '#ff9800',
              border: '2px solid #ff980030'
            }}>
              <PsychologyIcon sx={{ fontSize: 28 }} />
            </Box>
          </Box>

          <Typography 
            variant="h3" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#172b4d',
              mb: { xs: 2, md: 3 }
            }}
          >
            Ready to Start Learning?
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            paragraph
            sx={{ 
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              px: { xs: 1, md: 0 },
              mb: { xs: 3, md: 4 },
              color: '#6b778c',
              lineHeight: 1.5
            }}
          >
            Join thousands of learners who are already improving their language skills with our proven methods
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href={session ? "/dashboard" : "/auth/signup"}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1.125rem',
              fontWeight: 600,
              bgcolor: '#0052cc',
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#0047b3',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0, 82, 204, 0.3)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {session ? "Go to Dashboard" : "Start Learning Now"}
          </Button>
        </Box>
      </Box>
    </Container>
    </Box>
  );
} 