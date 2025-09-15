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
  Paper,
} from "@mui/material";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import Link from "next/link";

export default function NotFound() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f4f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="md">
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
            background: 'linear-gradient(90deg, #d32f2f, #f44336)',
            zIndex: 1,
          }
        }}>
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              gap: 3
            }}>
              {/* Error Icon */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d32f215, #f4433630)',
                color: '#d32f2f',
                border: '2px solid #d32f230',
                mb: 2
              }}>
                <ErrorIcon sx={{ fontSize: 40 }} />
              </Box>

              {/* 404 Number */}
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                  fontWeight: 700,
                  color: '#d32f2f',
                  lineHeight: 1,
                  mb: 1
                }}
              >
                404
              </Typography>

              {/* Error Title */}
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: '#172b4d',
                  mb: 2,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
                }}
              >
                Page Not Found
              </Typography>

              {/* Error Description */}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#6b778c',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: 1.6,
                  maxWidth: '500px',
                  mb: 4
                }}
              >
                Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2,
                width: '100%',
                maxWidth: '400px'
              }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleGoBack}
                  fullWidth
                  sx={{ 
                    borderRadius: 0.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    bgcolor: '#6b778c',
                    '&:hover': {
                      bgcolor: '#5a6b7a'
                    }
                  }}
                >
                  Go Back
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  fullWidth
                  sx={{ 
                    borderRadius: 0.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    bgcolor: '#0052cc',
                    '&:hover': {
                      bgcolor: '#0047b3'
                    }
                  }}
                >
                  Go to Dashboard
                </Button>
              </Box>

              {/* Additional Help */}
              <Box sx={{ 
                mt: 4, 
                p: 3, 
                borderRadius: 0.5, 
                bgcolor: '#f8f9fa', 
                border: '1px solid #e9ecef',
                width: '100%',
                maxWidth: '500px'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#172b4d',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <SearchIcon sx={{ fontSize: 20 }} />
                  Need Help?
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c',
                    lineHeight: 1.5
                  }}
                >
                  If you believe this is an error, please check the URL or contact support. 
                  You can also use the navigation menu to find what you're looking for.
                </Typography>
              </Box>

              {/* Quick Links */}
              {session && (
                <Box sx={{ 
                  mt: 3,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: 'center'
                }}>
                  <Button
                    component={Link}
                    href="/words"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 0.5,
                      borderColor: '#dfe1e6',
                      color: '#172b4d',
                      '&:hover': {
                        borderColor: '#0052cc',
                        color: '#0052cc'
                      }
                    }}
                  >
                    My Words
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/profile"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 0.5,
                      borderColor: '#dfe1e6',
                      color: '#172b4d',
                      '&:hover': {
                        borderColor: '#0052cc',
                        color: '#0052cc'
                      }
                    }}
                  >
                    Profile
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/statistics"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 0.5,
                      borderColor: '#dfe1e6',
                      color: '#172b4d',
                      '&:hover': {
                        borderColor: '#0052cc',
                        color: '#0052cc'
                      }
                    }}
                  >
                    Statistics
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 