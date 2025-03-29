# House Energy Estimator

A modern, mobile-responsive web application that provides instant estimates for house size, windows, and energy usage based on Canadian addresses.

## Features

- 📊 **Accurate Estimations**
  - House size calculation
  - Window count estimation
  - Energy usage prediction
  - Province-specific calculations

- 🗺️ **Location Details**
  - Interactive Google Maps integration
  - Detailed address information
  - Property type classification
  - Mobile-optimized map view

- 📱 **Mobile Responsive**
  - Optimized for all screen sizes
  - Touch-friendly controls
  - Adaptive layouts
  - Smooth animations

## Technologies Used

- React
- Material-UI (MUI)
- Google Maps API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key

## Usage

1. Enter a Canadian postal code or full address
2. Click "Get Estimate" or press Enter
3. View detailed results including:
   - Estimated house size
   - Window count
   - Energy usage
   - Location details
   - Interactive map

## Project Structure

```
house-estimator/
├── src/
│   ├── App.js           # Main application component
│   ├── utils/
│   │   ├── estimations.js     # Estimation calculation functions
│   │   └── addressValidation.js # Address validation functions
│   └── ...
└── public/
    └── index.html
```

## Features in Detail

### Address Validation
- Validates Canadian postal code format
- Supports full address lookup
- Displays address components as interactive chips

### House Size Card
- Shows estimated house size in square feet
- Interactive slider for custom size adjustment
- Updates all related estimates in real-time

### Windows Card
- Displays total window count
- Breaks down windows into standard (60%) and large (40%) categories
- Updates automatically when house size changes

### Energy Usage Card
- Shows electricity usage in kWh
- Displays total energy consumption in GJ
- Adjusts based on house size and location

