# Energy & House Size Estimator MVP Documentation

Since this approach is based on estimation, I could achieve more accurate predictions using machine learning. However, my knowledge of AI is still limited, and I'm actively learning more. If You Given more time, I can develop a new approach using ML for a future version.

## Overview
This is a one-page React web app that estimates house size, number of windows, and energy usage based on a Canadian postal code or address. We aimed for a simple, realistic solution using Google Maps API and Statistics Canada data, providing accurate estimates based on local patterns and real stats.


## Objective
The app takes a postal code (e.g., "M5V 2T6") or address (e.g., "123 Main St, Toronto") and returns:
- Estimated house size in square feet (sqft)
- Estimated number of windows
- Average annual energy usage in kilowatt-hours (kWh) and gigajoules (GJ) for similar homes

## Tech Stack
- **Frontend**: React (JavaScript) for building the app, Material-UI (MUI) for a clean, responsive UI
- **APIs**:
  - Google Maps API: For address validation and geocoding
  - Google Maps Places API: For detailed address components
- **Data**: Statistics Canada Table 25-10-0060-01 (2021), a public dataset with province-level energy use

## How We Approached It

### House Size Estimation
**Goal**: Get a realistic size based on location and property type.

**Approach**: Use postal code patterns and province-specific averages.
1. First character determines province (e.g., "M" → Ontario)
2. Second character determines urban/rural status:
   - 0 (e.g., "K0A") → Rural → 1,800 sqft
   - 1-9 (e.g., "M5V") → Urban → 1,400 sqft

**Province-Specific House Sizes**:
```
Newfoundland and Labrador: Urban 1,400 sqft, Rural 1,800 sqft
Prince Edward Island: Urban 1,400 sqft, Rural 1,800 sqft
Nova Scotia: Urban 1,400 sqft, Rural 1,800 sqft
New Brunswick: Urban 1,400 sqft, Rural 1,800 sqft
Quebec: Urban 1,400 sqft, Rural 1,800 sqft
Ontario: Urban 1,400 sqft, Rural 1,800 sqft
Manitoba: Urban 1,400 sqft, Rural 1,800 sqft
Saskatchewan: Urban 1,400 sqft, Rural 1,800 sqft
Alberta: Urban 1,400 sqft, Rural 1,800 sqft
British Columbia: Urban 1,400 sqft, Rural 1,800 sqft
```

### Energy Usage Calculation
**Source**:
Statistics Canada Table 25-10-0060-01 (Household Energy Consumption, 2021).
**Details**:
Gives gigajoules (GJ) per household for electricity and total energy across 10 Canadian provinces.
Example: Ontario → 30.0 GJ electricity, 89.3 GJ total per household.
How Used:
Converted to energy per square foot using estimated provincial house sizes (e.g., Ontario: 30.0 GJ ÷ 1,600 sqft = 5.22 kWh/sqft for electricity).
Hardcoded in energyPerSqft object:
**for ex** :
```
"Ontario": { electricity: 5.22, total: 0.0558 }
"Alberta": { electricity: 3.58, total: 0.0677 }
```
**Adjustment Formula**:
- Rural (second char = 0): Base × 1.1
- Urban (second char = 1-9): Base × 0.9

### Window Estimation
**Goal**: Simple but not random.

**Approach**:
- Base: 1 window per 200 sqft
- Urban minimum: 4 windows
- Rural minimum: 8 windows
- Formula: Take the higher of base or minimum

## How Everything Fits Together

### User Flow
1. User types postal code/address
2. Google Maps API validates and geocodes the input
3. App determines province and urban/rural status
4. Calculates size, energy, windows
5. Shows results in MUI cards

### Key Functions
```javascript
// Address validation using Google Maps API
const validateAddress = async (address) => {
  // Implementation details...
};

// Estimation calculations
const estimateHouseSize = (postalCode) => {
  // Implementation details...
};

const estimateWindows = (houseSize, isRural) => {
  // Implementation details...
};

const estimateEnergyUsage = (houseSize, postalCode, province) => {
  // Implementation details...
};
```

### UI Components
1. **Search Form**
   - Text input with postal code/address validation
   - Submit button with loading state
   - Error message display
   - Clear input functionality

2. **Result Cards**
   - House Size Card with interactive slider
   - Windows Card showing total and distribution
   - Energy Usage Card with kWh and GJ values
   - Location Details with Google Maps integration

## What's Real vs. Mocked

### Real Data
- Energy data from Table 25-10-0060-01
- Address validation and geocoding from Google Maps API
- Province-specific energy rates
- Urban/rural classification based on postal code

### Mocked Data
- House Size: 1,400/1,800 sqft based on urban/rural status
- Windows: 1 per 200 sqft with minimums
- Energy Adjustment: ±10% urban/rural factor

## Dependencies
- React
- Material-UI (MUI)
- Axios
- Google Maps API
- Google Maps Places API


## Future Improvements
1. Additional province-specific data
2. Enhanced energy calculation models
3. More detailed property information
4. Historical data comparison
5. Energy saving recommendations
