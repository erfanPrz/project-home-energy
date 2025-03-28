import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Window as WindowIcon,
  Bolt as BoltIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAddressDetails(null);
    setCustomSize(null);
    setIsEditing(false);

    // Check if input is a postal code
    const isPostalCode = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(searchQuery);
    
    if (!isPostalCode && searchQuery.length < 5) {
      setError('Please enter a valid Canadian postal code or full address');
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
      const postalCode = postalCodeComponent ? postalCodeComponent.long_name.replace(/\s/g, '') : searchQuery;
      
      const houseSize = estimateHouseSize(postalCode);
      const isRural = postalCode[1] === '0';
      const windows = estimateWindows(houseSize, isRural);
      const energy = estimateEnergyUsage(houseSize, postalCode);

      setResults({
        houseSize,
        windows,
        energy,
        isRural
      });
    } catch (err) {
      setError('An error occurred while processing your request');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = (event, newValue) => {
    setCustomSize(newValue);
    
    // Extract postal code from address components
    const postalCodeComponent = addressDetails.components.find(
      component => component.types.includes('postal_code')
    );
    const postalCode = postalCodeComponent ? postalCodeComponent.long_name.replace(/\s/g, '') : searchQuery;
    
    const isRural = postalCode[1] === '0';
    const windows = estimateWindows(newValue, isRural);
    const energy = estimateEnergyUsage(newValue, postalCode);

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
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          <HomeIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          House Estimator
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
            Enter a Canadian postal code or address to get started
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter Postal Code or Address"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              placeholder="M5V 2T6 or 123 Main Street, Toronto"
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LocationIcon />}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1cb5e0 90%)',
                  boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
                }
              }}
            >
              {loading ? 'Validating...' : 'Get Estimate'}
            </Button>
          </form>
        </Paper>

        {addressDetails && (
          <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1">
                {addressDetails.display_name}
              </Typography>
            </Box>
            {addressDetails?.components && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {addressDetails.components.map((component, index) => (
                  <Chip
                    key={index}
                    label={component.long_name}
                    size="small"
                    variant="outlined"
                    sx={{
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            )}
            <Box sx={{ mt: 2, height: '200px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
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
            </Box>
          </Paper>
        )}

        {results && (
          <Box sx={{ my: 4 }}>
            <Grid container spacing={4}>
              {/* House Size Card */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 5,
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                    borderRadius: 4,
                    position: 'relative',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box 
                      sx={{ 
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: '#FFE4D6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <HomeIcon sx={{ fontSize: 40, color: '#E67E22' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600,
                      color: '#2C3E50',
                      ml: 3
                    }}>
                      House Size
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 4 }}>
                    <Typography variant="h2" sx={{ 
                      color: '#2C3E50',
                      fontWeight: 700,
                      mb: 2
                    }}>
                      {results.houseSize}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '1.25rem',
                      color: '#7F8C8D'
                    }}>
                      square feet
                    </Typography>
                  </Box>

                  {isEditing ? (
                    <Slider
                      value={customSize || results.houseSize}
                      onChange={handleSizeChange}
                      min={500}
                      max={5000}
                      step={100}
                      marks
                      valueLabelDisplay="auto"
                      sx={{ 
                        '& .MuiSlider-track': { backgroundColor: '#E67E22' },
                        '& .MuiSlider-rail': { backgroundColor: '#FFE4D6' },
                        '& .MuiSlider-thumb': { backgroundColor: '#E67E22' }
                      }}
                    />
                  ) : (
                    <Button 
                      variant="outlined"
                      sx={{
                        alignSelf: 'flex-start',
                        color: '#E67E22',
                        borderColor: '#E67E22',
                        '&:hover': {
                          borderColor: '#E67E22',
                          backgroundColor: '#FFF5E6'
                        },
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '1.1rem',
                        px: 4,
                        py: 1.5
                      }}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Size
                    </Button>
                  )}
                </Paper>
              </Grid>

              {/* Windows Card */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 5,
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                    borderRadius: 4,
                    position: 'relative',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box 
                      sx={{ 
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: '#E3F2FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <WindowIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600,
                      color: '#2C3E50',
                      ml: 3
                    }}>
                      Windows
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 4 }}>
                    <Typography variant="h2" sx={{ 
                      color: '#2C3E50',
                      fontWeight: 700,
                      mb: 2
                    }}>
                      {results.windows}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '1.25rem',
                      color: '#7F8C8D'
                    }}>
                      total windows
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    pt: 4,
                    borderTop: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                        {Math.round(results.windows * 0.6)}
                      </Typography>
                      <Typography sx={{ fontSize: '1.1rem', color: '#7F8C8D' }}>
                        Standard Windows
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                        {Math.round(results.windows * 0.4)}
                      </Typography>
                      <Typography sx={{ fontSize: '1.1rem', color: '#7F8C8D' }}>
                        Large Windows
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Energy Usage Card */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 5,
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                    borderRadius: 4,
                    position: 'relative',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box 
                      sx={{ 
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: '#E8F5E9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <BoltIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600,
                      color: '#2C3E50',
                      ml: 3
                    }}>
                      Energy Usage
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 4 }}>
                    <Typography variant="h2" sx={{ 
                      color: '#2C3E50',
                      fontWeight: 700,
                      mb: 2
                    }}>
                      {results.energy.electricity}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '1.25rem',
                      color: '#7F8C8D'
                    }}>
                      kWh Electricity
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    pt: 4,
                    borderTop: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <Typography variant="h4" sx={{ 
                      color: '#2C3E50',
                      fontWeight: 700,
                      mb: 1
                    }}>
                      {results.energy.total}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '1.1rem',
                      color: '#7F8C8D'
                    }}>
                      GJ Total Energy
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App; 