// Powell River Frequencies
export const EMERGENCY_FREQUENCY = 146.52; // National Calling

// Signal Report Options
export const SIGNAL_REPORT_OPTIONS = [
  { value: "59", label: "5-9 (Excellent)" },
  { value: "58", label: "5-8 (Very Good)" },
  { value: "57", label: "5-7 (Good)" },
  { value: "56", label: "5-6 (Good with Noise)" },
  { value: "55", label: "5-5 (Fair)" },
  { value: "54", label: "5-4 (Fair with Noise)" },
  { value: "53", label: "5-3 (Readable with Difficulty)" },
  { value: "52", label: "5-2 (Barely Readable)" },
  { value: "51", label: "5-1 (Unreadable)" },
];

// Frequency Categories
export const FREQUENCY_CATEGORIES = [
  "VHF",
  "UHF",
  "HF",
  "Marine",
  "Aviation",
  "Emergency"
];

// Reference Categories
export const REFERENCE_CATEGORIES = [
  "Emergency Protocols",
  "Q Codes",
  "Phonetic Alphabet",
  "Signal Reports",
  "Powell River Amateur Radio Club"
];

// Powell River Location
export const POWELL_RIVER_LOCATION = {
  lat: 49.8352,
  lng: -124.5247,
  name: "Powell River, BC"
};
