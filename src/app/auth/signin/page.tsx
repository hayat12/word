"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to sign in with Google. Please try again.");
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      mt: { xs: 2, md: 8 }, 
      px: { xs: 2, md: 3 },
      minHeight: { xs: '100vh', md: 'auto' },
      display: 'flex',
      alignItems: 'center'
    }}>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            Sign In
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ 
              mb: 4,
              fontSize: { xs: '0.875rem', md: '0.875rem' }
            }}
          >
            Welcome back to your language learning journey
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Default credentials:</strong> If you're using a test account, try:
              <br />
              Email: hayat@gmail.com | Password: password123
            </Typography>
          </Alert>

          {error && (
            <Alert severity={error.includes("Check your email") ? "success" : "error"} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleEmailSignIn} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                mt: 3,
                height: { xs: '48px', md: '56px' },
                fontSize: { xs: '1rem', md: '1.125rem' }
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </Box>

          <Divider sx={{ my: { xs: 2, md: 3 } }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}
            >
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            sx={{ 
              mb: 3,
              height: { xs: '48px', md: '56px' },
              fontSize: { xs: '1rem', md: '1.125rem' }
            }}
          >
            Sign In with Google
          </Button>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link href="/auth/signup" style={{ textDecoration: "none" }}>
                <Typography component="span" color="primary">
                  Sign up
                </Typography>
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 