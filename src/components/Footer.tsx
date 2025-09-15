"use client";

import { useSession } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";

export default function Footer() {
  const { data: session } = useSession();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 3 },
        bgcolor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">


        {/* Copyright */}
        <Box sx={{ 
          textAlign: { xs: 'center', md: 'left' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: { xs: 2, md: 0 }
        }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
          >
            © 2024 Language Learning App. All rights reserved.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, md: 3 },
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-end' }
          }}>
            {session && (
              <MuiLink 
                href="/my-feedbacks" 
                color="text.secondary" 
                underline="hover"
                sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
              >
                My Feedbacks
              </MuiLink>
            )}
            <MuiLink 
              href="#" 
              color="text.secondary" 
              underline="hover"
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              Privacy Policy
            </MuiLink>
            <MuiLink 
              href="#" 
              color="text.secondary" 
              underline="hover"
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              Terms of Service
            </MuiLink>
            <MuiLink 
              href="#" 
              color="text.secondary" 
              underline="hover"
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              Contact Us
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 