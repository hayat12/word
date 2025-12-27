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
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Alert,
  Checkbox,
  IconButton,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from "@mui/material";
import { 
  CheckCircle, 
  Cancel, 
  Visibility, 
  AdminPanelSettings,
  Person,
  Language,
  School,
  Refresh
} from "@mui/icons-material";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Word {
  id: string;
  word: string;
  translation: string;
  example?: string;
  language: string;
  level: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

export default function AdminWordsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [previewWord, setPreviewWord] = useState<Word | null>(null);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchWords();
    }
  }, [session, statusFilter]);

  const fetchWords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/words?status=${statusFilter}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        throw new Error('Failed to fetch words');
      }
    } catch (error) {
      console.error("Error fetching words:", error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch words',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedWords.length === words.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords(words.map(word => word.id));
    }
  };

  const handleSelectWord = (wordId: string) => {
    setSelectedWords(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedWords.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select words to ' + action,
        severity: 'error'
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/words', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordIds: selectedWords,
          action
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
        setSelectedWords([]);
        fetchWords();
      } else {
        throw new Error('Failed to update words');
      }
    } catch (error) {
      console.error('Error updating words:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${action} words`,
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Cancel />;
      case 'APPROVED': return <CheckCircle />;
      case 'REJECTED': return <Cancel />;
      default: return null;
    }
  };

  if (status === "loading") {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You don't have permission to access this page. Admin access required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
            Word Approval
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve words submitted by users
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchWords}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Link href="/admin/users" passHref>
            <Button variant="outlined" startIcon={<Person />}>
              Manage Users
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <MenuItem value="PENDING">Pending ({words.filter(w => w.approvalStatus === 'PENDING').length})</MenuItem>
                  <MenuItem value="APPROVED">Approved ({words.filter(w => w.approvalStatus === 'APPROVED').length})</MenuItem>
                  <MenuItem value="REJECTED">Rejected ({words.filter(w => w.approvalStatus === 'REJECTED').length})</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleBulkAction('approve')}
                  disabled={selectedWords.length === 0}
                >
                  Approve Selected ({selectedWords.length})
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => handleBulkAction('reject')}
                  disabled={selectedWords.length === 0}
                >
                  Reject Selected ({selectedWords.length})
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Words Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Typography>Loading words...</Typography>
          ) : words.length === 0 ? (
            <Alert severity="info">
              No words found with status: {statusFilter}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedWords.length === words.length}
                        indeterminate={selectedWords.length > 0 && selectedWords.length < words.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Word</TableCell>
                    <TableCell>Translation</TableCell>
                    <TableCell>Language</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Submitted By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {words.map((word) => (
                    <TableRow key={word.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedWords.includes(word.id)}
                          onChange={() => handleSelectWord(word.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {word.word}
                        </Typography>
                        {word.example && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            "{word.example}"
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{word.translation}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={<Language />} 
                          label={word.language} 
                          size="small" 
                          color="primary" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<School />} 
                          label={`Level ${word.level}`} 
                          size="small" 
                          color="secondary" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{word.user.name || word.user.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {word.user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(word.approvalStatus)}
                          label={word.approvalStatus}
                          color={getStatusColor(word.approvalStatus) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(word.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(word.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Preview Word">
                          <IconButton
                            size="small"
                            onClick={() => setPreviewWord(word)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Word Preview Dialog */}
      <Dialog
        open={!!previewWord}
        onClose={() => setPreviewWord(null)}
        maxWidth="sm"
        fullWidth
      >
        {previewWord && (
          <>
            <DialogTitle>
              Word Preview
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {previewWord.word}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                  {previewWord.translation}
                </Typography>
                {previewWord.example && (
                  <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                    "{previewWord.example}"
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip icon={<Language />} label={previewWord.language} size="small" />
                  <Chip icon={<School />} label={`Level ${previewWord.level}`} size="small" />
                  <Chip
                    icon={getStatusIcon(previewWord.approvalStatus)}
                    label={previewWord.approvalStatus}
                    color={getStatusColor(previewWord.approvalStatus) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Submitted by: {previewWord.user.name || previewWord.user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(previewWord.createdAt).toLocaleString()}
                </Typography>
                {previewWord.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Tags:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {previewWord.tags.map(tag => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          sx={{ bgcolor: tag.color || 'default' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewWord(null)}>Close</Button>
              {previewWord.approvalStatus === 'PENDING' && (
                <>
                  <Button
                    color="error"
                    onClick={() => {
                      handleBulkAction('reject');
                      setPreviewWord(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    color="success"
                    onClick={() => {
                      handleBulkAction('approve');
                      setPreviewWord(null);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
  );
}
