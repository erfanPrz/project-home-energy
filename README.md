# House Estimator

A modern React application that estimates house size, window count, and energy usage based on Canadian postal codes or addresses.

## Features

- **Address Validation**: Validates Canadian postal codes and addresses
- **House Size Estimation**: Calculates approximate house size based on location
- **Window Count**: Estimates the number of standard and large windows
- **Energy Usage**: Provides electricity usage in kWh and total energy in GJ
- **Interactive Map**: Displays the location using Google Maps integration
- **Customizable**: Allows manual adjustment of house size with real-time updates

## Technologies Used

- React
- Material-UI (MUI)
- Google Maps API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file and add your Google Maps API key:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Usage

1. Enter a Canadian postal code (e.g., M5V 2T6) or full address
2. Click "Get Estimate" to view results
3. View the estimated:
   - House size (in square feet)
   - Number of windows (split between standard and large)
   - Energy usage (electricity in kWh and total energy in GJ)
4. Adjust house size using the slider (optional)
5. View location on the embedded map

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
