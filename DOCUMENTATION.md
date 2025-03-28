Energy & House Size Estimator MVP Documentation
Overview
This is a one-page React web app that estimates house size, number of windows, and energy usage based on a Canadian postal code or address. We aimed for a simple, realistic solution using free APIs and data, avoiding wild guesses by grounding estimates in local patterns and real stats.

Objective
The app takes a postal code (e.g., "M5V 2T6") or address (e.g., "123 Main St, Toronto") and returns:

Estimated house size in square feet (sqft).
Estimated number of windows.
Average annual energy usage in kilowatt-hours (kWh) and gigajoules (GJ) for similar homes.
Tech Stack
Frontend: React (JavaScript) for building the app, Material-UI (MUI) for a clean, responsive UI.
APIs:
OpenStreetMap Nominatim: Turns postal codes/addresses into coordinates.
OpenStreetMap Overpass: Gets building footprint data.
Data: Statistics Canada Table 25-10-0060-01 (2021), a public dataset you provided with province-level energy use.
How We Approached It
We wanted a simple algorithm that’s closer to reality than province-wide averages. Here’s how we tackled each part:

House Size:
Goal: Get a realistic size without guessing 1,600 sqft for everything.
Approach: Use OSM to check real buildings near the input location.
Step 1: Nominatim API geocodes the postal code (e.g., "M5V 2T6" → lat 43.645, lon -79.395).
Step 2: Overpass API fetches all buildings within 500 meters of those coordinates.
Step 3: Average their sizes. Since calculating exact areas needs extra tools, we mocked 1,076 sqft (100 sqm × 10.764 conversion) per building if data exists.
Fallback: If no buildings are found, use Canada Post’s rule:
Second character of postal code = 0 (e.g., "K0A") → Rural → 1,800 sqft (bigger homes).
Second character = 1-9 (e.g., "M5V") → Urban → 1,400 sqft (smaller homes/apartments).
Why: This reflects local housing (e.g., Toronto condos vs. rural Ontario houses) better than a single provincial number.
Energy Usage:
Goal: Base it on real data, adjusted for local differences.
Data Source: Table 25-10-0060-01 (2021) gives GJ per household for electricity and total energy by province.
Example: Ontario → 30.0 GJ electricity, 89.3 GJ total per household.
How We Got Numbers:
Took province averages (e.g., Ontario: 1,600 sqft from StatsCan/CMHC estimates).
Calculated energy per sqft:
Electricity: 30.0 GJ ÷ 1,600 sqft = 0.0188 GJ/sqft × 277.78 (GJ to kWh) = 5.22 kWh/sqft.
Total: 89.3 GJ ÷ 1,600 sqft = 0.0558 GJ/sqft.
Did this for all 10 provinces, creating:
text

Collapse

Wrap

Copy
Newfoundland and Labrador: 9.47 kWh/sqft, 0.0431 GJ/sqft
Prince Edward Island: 6.44 kWh/sqft, 0.0467 GJ/sqft
Nova Scotia: 6.86 kWh/sqft, 0.0441 GJ/sqft
New Brunswick: 10.42 kWh/sqft, 0.0428 GJ/sqft
Quebec: 11.42 kWh/sqft, 0.0455 GJ/sqft
Ontario: 5.22 kWh/sqft, 0.0558 GJ/sqft
Manitoba: 7.17 kWh/sqft, 0.0557 GJ/sqft
Saskatchewan: 4.11 kWh/sqft, 0.0596 GJ/sqft
Alberta: 3.58 kWh/sqft, 0.0677 GJ/sqft
British Columbia: 5.47 kWh/sqft, 0.0492 GJ/sqft
Formula: Adjusted for urban/rural:
Rural (second char = 0): Base × 1.1 (e.g., 5.22 × 1.1 = 5.74 kWh/sqft).
Urban (second char = 1-9): Base × 0.9 (e.g., 5.22 × 0.9 = 4.70 kWh/sqft).
Final: Size × Adjusted energy (e.g., 1,400 × 4.70 = 6,580 kWh/year).
Why: +10% for rural (bigger, less efficient) and -10% for urban (smaller, more efficient) reflect real trends without needing city-specific data.
Windows:
Goal: Simple but not random.
Approach:
Base: 1 window per 200 sqft (common ratio for homes).
Tweak: Urban min = 4 (apartments), Rural min = 8 (houses).
Formula: Take the higher of base or minimum (e.g., 1,400 ÷ 200 = 7, urban min 4 → 7 windows).
Why: Matches typical housing styles without complex data.
How Everything Fits Together
User Flow:
User types postal code/address → app geocodes it → fetches building data → calculates size, energy, windows → shows results in MUI cards.
Process:
Geocoding: Nominatim finds coordinates and province (first letter, e.g., "M" → Ontario).
Size: Overpass or urban/rural fallback.
Energy: Province base adjusted by postal code’s second character.
Windows: Size-based with urban/rural minimum.
UI: MUI form for input, cards for output (size, windows, energy).
Key Functions
fetchData: Geocodes input, gets building data, runs calculations.
handleSubmit: Triggers fetchData on form submit.
UI Components
Search Form: Text input, submit button, error message.
Result Cards (MUI):
House Size: Shows sqft.
Windows: Shows count.
Energy: Shows kWh/year and GJ/year.
What’s Real vs. Mocked
Real: Energy data from Table 25-10-0060-01, OSM building locations.
Real:Building LocationsCoordinates and presence of buildings from google map API and Overpass APIs.
Mocked:
Building Size: Averaged as 1,076 sqft if OSM data exists; fallback to 1,800 sqft (rural) or 1,400 sqft (urban).
Windows: 1 per 200 sqft, with minimums of 4 (urban) or 8 (rural).
House Size Fallback: Urban/rural sizes (1,400/1,800 sqft) when OSM lacks data.
Energy Adjustment: ±10% urban/rural factor applied to province data.