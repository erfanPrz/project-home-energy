import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCiqVWo5XRjcyaYEyDbGIwU959fFPHe0rY';

export const validateAddress = async (searchQuery) => {
  try {
    // Clean and format the search query
    const cleanQuery = searchQuery.trim().toUpperCase();
    
    // If it's a postal code, add city and country to improve search accuracy
    const isPostalCode = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(cleanQuery.replace(/\s/g, ''));
    const searchAddress = isPostalCode 
      ? `${cleanQuery.replace(/\s/g, '')}, Toronto, Ontario, Canada`
      : `${cleanQuery}, Canada`;

    console.log('Searching for:', searchAddress);

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: searchAddress,
          components: 'country:CA',
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );

    console.log('API Response:', response.data);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      // Check if the result contains a postal code
      const hasPostalCode = result.address_components.some(component => 
        component.types.includes('postal_code')
      );

      if (!hasPostalCode) {
        return {
          success: false,
          error: 'Please enter a valid Canadian address with postal code'
        };
      }

      return {
        success: true,
        data: {
          display_name: result.formatted_address,
          lat: result.geometry.location.lat,
          lon: result.geometry.location.lng,
          components: result.address_components
        }
      };
    }

    return {
      success: false,
      error: 'No results found for this address. Please try a different address or postal code.'
    };
  } catch (error) {
    console.error('Google Maps API Error:', error);
    return {
      success: false,
      error: 'Error validating address. Please try again.'
    };
  }
}; 