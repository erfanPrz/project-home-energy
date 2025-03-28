import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Slider,
  Grid,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  Window as WindowIcon,
  Bolt as BoltIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { estimateHouseSize, estimateWindows, estimateEnergyUsage } from './utils/estimations';
import { validateAddress } from './utils/addressValidation';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [customSize, setCustomSize] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);

  const theme = useTheme();
  const resultsRef = useRef(null);

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAddressDetails(null);
    setCustomSize(null);
    setIsEditing(false);

    // Updated regex to match any valid Canadian postal code format
    const cleanPostalCode = searchQuery.replace(/\s+/g, '').toUpperCase();
    const isPostalCode = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(cleanPostalCode);
    
    if (!isPostalCode && searchQuery.length < 5) {
      setError('Please enter a valid Canadian postal code (e.g., A1A 1A1) or full address');
      setLoading(false);
      return;
    }

    try {
      const addressValidation = await validateAddress(searchQuery);
      if (!addressValidation.success) {
        setError(addressValidation.error);
        setLoading(false);
        return;
      }

      setAddressDetails(addressValidation.data);
      
      // Extract postal code from address components
      const postalCodeComponent = addressValidation.data.components.find(
        component => component.types.includes('postal_code')
      );
      const postalCode = postalCodeComponent 
        ? postalCodeComponent.long_name.replace(/\s+/g, '').toUpperCase()
        : cleanPostalCode;

      // Get province from address components
      const provinceComponent = addressValidation.data.components.find(
        component => component.types.includes('administrative_area_level_1')
      );
      const province = provinceComponent?.short_name || '';
      
      // Determine if rural based on the second character being '0' or the province's typical rural indicators
      const isRural = postalCode[1] === '0' || 
                     (province && isRuralProvince(postalCode, province));

      const houseSize = estimateHouseSize(postalCode, province);
      const windows = estimateWindows(houseSize, isRural);
      const energy = estimateEnergyUsage(houseSize, postalCode, province);

      setResults({
        houseSize,
        windows,
        energy,
        isRural
      });
    } catch (err) {
      setError('An error occurred while processing your request. Please ensure you entered a valid Canadian postal code.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine if a postal code is rural based on province-specific patterns
  const isRuralProvince = (postalCode, province) => {
    const ruralPatterns = {
      'BC': (code) => code[0] === 'V' && code[1] === '0',
      'AB': (code) => code[0] === 'T' && code[1] === '0',
      'SK': (code) => code[0] === 'S' && code[1] === '0',
      'MB': (code) => code[0] === 'R' && code[1] === '0',
      'ON': (code) => code[1] === '0',
      'QC': (code) => code[0] === 'G' || code[0] === 'H' || code[0] === 'J',
      'NB': (code) => code[0] === 'E' && code[1] === '0',
      'NS': (code) => code[0] === 'B' && code[1] === '0',
      'PE': (code) => code[0] === 'C' && code[1] === '0',
      'NL': (code) => code[0] === 'A' && code[1] === '0',
      'YT': (code) => code[0] === 'Y',
      'NT': (code) => code[0] === 'X',
      'NU': (code) => code[0] === 'X'
    };

    return ruralPatterns[province]?.(postalCode) || false;
  };

  const handleSizeChange = (event, newValue) => {
    setCustomSize(newValue);
    
    const postalCodeComponent = addressDetails.components.find(
      component => component.types.includes('postal_code')
    );
    const provinceComponent = addressDetails.components.find(
      component => component.types.includes('administrative_area_level_1')
    );
    
    const postalCode = postalCodeComponent 
      ? postalCodeComponent.long_name.replace(/\s+/g, '').toUpperCase()
      : searchQuery.replace(/\s+/g, '').toUpperCase();
    const province = provinceComponent?.short_name || '';
    
    const isRural = postalCode[1] === '0' || 
                   (province && isRuralProvince(postalCode, province));
    
    const windows = estimateWindows(newValue, isRural);
    const energy = estimateEnergyUsage(newValue, postalCode, province);

    setResults(prev => ({
      ...prev,
      houseSize: newValue,
      windows,
      energy
    }));
  };

  const getMapUrl = () => {
    if (!addressDetails) return '';
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyCiqVWo5XRjcyaYEyDbGIwU959fFPHe0rY&q=${encodeURIComponent(addressDetails.display_name)}`;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#FFFFFF'
    }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'url("/plants-near-windows-that-show-outside-grass.jpg") center/cover no-repeat',
        backgroundPosition: 'center 40%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          backdropFilter: 'blur(3px)',
          zIndex: 1
        }
      }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7} lg={6} sx={{ 
              textAlign: { xs: 'center', md: 'left' },
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(8px)',
              p: { xs: 3, md: 5 },
              borderRadius: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Typography 
                variant="h1" 
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 800,
                  color: '#1A2027',
                  mb: 2,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em'
                }}
              >
                Discover Your
                <Box component="span" sx={{ 
                  display: 'block',
                  background: 'linear-gradient(135deg, #2F7C31 0%, #38A169 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mt: 1
                }}>
                  Home's Energy Profile
                </Box>
              </Typography>

              <Typography 
                sx={{ 
                  color: '#4B5563',
                  mb: 6,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  maxWidth: '540px',
                  mx: { xs: 'auto', md: 0 },
                  lineHeight: 1.6,
                  letterSpacing: '-0.01em'
                }}
              >
                Get instant insights about your home's energy efficiency, window configuration, and size using our advanced AI-powered estimation tools.
              </Typography>

              {/* Search Box */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1, md: 1.5 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: '20px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                  maxWidth: 540,
                  mx: { xs: 'auto', md: 0 },
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 28px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Enter your postal code"
                  variant="standard"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: '#F0FDF4', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <SearchIcon sx={{ color: '#2F7C31' }} />
                      </Box>
                    ),
                    disableUnderline: true,
                    sx: { 
                      fontSize: '1.1rem',
                      px: 2
                    }
                  }}
                />
                <Button
                  variant="contained"
                  disabled={loading}
                  onClick={handleSubmit}
                  sx={{
                    background: 'linear-gradient(135deg, #2F7C31 0%, #38A169 100%)',
                    borderRadius: '16px',
                    px: { xs: 3, md: 4 },
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(47, 124, 49, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #266E27 0%, #2F8653 100%)',
                      boxShadow: '0 6px 16px rgba(47, 124, 49, 0.25)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Now'}
                </Button>
              </Paper>
              {error && (
                <Typography 
                  color="error" 
                  sx={{ 
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    fontSize: '0.95rem',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    p: 2,
                    borderRadius: '12px'
                  }}
                >
                  <InfoIcon fontSize="small" />
                  {error}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Results Section */}
      {results && (
        <>
          <Box 
            ref={resultsRef}
            sx={{ 
              py: { xs: 8, md: 12 },
              px: 3,
              background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)'
            }}
          >
            <Container maxWidth="lg">
              {addressDetails && (
                <Box sx={{ mb: 8, textAlign: 'center' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800,
                      color: '#1A2027',
                      mb: 3,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Your Home Analysis Results
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '10px',
                        bgcolor: '#F0FDF4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LocationIcon sx={{ fontSize: 20, color: '#2F7C31' }} />
                    </Box>
                    {addressDetails.display_name}
                  </Typography>
                </Box>
              )}

              <Grid container spacing={4}>
                {/* House Size Card */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'relative',
                      p: 4,
                      height: '100%',
                      borderRadius: '24px',
                      background: '#FFFFFF',
                      transition: 'all 0.3s ease-in-out',
                      overflow: 'hidden',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.06)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ mb: 4 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            transform: 'rotate(-5deg)',
                            boxShadow: '0 8px 16px rgba(47, 124, 49, 0.1)'
                          }}
                        >
                          <HomeIcon sx={{ fontSize: 32, color: '#2F7C31' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#1A2027', fontWeight: 600, mb: 1, letterSpacing: '-0.01em' }}>
                          House Size
                        </Typography>
                        <Typography variant="h3" sx={{ color: '#2F7C31', fontWeight: 800, letterSpacing: '-0.02em' }}>
                          {results.houseSize.toLocaleString()}
                          <Typography component="span" sx={{ fontSize: '1.1rem', color: '#4B5563', ml: 1, fontWeight: 500 }}>
                            sq ft
                          </Typography>
                        </Typography>
                      </Box>

                      {isEditing ? (
                        <Box>
                          <Slider
                            value={customSize || results.houseSize}
                            onChange={handleSizeChange}
                            min={500}
                            max={5000}
                            step={100}
                            marks
                            valueLabelDisplay="auto"
                            sx={{
                              '& .MuiSlider-track': { 
                                background: 'linear-gradient(to right, #2F7C31, #38A169)',
                                height: 6,
                                border: 'none'
                              },
                              '& .MuiSlider-rail': { 
                                backgroundColor: '#E5E7EB',
                                height: 6
                              },
                              '& .MuiSlider-thumb': { 
                                width: 20,
                                height: 20,
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 2px 8px rgba(47, 124, 49, 0.25)',
                                '&:hover, &.Mui-focusVisible': {
                                  boxShadow: '0 0 0 8px rgba(47, 124, 49, 0.16)'
                                }
                              },
                              '& .MuiSlider-mark': { 
                                backgroundColor: '#2F7C31',
                                height: 2
                              }
                            }}
                          />
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setIsEditing(false)}
                            sx={{
                              mt: 3,
                              color: '#2F7C31',
                              borderColor: '#2F7C31',
                              borderRadius: '16px',
                              py: 1.5,
                              textTransform: 'none',
                              fontSize: '1rem',
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#266E27',
                                bgcolor: '#F0FDF4'
                              }
                            }}
                          >
                            Save Changes
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="text"
                          onClick={() => setIsEditing(true)}
                          startIcon={<HomeIcon />}
                          sx={{
                            color: '#2F7C31',
                            bgcolor: '#F0FDF4',
                            '&:hover': {
                              bgcolor: '#DCFCE7'
                            },
                            textTransform: 'none',
                            borderRadius: '16px',
                            py: 1.75,
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          Adjust Size
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Windows Card */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'relative',
                      p: 4,
                      height: '100%',
                      borderRadius: '24px',
                      background: '#FFFFFF',
                      transition: 'all 0.3s ease-in-out',
                      overflow: 'hidden',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.06)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          transform: 'rotate(-5deg)',
                          boxShadow: '0 8px 16px rgba(3, 105, 161, 0.1)'
                        }}
                      >
                        <WindowIcon sx={{ fontSize: 32, color: '#0369A1' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#1A2027', fontWeight: 600, mb: 1, letterSpacing: '-0.01em' }}>
                        Windows
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#0369A1', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {results.windows}
                        <Typography component="span" sx={{ fontSize: '1.1rem', color: '#4B5563', ml: 1, fontWeight: 500 }}>
                          total
                        </Typography>
                      </Typography>
                    </Box>

                    <Grid container spacing={2.5}>
                      <Grid item xs={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                            borderRadius: '16px',
                            border: '1px solid rgba(3, 105, 161, 0.1)'
                          }}
                        >
                          <Typography variant="h4" sx={{ color: '#0369A1', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                            {Math.round(results.windows * 0.6)}
                          </Typography>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', fontWeight: 500 }}>
                            Standard
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                            borderRadius: '16px',
                            border: '1px solid rgba(3, 105, 161, 0.1)'
                          }}
                        >
                          <Typography variant="h4" sx={{ color: '#0369A1', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                            {Math.round(results.windows * 0.4)}
                          </Typography>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', fontWeight: 500 }}>
                            Large
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Energy Usage Card */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'relative',
                      p: 4,
                      height: '100%',
                      borderRadius: '24px',
                      background: '#FFFFFF',
                      transition: 'all 0.3s ease-in-out',
                      overflow: 'hidden',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.06)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          transform: 'rotate(-5deg)',
                          boxShadow: '0 8px 16px rgba(202, 138, 4, 0.1)'
                        }}
                      >
                        <BoltIcon sx={{ fontSize: 32, color: '#CA8A04' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#1A2027', fontWeight: 600, mb: 1, letterSpacing: '-0.01em' }}>
                        Energy Usage
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#CA8A04', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {results.energy.electricity.toLocaleString()}
                        <Typography component="span" sx={{ fontSize: '1.1rem', color: '#4B5563', ml: 1, fontWeight: 500 }}>
                          kWh/year
                        </Typography>
                      </Typography>
                    </Box>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid rgba(202, 138, 4, 0.1)'
                      }}
                    >
                      <Typography variant="h4" sx={{ color: '#CA8A04', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                        {results.energy.total.toLocaleString()} GJ
                      </Typography>
                      <Typography sx={{ color: '#4B5563', fontWeight: 500 }}>
                        Total Annual Energy
                      </Typography>
                    </Paper>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Map Section */}
          {addressDetails && (
            <Box sx={{ py: 6, bgcolor: '#FFFFFF' }}>
              <Container maxWidth="lg">
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1A2027',
                    mb: 4,
                    textAlign: 'center'
                  }}
                >
                  Location Details
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: '24px',
                        bgcolor: '#F8FAFC',
                        height: '100%',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <Box sx={{ mb: 4 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            bgcolor: '#F0F7FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3
                          }}
                        >
                          <LocationIcon sx={{ fontSize: 28, color: '#2F7C31' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#1A2027', fontWeight: 600, mb: 3 }}>
                          Address Information
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Street Address */}
                        <Box>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', mb: 1, fontWeight: 500 }}>
                            Street Address
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: '#FFFFFF',
                              borderRadius: '12px',
                              border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <Typography sx={{ color: '#1A2027', fontWeight: 500 }}>
                              {addressDetails.components
                                .filter(c => c.types.includes('street_number') || c.types.includes('route'))
                                .map(c => c.long_name)
                                .join(' ')}
                            </Typography>
                          </Paper>
                        </Box>

                        {/* City & Province */}
                        <Box>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', mb: 1, fontWeight: 500 }}>
                            City & Province
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: '#FFFFFF',
                              borderRadius: '12px',
                              border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <Typography sx={{ color: '#1A2027', fontWeight: 500 }}>
                              {[
                                addressDetails.components.find(c => c.types.includes('locality'))?.long_name,
                                addressDetails.components.find(c => c.types.includes('administrative_area_level_1'))?.long_name
                              ].filter(Boolean).join(', ')}
                            </Typography>
                          </Paper>
                        </Box>

                        {/* Postal Code */}
                        <Box>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', mb: 1, fontWeight: 500 }}>
                            Postal Code
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: '#FFFFFF',
                              borderRadius: '12px',
                              border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <Typography sx={{ color: '#1A2027', fontWeight: 500 }}>
                              {addressDetails.components.find(c => c.types.includes('postal_code'))?.long_name || 'N/A'}
                            </Typography>
                          </Paper>
                        </Box>

                        {/* Property Type */}
                        <Box>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem', mb: 1, fontWeight: 500 }}>
                            Property Type
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: '#FFFFFF',
                              borderRadius: '12px',
                              border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <Typography sx={{ color: '#1A2027', fontWeight: 500 }}>
                              {results.isRural ? 'Rural Property' : 'Urban Property'}
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        height: '400px',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={getMapUrl()}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Location Map"
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Container>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default App; 