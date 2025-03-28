import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCiqVWo5XRjcyaYEyDbGIwU959fFPHe0rY';

// Map of postal code prefixes to provinces
const POSTAL_CODE_PROVINCES = {
  'A': 'Newfoundland and Labrador',
  'B': 'Nova Scotia',
  'C': 'Prince Edward Island',
  'E': 'New Brunswick',
  'G': 'Quebec',
  'H': 'Quebec',
  'J': 'Quebec',
  'K': 'Ontario',
  'L': 'Ontario',
  'M': 'Ontario',
  'N': 'Ontario',
  'P': 'Ontario',
  'R': 'Manitoba',
  'S': 'Saskatchewan',
  'T': 'Alberta',
  'V': 'British Columbia',
  'X': 'Northwest Territories and Nunavut',
  'Y': 'Yukon'
};

export const validateAddress = async (searchQuery) => {
  try {
    // Clean and format the search query
    const cleanQuery = searchQuery.trim().toUpperCase();
    
    // If it's a postal code, add country to improve search accuracy
    const isPostalCode = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(cleanQuery.replace(/\s/g, ''));
    let searchAddress;
    
    if (isPostalCode) {
      const postalCode = cleanQuery.replace(/\s/g, '');
      const province = POSTAL_CODE_PROVINCES[postalCode[0]];
      searchAddress = `${postalCode}, ${province || ''}, Canada`;
    } else {
      searchAddress = `${cleanQuery}, Canada`;
    }

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

      // Verify the postal code matches if one was provided
      if (isPostalCode) {
        const resultPostalCode = result.address_components
          .find(component => component.types.includes('postal_code'))
          ?.long_name.replace(/\s/g, '').toUpperCase();
        
        if (resultPostalCode !== cleanQuery.replace(/\s/g, '')) {
          return {
            success: false,
            error: 'The provided postal code could not be found. Please verify and try again.'
          };
        }
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