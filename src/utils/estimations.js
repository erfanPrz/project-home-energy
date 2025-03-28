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
    "British Columbia": { electricity: 5.47, total: 0.0492 }
};

// Average house sizes by province (sq ft) - adjusted based on provincial data
const provincialHouseSizes = {
    "British Columbia": { urban: 1500, rural: 2200 },
    "Alberta": { urban: 1800, rural: 2400 },
    "Saskatchewan": { urban: 1600, rural: 2600 },
    "Manitoba": { urban: 1400, rural: 2200 },
    "Ontario": { urban: 1400, rural: 1800 },
    "Quebec": { urban: 1300, rural: 1700 },
    "New Brunswick": { urban: 1500, rural: 2000 },
    "Nova Scotia": { urban: 1400, rural: 1900 },
    "Prince Edward Island": { urban: 1300, rural: 1800 },
    "Newfoundland and Labrador": { urban: 1400, rural: 1900 }
};

// Rural postal code patterns by province
const ruralPatterns = {
    "British Columbia": (code) => code[1] === '0' || /^V[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Alberta": (code) => code[1] === '0' || /^T[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Saskatchewan": (code) => code[1] === '0' || /^S[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Manitoba": (code) => code[1] === '0' || /^R[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Ontario": (code) => code[1] === '0' || /^[KLMNP][1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Quebec": (code) => code[1] === '0' || /^[GHJ][1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "New Brunswick": (code) => code[1] === '0' || /^E[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Nova Scotia": (code) => code[1] === '0' || /^B[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Prince Edward Island": (code) => code[1] === '0' || /^C[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code),
    "Newfoundland and Labrador": (code) => code[1] === '0' || /^A[1-9][ABCDEFGJKLMNPQRSTUVWXYZ]/.test(code)
};

// Climate factors by province and region
const climateFactors = {
    "British Columbia": {
        coastal: { factor: 0.9, pattern: (code) => /^V[67]/.test(code) },  // Vancouver, Victoria
        northern: { factor: 1.2, pattern: (code) => /^V0/.test(code) },    // Northern BC
        interior: { factor: 1.1, pattern: (code) => true }                 // Default for BC
    },
    "Alberta": {
        northern: { factor: 1.2, pattern: (code) => /^T[01]/.test(code) }, // Northern Alberta
        southern: { factor: 1.0, pattern: (code) => true }                 // Default for Alberta
    },
    "Saskatchewan": {
        northern: { factor: 1.2, pattern: (code) => /^S[09]/.test(code) }, // Northern Saskatchewan
        southern: { factor: 1.0, pattern: (code) => true }                 // Default for Saskatchewan
    },
    "Manitoba": {
        northern: { factor: 1.2, pattern: (code) => /^R0/.test(code) },    // Northern Manitoba
        southern: { factor: 1.0, pattern: (code) => true }                 // Default for Manitoba
    },
    "Ontario": {
        northern: { factor: 1.15, pattern: (code) => /^P/.test(code) },    // Northern Ontario
        southern: { factor: 0.95, pattern: (code) => /^[ML]/.test(code) }, // Toronto, GTA
        central: { factor: 1.05, pattern: (code) => true }                 // Default for Ontario
    },
    "Quebec": {
        northern: { factor: 1.15, pattern: (code) => /^G/.test(code) },    // Northern Quebec
        southern: { factor: 0.95, pattern: (code) => /^H/.test(code) },    // Montreal
        central: { factor: 1.05, pattern: (code) => true }                 // Default for Quebec
    },
    "New Brunswick": {
        coastal: { factor: 0.95, pattern: (code) => /^E[12]/.test(code) }, // Saint John, Moncton
        inland: { factor: 1.05, pattern: (code) => true }                  // Default for NB
    },
    "Nova Scotia": {
        coastal: { factor: 0.95, pattern: (code) => /^B[3-9]/.test(code) }, // Halifax and coastal
        inland: { factor: 1.05, pattern: (code) => true }                   // Default for NS
    },
    "Prince Edward Island": {
        standard: { factor: 1.0, pattern: (code) => true }                  // All of PEI
    },
    "Newfoundland and Labrador": {
        coastal: { factor: 0.95, pattern: (code) => /^A[1-9]/.test(code) }, // St. John's and coastal
        inland: { factor: 1.05, pattern: (code) => true }                   // Default for NL
    }
};

export const estimateHouseSize = (postalCode, province) => {
    if (!province || !provincialHouseSizes[province]) {
        province = provinceMapping[postalCode[0]] || "Ontario";
    }

    // Determine if rural based on province-specific patterns
    const isRural = ruralPatterns[province] ? ruralPatterns[province](postalCode) : postalCode[1] === '0';
    const sizes = provincialHouseSizes[province];
    const baseSize = isRural ? sizes.rural : sizes.urban;
    
    // Local variation based on postal code second digit (±10% variation)
    const localFactor = 0.9 + (parseInt(postalCode[1]) * 0.02);
    
    return Math.round(baseSize * localFactor);
};

export const estimateWindows = (houseSize, isRural, province) => {
    // Base window ratios by province (windows per 1000 sq ft)
    const windowRatios = {
        "British Columbia": { urban: 6, rural: 8 },    // More windows for views
        "Alberta": { urban: 5, rural: 7 },             // Larger properties
        "Saskatchewan": { urban: 5, rural: 7 },        // Similar to Alberta
        "Manitoba": { urban: 4, rural: 6 },            // Standard ratio
        "Ontario": { urban: 4, rural: 6 },             // Standard ratio
        "Quebec": { urban: 4, rural: 6 },              // Standard ratio
        "New Brunswick": { urban: 5, rural: 7 },       // Coastal views
        "Nova Scotia": { urban: 5, rural: 7 },         // Coastal views
        "Prince Edward Island": { urban: 5, rural: 7 }, // Coastal views
        "Newfoundland and Labrador": { urban: 5, rural: 7 } // Coastal views
    };

    const ratios = windowRatios[province] || windowRatios["Ontario"];
    const baseRatio = isRural ? ratios.rural : ratios.urban;
    
    const calculatedWindows = Math.round((houseSize / 1000) * baseRatio);
    return Math.max(calculatedWindows, isRural ? 6 : 4);
};

export const estimateEnergyUsage = (houseSize, postalCode, province) => {
    if (!province || !energyPerSqft[province]) {
        province = provinceMapping[postalCode[0]] || "Ontario";
    }

    const energyData = energyPerSqft[province];
    const isRural = ruralPatterns[province] ? ruralPatterns[province](postalCode) : postalCode[1] === '0';
    
    // Get climate factor based on province and postal code
    let climateFactor = 1.0;
    const climate = climateFactors[province];
    
    if (climate) {
        // Find the matching climate region
        for (const region of Object.values(climate)) {
            if (region.pattern(postalCode)) {
                climateFactor = region.factor;
                break;
            }
        }
    }

    // Calculate energy adjustments
    const ruralFactor = isRural ? 1.15 : 1.0;  // Rural properties use 15% more energy
    const seasonalFactor = getSeasonalFactor(province);  // Adjust for seasonal variations
    
    // Calculate final energy usage
    const adjustedElectricity = houseSize * energyData.electricity * climateFactor * ruralFactor * seasonalFactor;
    const adjustedTotal = houseSize * energyData.total * climateFactor * ruralFactor * seasonalFactor;

    return {
        electricity: Math.round(adjustedElectricity),
        total: Number(adjustedTotal.toFixed(2))
    };
};

// Helper function to get seasonal adjustment factor
const getSeasonalFactor = (province) => {
    const seasonalFactors = {
        "British Columbia": 1.05,    // Mild winters, moderate summers
        "Alberta": 1.15,            // Cold winters, warm summers
        "Saskatchewan": 1.15,        // Cold winters, warm summers
        "Manitoba": 1.15,           // Cold winters, warm summers
        "Ontario": 1.10,            // Variable climate
        "Quebec": 1.10,             // Variable climate
        "New Brunswick": 1.10,       // Maritime climate
        "Nova Scotia": 1.05,         // Maritime climate
        "Prince Edward Island": 1.05, // Maritime climate
        "Newfoundland and Labrador": 1.10  // Cold climate
    };
    return seasonalFactors[province] || 1.10;
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