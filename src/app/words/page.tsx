"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
  Fab,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Language as LanguageIcon,
  Translate as TranslateIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

interface Word {
  id: string;
  word: string;
  translation: string;
  example?: string;
  language: string;
  createdAt: string;
}

const languages = ['All', 'English', 'German', 'Spanish'];

export default function WordsPage() {

  // params 


  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [selectedLanguage, setSelectedLanguage] = useState('German');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLanguage, setUploadLanguage] = useState('German');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    word: '',
    translation: '',
    example: '',
    language: 'German'
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchWords();
  }, [session, status]);

  const fetchWords = async () => {
    try {
      const response = await fetch('/api/words');
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        console.error('Failed to fetch words');
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Word added successfully!', severity: 'success' });
        setOpenAddDialog(false);
        setFormData({ word: '', translation: '', example: '', language: 'German' });
        fetchWords();
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Failed to add word', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add word', severity: 'error' });
    }
  };

  const handleUploadCSV = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('language', uploadLanguage);

    try {
      const response = await fetch('/api/words/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Words uploaded successfully!', severity: 'success' });
        setOpenUploadDialog(false);
        setUploadFile(null);
        fetchWords();
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Failed to upload words', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to upload words', severity: 'error' });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadFile(file);
    } else {
      setSnackbar({ open: true, message: 'Please select a valid CSV file', severity: 'error' });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Word', 'Translation', 'Example', 'Language'],
      ...words.map(word => [word.word, word.translation, word.example || '', word.language])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'words.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'All' || word.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const paginatedWords = filteredWords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (status === 'loading' || loading) {
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton 
              onClick={() => router.push('/dashboard')}
              sx={{ color: '#172b4d' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#172b4d',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              My Words
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{
                bgcolor: '#0052cc',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 0.5,
                '&:hover': { bgcolor: '#0047b3' }
              }}
            >
              Add Word
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setOpenUploadDialog(true)}
              sx={{
                borderColor: '#dfe1e6',
                color: '#172b4d',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 0.5,
                '&:hover': {
                  borderColor: '#0052cc',
                  color: '#0052cc',
                  bgcolor: '#f4f5f7'
                }
              }}
            >
              Upload CSV
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              sx={{
                borderColor: '#dfe1e6',
                color: '#172b4d',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 0.5,
                '&:hover': {
                  borderColor: '#0052cc',
                  color: '#0052cc',
                  bgcolor: '#f4f5f7'
                }
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              '&:hover': {
                boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#172b4d', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  {words.length}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c', 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Total Words
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              '&:hover': {
                boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#172b4d', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  {words.filter(w => w.language === 'German').length}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c', 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  German Words
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 0.5,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
              '&:hover': {
                boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#172b4d', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  {filteredWords.length}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6b778c', 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Filtered Words
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Card sx={{ 
          bgcolor: 'white',
          borderRadius: 0.5,
          border: '1px solid #dfe1e6',
          boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
          mb: 3
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#6b778c', mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0.5,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    label="Language"
                    sx={{
                      borderRadius: 0.5,
                    }}
                  >
                    {languages.map((language) => (
                      <MenuItem key={language} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Words Table */}
        <Card sx={{ 
          bgcolor: 'white',
          borderRadius: 0.5,
          border: '1px solid #dfe1e6',
          boxShadow: '0 1px 3px rgba(9, 30, 66, 0.13)',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(9, 30, 66, 0.15)',
          }
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#172b4d' }}>Word</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#172b4d' }}>Translation</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#172b4d' }}>Example</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#172b4d' }}>Language</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#172b4d' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWords.map((word) => (
                  <TableRow key={word.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{word.word}</TableCell>
                    <TableCell>{word.translation}</TableCell>
                    <TableCell>
                      {word.example ? (
                        <Typography variant="body2" color="text.secondary">
                          {word.example}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No example
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={word.language} 
                        size="small" 
                        color="primary"
                        sx={{ borderRadius: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" sx={{ color: '#0052cc' }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ color: '#d32f2f' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredWords.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Card>

        {/* Add Word Dialog */}
        <Dialog 
          open={openAddDialog} 
          onClose={() => setOpenAddDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #dfe1e6' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d' }}>
              Add New Word
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Word"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0.5,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Translation"
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0.5,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Example (optional)"
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0.5,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    label="Language"
                    sx={{
                      borderRadius: 0.5,
                    }}
                  >
                    <MenuItem value="German">German</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setOpenAddDialog(false)}
              sx={{ 
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddWord}
              variant="contained"
              sx={{ 
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 500,
                bgcolor: '#0052cc',
                '&:hover': { bgcolor: '#0047b3' }
              }}
            >
              Add Word
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload CSV Dialog */}
        <Dialog 
          open={openUploadDialog} 
          onClose={() => setOpenUploadDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #dfe1e6' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#172b4d' }}>
              Upload CSV File
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-file-input"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="csv-file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{
                      borderColor: '#dfe1e6',
                      color: '#172b4d',
                      borderRadius: 0.5,
                      '&:hover': {
                        borderColor: '#0052cc',
                        color: '#0052cc'
                      }
                    }}
                  >
                    {uploadFile ? uploadFile.name : 'Choose CSV File'}
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={uploadLanguage}
                    onChange={(e) => setUploadLanguage(e.target.value)}
                    label="Language"
                    sx={{
                      borderRadius: 0.5,
                    }}
                  >
                    <MenuItem value="German">German</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setOpenUploadDialog(false)}
              sx={{ 
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadCSV}
              variant="contained"
              disabled={!uploadFile}
              sx={{ 
                borderRadius: 0.5,
                textTransform: 'none',
                fontWeight: 500,
                bgcolor: '#0052cc',
                '&:hover': { bgcolor: '#0047b3' }
              }}
            >
              Upload
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