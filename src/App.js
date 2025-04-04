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
  Fade,
  Alert,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Window as WindowIcon,
  Bolt as BoltIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { estimateHouseSize, estimateWindows, estimateEnergyUsage } from './utils/estimations';
import { validateAddress } from './utils/addressValidation';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customSize, setCustomSize] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);

  const resultsRef = useRef(null);
  const searchInputRef = useRef(null);

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

  const handleClear = () => {
    setSearchQuery('');
    setError('');
    setResults(null);
    setAddressDetails(null);
    setCustomSize(null);
    searchInputRef.current?.focus();
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          px: 3,
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                color: '#1A2027',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                letterSpacing: '-0.02em'
              }}
            >
              House Energy Estimator
            </Typography>
            <Typography 
              sx={{ 
                color: '#4B5563',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Get instant estimates for house size, windows, and energy usage based on your Canadian address
            </Typography>
          </Box>

          <Paper
            component="form"
            onSubmit={handleSubmit}
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
              inputRef={searchInputRef}
              fullWidth
              placeholder="Enter postal code (e.g., M5V 2T6) or address"
              variant="standard"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              error={!!error}
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
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Tooltip title="Clear input">
                      <IconButton
                        onClick={handleClear}
                        edge="end"
                        size="small"
                        sx={{ 
                          color: '#6B7280',
                          '&:hover': { color: '#1A2027' }
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { 
                  fontSize: '1.1rem',
                  px: 2
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !searchQuery}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                bgcolor: '#2F7C31',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#2D6A2E'
                },
                '&:disabled': {
                  bgcolor: '#9CA3AF'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Get Estimate'
              )}
            </Button>
          </Paper>

          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 3, 
                  maxWidth: 540, 
                  mx: { xs: 'auto', md: 0 },
                  borderRadius: '12px',
                  '& .MuiAlert-icon': {
                    color: '#DC2626'
                  }
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}
        </Container>
      </Box>

      {/* Results Section */}
      {results && (
        <Fade in={!!results}>
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

              <Grid container spacing={{ xs: 6, md: 4 }}>
                {/* House Size Card */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: '24px',
                      bgcolor: '#FFFFFF',
                      height: '100%',
                      mb: { xs: 6, md: 0 },
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          bgcolor: '#F0FDF4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3
                        }}
                      >
                        <HomeIcon sx={{ fontSize: 28, color: '#2F7C31' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#1A2027', fontWeight: 600, mb: 3 }}>
                        House Size
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
                      <Typography variant="h3" sx={{ color: '#2F7C31', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {results.houseSize.toLocaleString()}
                      </Typography>
                      <Typography sx={{ color: '#4B5563', fontSize: '1.1rem' }}>
                        sq ft
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                      <Typography sx={{ color: '#4B5563', mb: 2, fontWeight: 500 }}>
                        Adjust Size
                      </Typography>
                      <Slider
                        value={customSize || results.houseSize}
                        onChange={handleSizeChange}
                        min={500}
                        max={5000}
                        step={100}
                        marks
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value.toLocaleString()} sq ft`}
                        sx={{
                          color: '#2F7C31',
                          '& .MuiSlider-thumb': {
                            width: 24,
                            height: 24,
                            backgroundColor: '#fff',
                            border: '2px solid #2F7C31',
                            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                              boxShadow: 'inherit',
                            },
                            '&:before': {
                              display: 'none',
                            },
                          },
                          '& .MuiSlider-track': {
                            height: 8,
                            borderRadius: 4,
                          },
                          '& .MuiSlider-rail': {
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#E5E7EB',
                          },
                          '& .MuiSlider-mark': {
                            backgroundColor: '#E5E7EB',
                            height: 8,
                            width: 2,
                            '&.MuiSlider-markActive': {
                              backgroundColor: '#2F7C31',
                            },
                          },
                          '& .MuiSlider-markLabel': {
                            fontSize: '0.875rem',
                            color: '#6B7280',
                          },
                          '& .MuiSlider-valueLabel': {
                            backgroundColor: '#2F7C31',
                            color: '#FFFFFF',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            '&:before': {
                              display: 'none',
                            },
                            '& *': {
                              background: 'transparent',
                              color: '#FFFFFF',
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                {/* Windows Card */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: '24px',
                      bgcolor: '#FFFFFF',
                      height: '100%',
                      mb: { xs: 6, md: 0 },
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          bgcolor: '#F0FDF4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3
                        }}
                      >
                        <WindowIcon sx={{ fontSize: 28, color: '#2F7C31' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#1A2027', fontWeight: 600, mb: 3 }}>
                        Windows
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
                      <Typography variant="h3" sx={{ color: '#2F7C31', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {results.windows}
                      </Typography>
                      <Typography sx={{ color: '#4B5563', fontSize: '1.1rem' }}>
                        windows
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                      <Typography sx={{ color: '#4B5563', mb: 2, fontWeight: 500 }}>
                        Window Distribution
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            flex: 1,
                            p: 2,
                            bgcolor: '#F0FDF4',
                            borderRadius: '12px',
                            textAlign: 'center'
                          }}
                        >
                          <Typography sx={{ color: '#2F7C31', fontWeight: 600, mb: 1 }}>
                            {Math.round(results.windows * 0.6)}
                          </Typography>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>
                            Standard
                          </Typography>
                        </Paper>
                        <Paper
                          elevation={0}
                          sx={{
                            flex: 1,
                            p: 2,
                            bgcolor: '#F0FDF4',
                            borderRadius: '12px',
                            textAlign: 'center'
                          }}
                        >
                          <Typography sx={{ color: '#2F7C31', fontWeight: 600, mb: 1 }}>
                            {Math.round(results.windows * 0.4)}
                          </Typography>
                          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>
                            Large
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Energy Usage Card */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: '24px',
                      bgcolor: '#FFFFFF',
                      height: '100%',
                      mb: { xs: 6, md: 0 },
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          bgcolor: '#F0FDF4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3
                        }}
                      >
                        <BoltIcon sx={{ fontSize: 28, color: '#2F7C31' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#1A2027', fontWeight: 600, mb: 3 }}>
                        Energy Usage
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid rgba(47, 124, 49, 0.1)'
                        }}
                      >
                        <Typography variant="h4" sx={{ color: '#2F7C31', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                          {results.energy.electricity.toLocaleString()}
                        </Typography>
                        <Typography sx={{ color: '#4B5563', fontWeight: 500 }}>
                          kWh/year
                        </Typography>
                      </Paper>

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
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Fade>
      )}

      {/* Map Section */}
      {addressDetails && (
        <Fade in={!!addressDetails}>
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
              
              <Grid container spacing={{ xs: 3, md: 4 }}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
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
        </Fade>
      )}
    </Box>
  );
}

export default App; 