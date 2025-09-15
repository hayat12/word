"use client";

import { useState, useEffect, useRef } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { Edit, Delete, AccessTime } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

interface Feedback {
  id: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
}

interface FeedbackFormData {
  title: string;
  content: string;
  rating: number;
}

export default function MyFeedbacksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({});
  const feedbacksRef = useRef<Feedback[] | undefined>();

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<FeedbackFormData>();

  // Fetch user's feedbacks
  const {
    data: feedbacks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-feedbacks"],
    queryFn: async (): Promise<Feedback[]> => {
      const response = await fetch("/api/feedback/my-feedbacks");
      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }
      return response.json();
    },
    enabled: !!session,
  });

  // Update ref when feedbacks change
  useEffect(() => {
    feedbacksRef.current = feedbacks;
  }, [feedbacks]);

  // Timer effect to update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (!feedbacksRef.current) return;
      
      const newTimeRemaining: { [key: string]: number } = {};
      feedbacksRef.current.forEach((feedback) => {
        newTimeRemaining[feedback.id] = getTimeRemaining(feedback.createdAt);
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Remove feedbacks dependency

  // Update feedback mutation
  const updateFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData): Promise<Feedback> => {
      const response = await fetch(`/api/feedback/${editingFeedback?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update feedback");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      setIsEditDialogOpen(false);
      setEditingFeedback(null);
      resetEditForm();
    },
  });

  // Delete feedback mutation
  const deleteFeedbackMutation = useMutation({
    mutationFn: async (feedbackId: string): Promise<void> => {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete feedback");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });

  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    resetEditForm({
      title: feedback.title,
      content: feedback.content,
      rating: feedback.rating,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (feedbackId: string) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      deleteFeedbackMutation.mutate(feedbackId);
    }
  };

  const onEditSubmit = (data: FeedbackFormData) => {
    updateFeedbackMutation.mutate(data);
  };

  const isWithinOneMinute = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const timeDiff = now.getTime() - created.getTime();
    const oneMinute = 60 * 1000; // 60 seconds in milliseconds
    return timeDiff <= oneMinute;
  };

  const getTimeRemaining = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const timeDiff = now.getTime() - created.getTime();
    const oneMinute = 60 * 1000;
    const remaining = oneMinute - timeDiff;
    
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / 1000); // Return seconds remaining
  };

  // Timer effect to update countdown every second
  useEffect(() => {
    if (!feedbacks) return;

    const timer = setInterval(() => {
      const newTimeRemaining: { [key: string]: number } = {};
      feedbacks.forEach((feedback) => {
        newTimeRemaining[feedback.id] = getTimeRemaining(feedback.createdAt);
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [feedbacks]);

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
        My Feedbacks
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
        Manage your feedback submissions. You can edit or delete within 1 minute of creation.
      </Typography>

      {/* Error Messages */}
      {updateFeedbackMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {updateFeedbackMutation.error?.message || "Failed to update feedback"}
        </Alert>
      )}

      {deleteFeedbackMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteFeedbackMutation.error?.message || "Failed to delete feedback"}
        </Alert>
      )}

      {/* Success Messages */}
      {updateFeedbackMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Feedback updated successfully!
        </Alert>
      )}

      {deleteFeedbackMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Feedback deleted successfully!
        </Alert>
      )}

      {/* Feedbacks List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">
          Failed to load feedbacks. Please try again later.
        </Alert>
      ) : feedbacks && feedbacks.length > 0 ? (
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
           {feedbacks.map((feedback) => {
             const canEdit = isWithinOneMinute(feedback.createdAt);
             const remaining = timeRemaining[feedback.id] || getTimeRemaining(feedback.createdAt);
            
            return (
              <Card key={feedback.id}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontSize: { xs: '1rem', md: '1.25rem' },
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
                          fontSize: { xs: '0.875rem', md: '0.875rem' },
                          textAlign: { xs: 'center', sm: 'left' }
                        }}
                      >
                        {feedback.content}
                      </Typography>
                      
                      <Box sx={{ 
                        display: "flex", 
                        alignItems: "center",
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        gap: 1
                      }}>
                        <Rating
                          value={feedback.rating}
                          readOnly
                          size="small"
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                        >
                          {feedback.rating}/5 stars
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.75rem' },
                          textAlign: { xs: 'center', sm: 'left' },
                          display: 'block',
                          mt: 1
                        }}
                      >
                        Created: {new Date(feedback.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      alignItems: { xs: 'center', sm: 'flex-end' }
                    }}>
                      {canEdit ? (
                        <>
                          <IconButton
                            onClick={() => handleEdit(feedback)}
                            color="primary"
                            size="small"
                            sx={{ 
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 }
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(feedback.id)}
                            color="error"
                            size="small"
                            sx={{ 
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 }
                            }}
                          >
                            <Delete />
                          </IconButton>
                                                     <Chip
                             icon={<AccessTime />}
                             label={`${remaining}s left`}
                             size="small"
                             color="warning"
                             sx={{ 
                               fontSize: { xs: '0.75rem', sm: '0.75rem' },
                               height: { xs: 24, sm: 28 }
                             }}
                           />
                        </>
                      ) : (
                        <Chip
                          label="Time expired"
                          size="small"
                          color="default"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 28 }
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
          >
            No feedbacks yet
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph
            sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}
          >
            Share your first feedback to get started!
          </Typography>
          <Button
            variant="contained"
            component="a"
            href="/feedback"
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: '200px' }
            }}
          >
            Share Feedback
          </Button>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', md: '1.25rem' },
          textAlign: 'center'
        }}>
          Edit Feedback
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit(onEditSubmit)} sx={{ mt: 2 }}>
            <Controller
              name="title"
              control={editControl}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Feedback Title"
                  margin="normal"
                  error={!!editErrors.title}
                  helperText={editErrors.title?.message}
                  disabled={updateFeedbackMutation.isPending}
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                />
              )}
            />
            
            <Controller
              name="rating"
              control={editControl}
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
              control={editControl}
              rules={{ required: "Content is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Your Feedback"
                  multiline
                  rows={4}
                  margin="normal"
                  error={!!editErrors.content}
                  helperText={editErrors.content?.message}
                  disabled={updateFeedbackMutation.isPending}
                  placeholder="Share your thoughts about the language learning experience..."
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button
            onClick={() => setIsEditDialogOpen(false)}
            disabled={updateFeedbackMutation.isPending}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit(onEditSubmit)}
            variant="contained"
            disabled={updateFeedbackMutation.isPending}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 1, sm: 2 }
            }}
          >
            {updateFeedbackMutation.isPending ? "Updating..." : "Update Feedback"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 