"use client";

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Avatar, 
  Chip,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  School, 
  Logout,
  Person,
  Dashboard,
  Feedback,
  Translate,
  Analytics,
  PlayArrow,
  Edit
} from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
    handleMenuClose();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ px: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <School sx={{ fontSize: 28, color: '#0052cc' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#172b4d',
              fontSize: '1.25rem'
            }}
          >
            Word
          </Typography>
        </Box>
        
        {session && (
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8f9fa', 
            borderRadius: 2, 
            border: '1px solid #dfe1e6',
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#0052cc',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {session.user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b778c',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    lineHeight: 1
                  }}
                >
                  Welcome back
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#172b4d',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1
                  }}
                >
                  {session.user.name}
                </Typography>
              </Box>
            </Box>
            
            {session.user.subscription && (
              <Chip 
                label={session.user.subscription.plan} 
                size="small"
                sx={{
                  bgcolor: session.user.subscription.plan === 'PREMIUM' ? '#e8f5e8' : '#fff3cd',
                  color: session.user.subscription.plan === 'PREMIUM' ? '#2e7d32' : '#856404',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Box>
        )}
      </Box>
      
      <List>
        <ListItem 
          component={Link} 
          href="/dashboard" 
          onClick={handleDrawerToggle}
          sx={{ 
            color: '#172b4d',
            bgcolor: isActive('/dashboard') ? '#f0f7ff' : 'transparent',
            borderRight: isActive('/dashboard') ? '3px solid #0052cc' : 'none',
            '&:hover': { bgcolor: isActive('/dashboard') ? '#f0f7ff' : '#f4f5f7' }
          }}
        >
          <ListItemText 
            primary="Dashboard" 
            sx={{
              '& .MuiTypography-root': {
                fontWeight: isActive('/dashboard') ? 600 : 400,
                color: isActive('/dashboard') ? '#0052cc' : '#172b4d'
              }
            }}
          />
        </ListItem>
        <ListItem 
          component={Link} 
          href="/words" 
          onClick={handleDrawerToggle}
          sx={{ 
            color: '#172b4d',
            bgcolor: isActive('/words') ? '#f0f7ff' : 'transparent',
            borderRight: isActive('/words') ? '3px solid #0052cc' : 'none',
            '&:hover': { bgcolor: isActive('/words') ? '#f0f7ff' : '#f4f5f7' }
          }}
        >
          <ListItemText 
            primary="Words" 
            sx={{
              '& .MuiTypography-root': {
                fontWeight: isActive('/words') ? 600 : 400,
                color: isActive('/words') ? '#0052cc' : '#172b4d'
              }
            }}
          />
        </ListItem>
        {/* Grammar Practice - Temporarily disabled */}
        <ListItem 
          component={Link} 
          href="/practice/grammar" 
          onClick={handleDrawerToggle}
          sx={{ 
            color: '#172b4d',
            bgcolor: isActive('/practice/grammar') ? '#f0f7ff' : 'transparent',
            borderRight: isActive('/practice/grammar') ? '3px solid #0052cc' : 'none',
            '&:hover': { bgcolor: isActive('/practice/grammar') ? '#f0f7ff' : '#f4f5f7' }
          }}
        >
          <ListItemText 
            primary="Grammar Practice" 
            sx={{
              '& .MuiTypography-root': {
                fontWeight: isActive('/practice/grammar') ? 600 : 400,
                color: isActive('/practice/grammar') ? '#0052cc' : '#172b4d'
              }
            }}
          />
        </ListItem>
        {/* Writing Practice - Temporarily disabled */}
        <ListItem 
          component={Link} 
          href="/practice/writing" 
          onClick={handleDrawerToggle}
          sx={{ 
            color: '#172b4d',
            bgcolor: isActive('/practice/writing') ? '#f0f7ff' : 'transparent',
            borderRight: isActive('/practice/writing') ? '3px solid #0052cc' : 'none',
            '&:hover': { bgcolor: isActive('/practice/writing') ? '#f0f7ff' : '#f4f5f7' }
          }}
        >
          <ListItemText 
            primary="Writing Practice" 
            sx={{
              '& .MuiTypography-root': {
                fontWeight: isActive('/practice/writing') ? 600 : 400,
                color: isActive('/practice/writing') ? '#0052cc' : '#172b4d'
              }
            }}
          />
        </ListItem>
        <ListItem 
          component={Link} 
          href="/statistics" 
          onClick={handleDrawerToggle}
          sx={{ 
            color: '#172b4d',
            bgcolor: isActive('/statistics') ? '#f0f7ff' : 'transparent',
            borderRight: isActive('/statistics') ? '3px solid #0052cc' : 'none',
            '&:hover': { bgcolor: isActive('/statistics') ? '#f0f7ff' : '#f4f5f7' }
          }}
        >
          <ListItemText 
            primary="Statistics" 
            sx={{
              '& .MuiTypography-root': {
                fontWeight: isActive('/statistics') ? 600 : 400,
                color: isActive('/statistics') ? '#0052cc' : '#172b4d'
              }
            }}
          />
        </ListItem>
        <ListItem 
          component={Link} 
          href="/my-feedbacks" 
          onClick={handleDrawerToggle}
          sx={{ 
            color: '#172b4d',
            bgcolor: isActive('/my-feedbacks') ? '#f0f7ff' : 'transparent',
            borderRight: isActive('/my-feedbacks') ? '3px solid #0052cc' : 'none',
            '&:hover': { bgcolor: isActive('/my-feedbacks') ? '#f0f7ff' : '#f4f5f7' }
          }}
        >
          <ListItemText 
            primary="My Feedbacks" 
            sx={{
              '& .MuiTypography-root': {
                fontWeight: isActive('/my-feedbacks') ? 600 : 400,
                color: isActive('/my-feedbacks') ? '#0052cc' : '#172b4d'
              }
            }}
          />
        </ListItem>
        
        {session && (
          <>
            <ListItem 
              component={Link} 
              href="/profile" 
              onClick={handleDrawerToggle}
              sx={{ 
                color: '#172b4d',
                bgcolor: isActive('/profile') ? '#f0f7ff' : 'transparent',
                borderRight: isActive('/profile') ? '3px solid #0052cc' : 'none',
                '&:hover': { bgcolor: isActive('/profile') ? '#f0f7ff' : '#f4f5f7' }
              }}
            >
              <ListItemText 
                primary="Profile" 
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: isActive('/profile') ? 600 : 400,
                    color: isActive('/profile') ? '#0052cc' : '#172b4d'
                  }
                }}
              />
            </ListItem>
            <ListItem 
              component={Link} 
              href="/subscription" 
              onClick={handleDrawerToggle}
              sx={{ 
                color: '#172b4d',
                bgcolor: isActive('/subscription') ? '#f0f7ff' : 'transparent',
                borderRight: isActive('/subscription') ? '3px solid #0052cc' : 'none',
                '&:hover': { bgcolor: isActive('/subscription') ? '#f0f7ff' : '#f4f5f7' }
              }}
            >
              <ListItemText 
                primary="Subscription" 
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: isActive('/subscription') ? 600 : 400,
                    color: isActive('/subscription') ? '#0052cc' : '#172b4d'
                  }
                }}
              />
            </ListItem>
            
            {/* Admin Navigation */}
            {session.user.role === 'ADMIN' && (
              <>
                <ListItem 
                  component={Link} 
                  href="/admin/users" 
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: '#172b4d',
                    bgcolor: isActive('/admin/users') ? '#f0f7ff' : 'transparent',
                    borderRight: isActive('/admin/users') ? '3px solid #0052cc' : 'none',
                    '&:hover': { bgcolor: isActive('/admin/users') ? '#f0f7ff' : '#f4f5f7' }
                  }}
                >
                  <ListItemText 
                    primary="Manage Users" 
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive('/admin/users') ? 600 : 400,
                        color: isActive('/admin/users') ? '#0052cc' : '#172b4d'
                      }
                    }}
                  />
                </ListItem>
                <ListItem 
                  component={Link} 
                  href="/admin/words" 
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: '#172b4d',
                    bgcolor: isActive('/admin/words') ? '#f0f7ff' : 'transparent',
                    borderRight: isActive('/admin/words') ? '3px solid #0052cc' : 'none',
                    '&:hover': { bgcolor: isActive('/admin/words') ? '#f0f7ff' : '#f4f5f7' }
                  }}
                >
                  <ListItemText 
                    primary="Word Approval" 
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive('/admin/words') ? 600 : 400,
                        color: isActive('/admin/words') ? '#0052cc' : '#172b4d'
                      }
                    }}
                  />
                </ListItem>
              </>
            )}
          </>
        )}
      </List>
      
      {session && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              borderColor: '#dfe1e6',
              color: '#172b4d',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#d32f2f',
                color: '#d32f2f',
                bgcolor: '#ffebee'
              }
            }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'white',
          boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
          borderBottom: '1px solid #dfe1e6',
          backdropFilter: 'blur(8px)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: '#172b4d'
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo - Hidden on mobile */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 1,
            flexGrow: 1
          }}>
            <School sx={{ fontSize: 28, color: '#0052cc' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: '#172b4d',
                fontSize: '1.25rem'
              }}
            >
              Word
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 2,
            flexGrow: 1
          }}>
            <Button
              component={Link}
              href="/dashboard"
              startIcon={<Dashboard sx={{ fontSize: '1.125rem' }} />}
              sx={{
                textTransform: 'none',
                color: isActive('/dashboard') ? '#0052cc' : '#172b4d',
                fontWeight: isActive('/dashboard') ? 600 : 500,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive('/dashboard') ? '#f0f7ff' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/dashboard') ? '#e6f3ff' : '#f4f5f7',
                  color: isActive('/dashboard') ? '#0052cc' : '#0052cc'
                }
              }}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              href="/words"
              startIcon={<Translate sx={{ fontSize: '1.125rem' }} />}
              sx={{
                textTransform: 'none',
                color: isActive('/words') ? '#0052cc' : '#172b4d',
                fontWeight: isActive('/words') ? 600 : 500,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive('/words') ? '#f0f7ff' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/words') ? '#e6f3ff' : '#f4f5f7',
                  color: isActive('/words') ? '#0052cc' : '#0052cc'
                }
              }}
            >
              Words
            </Button>
            <Button
              component={Link}
              href="/practice/grammar"
              startIcon={<PlayArrow sx={{ fontSize: '1.125rem' }} />}
              sx={{
                textTransform: 'none',
                color: isActive('/practice/grammar') ? '#0052cc' : '#172b4d',
                fontWeight: isActive('/practice/grammar') ? 600 : 500,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive('/practice/grammar') ? '#f0f7ff' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/practice/grammar') ? '#e6f3ff' : '#f4f5f7',
                  color: isActive('/practice/grammar') ? '#0052cc' : '#0052cc'
                }
              }}
            >
              Grammar Practice
            </Button>
            <Button
              component={Link}
              href="/practice/writing"
              startIcon={<Edit sx={{ fontSize: '1.125rem' }} />}
              sx={{
                textTransform: 'none',
                color: isActive('/practice/writing') ? '#0052cc' : '#172b4d',
                fontWeight: isActive('/practice/writing') ? 600 : 500,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive('/practice/writing') ? '#f0f7ff' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/practice/writing') ? '#e6f3ff' : '#f4f5f7',
                  color: isActive('/practice/writing') ? '#0052cc' : '#0052cc'
                }
              }}
            >
              Writing Practice
            </Button>
            <Button
              component={Link}
              href="/statistics"
              startIcon={<Analytics sx={{ fontSize: '1.125rem' }} />}
              sx={{
                textTransform: 'none',
                color: isActive('/statistics') ? '#0052cc' : '#172b4d',
                fontWeight: isActive('/statistics') ? 600 : 500,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive('/statistics') ? '#f0f7ff' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/statistics') ? '#e6f3ff' : '#f4f5f7',
                  color: isActive('/statistics') ? '#0052cc' : '#0052cc'
                }
              }}
            >
              Statistics
            </Button>
            <Button
              component={Link}
              href="/my-feedbacks"
              startIcon={<Feedback sx={{ fontSize: '1.125rem' }} />}
              sx={{
                textTransform: 'none',
                color: isActive('/my-feedbacks') ? '#0052cc' : '#172b4d',
                fontWeight: isActive('/my-feedbacks') ? 600 : 500,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive('/my-feedbacks') ? '#f0f7ff' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/my-feedbacks') ? '#e6f3ff' : '#f4f5f7',
                  color: isActive('/my-feedbacks') ? '#0052cc' : '#0052cc'
                }
              }}
            >
              My Feedbacks
            </Button>
          </Box>

          {/* User Section */}
          {session ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component={Link}
                href="/profile"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  textTransform: 'none',
                  color: isActive('/profile') ? '#0052cc' : '#172b4d',
                  fontWeight: isActive('/profile') ? 600 : 500,
                  fontSize: '0.875rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: isActive('/profile') ? '#f0f7ff' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/profile') ? '#e6f3ff' : '#f4f5f7',
                    color: isActive('/profile') ? '#0052cc' : '#0052cc'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#0052cc',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {session.user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b778c',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      lineHeight: 1
                    }}
                  >
                    Welcome back
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#172b4d',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      lineHeight: 1
                    }}
                  >
                    {session.user.name}
                  </Typography>
                </Box>
              </Button>
              
              <IconButton
                onClick={handleMenuOpen}
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  color: '#172b4d'
                }}
              >
                <Person />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
                    borderRadius: 2,
                    border: '1px solid #dfe1e6'
                  }
                }}
              >
                <MenuItem 
                  component={Link} 
                  href="/profile" 
                  onClick={handleMenuClose}
                  sx={{ 
                    color: isActive('/profile') ? '#0052cc' : '#172b4d',
                    bgcolor: isActive('/profile') ? '#f0f7ff' : 'transparent',
                    fontWeight: isActive('/profile') ? 600 : 400,
                    '&:hover': { 
                      bgcolor: isActive('/profile') ? '#e6f3ff' : '#f4f5f7' 
                    }
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  href="/subscription" 
                  onClick={handleMenuClose}
                  sx={{ 
                    color: isActive('/subscription') ? '#0052cc' : '#172b4d',
                    bgcolor: isActive('/subscription') ? '#f0f7ff' : 'transparent',
                    fontWeight: isActive('/subscription') ? 600 : 400,
                    '&:hover': { 
                      bgcolor: isActive('/subscription') ? '#e6f3ff' : '#f4f5f7' 
                    }
                  }}
                >
                  Subscription
                </MenuItem>
                
                {/* Admin Navigation */}
                {session.user.role === 'ADMIN' && (
                  <>
                    <MenuItem 
                      component={Link} 
                      href="/admin/users" 
                      onClick={handleMenuClose}
                      sx={{ 
                        color: isActive('/admin/users') ? '#0052cc' : '#172b4d',
                        bgcolor: isActive('/admin/users') ? '#f0f7ff' : 'transparent',
                        fontWeight: isActive('/admin/users') ? 600 : 400,
                        '&:hover': { 
                          bgcolor: isActive('/admin/users') ? '#e6f3ff' : '#f4f5f7' 
                        }
                      }}
                    >
                      Manage Users
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      href="/admin/words" 
                      onClick={handleMenuClose}
                      sx={{ 
                        color: isActive('/admin/words') ? '#0052cc' : '#172b4d',
                        bgcolor: isActive('/admin/words') ? '#f0f7ff' : 'transparent',
                        fontWeight: isActive('/admin/words') ? 600 : 400,
                        '&:hover': { 
                          bgcolor: isActive('/admin/words') ? '#e6f3ff' : '#f4f5f7' 
                        }
                      }}
                    >
                      Word Approval
                    </MenuItem>
                  </>
                )}
                
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    color: '#d32f2f',
                    '&:hover': { bgcolor: '#ffebee' }
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                href="/auth/signin"
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  borderColor: '#dfe1e6',
                  color: '#172b4d',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#0052cc',
                    color: '#0052cc',
                    bgcolor: '#f4f5f7'
                  }
                }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href="/auth/signup"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  bgcolor: '#0052cc',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#0047b3'
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            bgcolor: 'white',
            borderRight: '1px solid #dfe1e6'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
} 