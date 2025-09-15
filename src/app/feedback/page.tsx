"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

interface FeedbackFormData {
  title: string;
  content: string;
  rating: number;
}

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    defaultValues: {
      title: "",
      content: "",
      rating: 5,
    },
  });

  // Create feedback mutation
  const createFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData): Promise<any> => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create feedback");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      reset();
      setIsCreating(false);
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    createFeedbackMutation.mutate(data);
  };

  if (status === "loading") {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        align="center"
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          mb: 4
        }}
      >
        Share Your Feedback
      </Typography>

      <Typography 
        variant="body1" 
        align="center" 
        color="text.secondary"
        sx={{ 
          mb: 4,
          fontSize: { xs: '1rem', md: '1.125rem' }
        }}
      >
        Help us improve our language learning platform by sharing your experience
      </Typography>

      {/* Create Feedback Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: "space-between", 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            mb: 2,
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Create New Feedback
            </Typography>
            <Button
              variant="text"
              onClick={() => setIsCreating(!isCreating)}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: '120px' }
              }}
            >
              {isCreating ? "Cancel" : "New Feedback"}
            </Button>
          </Box>

          {isCreating && (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Feedback Title"
                    margin="normal"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={createFeedbackMutation.isPending}
                    sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  />
                )}
              />
              
              <Controller
                name="rating"
                control={control}
                rules={{ required: "Rating is required" }}
                render={({ field }) => (
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '0.875rem' } }}
                    >
                      Rate your experience:
                    </Typography>
                    <Rating
                      {...field}
                      value={field.value}
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                      }}
                      size="large"
                      sx={{ 
                        '& .MuiRating-iconFilled': {
                          color: 'primary.main',
                        },
                        '& .MuiRating-iconHover': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  </Box>
                )}
              />

              <Controller
                name="content"
                control={control}
                rules={{ required: "Content is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Your Feedback"
                    multiline
                    rows={4}
                    margin="normal"
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    disabled={createFeedbackMutation.isPending}
                    placeholder="Share your thoughts about the language learning experience..."
                    sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  />
                )}
              />

              <Box sx={{ 
                mt: 3, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 } 
              }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createFeedbackMutation.isPending}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    height: { xs: '48px', md: '56px' },
                    fontSize: { xs: '1rem', md: '1.125rem' }
                  }}
                >
                  {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsCreating(false);
                    reset();
                  }}
                  disabled={createFeedbackMutation.isPending}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    height: { xs: '48px', md: '56px' },
                    fontSize: { xs: '1rem', md: '1.125rem' }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {createFeedbackMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Thank you for your feedback! Your response has been submitted successfully.
        </Alert>
      )}

      {createFeedbackMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to submit feedback. Please try again.
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            How to Provide Great Feedback
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1, md: 2 } 
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}
            >
              • Be specific about what you liked or didn't like
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}
            >
              • Share your learning goals and how the app helps or could help
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}
            >
              • Suggest features you'd like to see in future updates
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}
            >
              • Rate your overall experience honestly
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 