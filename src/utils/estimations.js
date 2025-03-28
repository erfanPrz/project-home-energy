// Energy data per province (2021)
export const energyPerSqft = {
    "Newfoundland and Labrador": { electricity: 9.47, total: 0.0431 },
    "Prince Edward Island": { electricity: 6.44, total: 0.0467 },
    "Nova Scotia": { electricity: 6.86, total: 0.0441 },
    "New Brunswick": { electricity: 10.42, total: 0.0428 },
    "Quebec": { electricity: 11.42, total: 0.0455 },
    "Ontario": { electricity: 5.22, total: 0.0558 },
    "Manitoba": { electricity: 7.17, total: 0.0557 },
    "Saskatchewan": { electricity: 4.11, total: 0.0596 },
    "Alberta": { electricity: 3.58, total: 0.0677 },
    "British Columbia": { electricity: 5.47, total: 0.0492 },
  };
  
  // Province mapping from postal code first letter
  export const provinceMapping = {
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
    'X': 'Nunavut/Northwest Territories',
    'Y': 'Yukon'
  };
  
  export const estimateHouseSize = (postalCode) => {
    // Simple estimation based on postal code pattern
    const isRural = postalCode[1] === '0';
    return isRural ? 1800 : 1400; // sqft
  };
  
  export const estimateWindows = (houseSize, isRural) => {
    const baseWindows = Math.floor(houseSize / 200);
    const minWindows = isRural ? 8 : 4;
    return Math.max(baseWindows, minWindows);
  };
  
  export const estimateEnergyUsage = (houseSize, postalCode) => {
    const isRural = postalCode[1] === '0';
    const province = provinceMapping[postalCode[0]];
    const energyData = energyPerSqft[province] || energyPerSqft['Ontario']; // Fallback to Ontario
  
    const adjustmentFactor = isRural ? 1.1 : 0.9;
    
    return {
      electricity: Math.round(houseSize * energyData.electricity * adjustmentFactor),
      total: (houseSize * energyData.total * adjustmentFactor).toFixed(2)
    };
  }; 