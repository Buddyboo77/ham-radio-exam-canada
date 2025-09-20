// Ham Radio Exam Question Generator
// Generates thousands of realistic practice questions for Canadian amateur radio licensing

import { storage } from "./storage";
import type { InsertExamQuestion } from "@shared/schema";

// Categories for Canadian Amateur Radio Exam
const CATEGORIES = {
  regulations: "regulations",
  operating: "operating", 
  technical: "technical",
  antenna: "antenna",
  safety: "safety",
  digital: "digital",
  emergency: "emergency"
} as const;

// Canadian Amateur Radio Question Bank Data
const QUESTION_TEMPLATES = {
  regulations: {
    subcategories: [
      "License Classes",
      "Band Plans", 
      "Power Limits",
      "International Operation",
      "Station Identification",
      "Operating Privileges",
      "RF Exposure Limits",
      "Spurious Emissions",
      "Third Party Traffic",
      "ISED Regulations"
    ],
    templates: [
      {
        question: "What is the maximum DC power input allowed for Canadian amateur operators with {qualification} qualification?",
        options: ["{correctPower}", "{wrongPower1}", "{wrongPower2}", "{wrongPower3}"],
        correctAnswer: 0,
        explanation: "Amateur operators with {qualification} qualification in Canada are limited to {correctPower} DC power input according to ISED regulations.",
        variables: {
          qualification: ["Basic", "Basic with Honours", "Advanced"],
          correctPower: ["250 watts", "1000 watts", "1000 watts"],
          wrongPower1: ["100 watts", "250 watts", "250 watts"],
          wrongPower2: ["500 watts", "500 watts", "500 watts"], 
          wrongPower3: ["1500 watts", "1500 watts", "1500 watts"]
        }
      },
      {
        question: "Which frequency range is allocated to the Canadian {band} amateur band?",
        options: ["{correctRange}", "{wrongRange1}", "{wrongRange2}", "{wrongRange3}"],
        correctAnswer: 0,
        explanation: "The {band} amateur band in Canada is allocated to {correctRange}.",
        variables: {
          band: ["2-meter", "70 cm", "10-meter", "40-meter", "20-meter", "80-meter", "6-meter"],
          correctRange: ["144-148 MHz", "420-450 MHz", "28-29.7 MHz", "7.0-7.3 MHz", "14.0-14.35 MHz", "3.5-4.0 MHz", "50-54 MHz"],
          wrongRange1: ["136-144 MHz", "430-440 MHz", "21-21.45 MHz", "3.5-4.0 MHz", "21.0-21.45 MHz", "7.0-7.3 MHz", "28-29.7 MHz"],
          wrongRange2: ["148-152 MHz", "440-470 MHz", "24.89-24.99 MHz", "14.0-14.35 MHz", "28-29.7 MHz", "1.8-2.0 MHz", "144-148 MHz"],
          wrongRange3: ["138-146 MHz", "410-430 MHz", "18.068-18.168 MHz", "1.8-2.0 MHz", "7.0-7.3 MHz", "14.0-14.35 MHz", "420-450 MHz"]
        }
      },
      {
        question: "As a Canadian amateur, what prefix would you use for portable operation in {country}?",
        options: ["{correctPrefix}", "{wrongPrefix1}", "{wrongPrefix2}", "{wrongPrefix3}"],
        correctAnswer: 0,
        explanation: "When operating in {country}, Canadian amateurs should use the format {correctPrefix}, indicating the {country} prefix followed by your Canadian call sign.",
        variables: {
          country: ["the U.S.", "the U.K.", "Australia", "New Zealand"],
          correctPrefix: ["W/VE7XXX", "M/VE7XXX", "VK/VE7XXX", "ZL/VE7XXX"],
          wrongPrefix1: ["K/VE7XXX", "G/VE7XXX", "VE7XXX/VK", "VE7XXX/ZL"],
          wrongPrefix2: ["VE7XXX/W", "VE7XXX/M", "VE7XXX/VK", "VE7XXX/ZL"],
          wrongPrefix3: ["VE7XXX/K", "VE7XXX/G", "VK7XXX", "ZL7XXX"]
        }
      },
      {
        question: "Which of the following bands requires special authorization in Canada?",
        options: ["{correctBand}", "{wrongBand1}", "{wrongBand2}", "{wrongBand3}"],
        correctAnswer: 0,
        explanation: "In Canada, the {correctBand} requires special authorization and has specific restrictions on power and modes.",
        variables: {
          correctBand: ["60 m (5 MHz channels)", "630 m (472-479 kHz)", "2200 m (135.7-137.8 kHz)"],
          wrongBand1: ["70 cm (430-450 MHz)", "10 m (28-29.7 MHz)", "40 m (7.0-7.3 MHz)"],
          wrongBand2: ["2 m (144-148 MHz)", "6 m (50-54 MHz)", "20 m (14.0-14.35 MHz)"],
          wrongBand3: ["80 m (3.5-4.0 MHz)", "15 m (21.0-21.45 MHz)", "17 m (18.068-18.168 MHz)"]
        }
      },
      {
        question: "What is the required station identification interval for Canadian amateur stations?",
        options: ["Every 10 minutes", "Every 30 minutes", "Every 5 minutes", "Every 15 minutes"],
        correctAnswer: 0,
        explanation: "Canadian amateur stations must identify every 10 minutes during transmission and at the end of each communication.",
        variables: {}
      },
      {
        question: "Which organization is responsible for licensing amateur radio operators in Canada?",
        options: ["ISED (Innovation, Science and Economic Development Canada)", "RAC (Radio Amateurs of Canada)", "ARRL (American Radio Relay League)", "CRTC (Canadian Radio-television and Telecommunications Commission)"],
        correctAnswer: 0,
        explanation: "Innovation, Science and Economic Development Canada (ISED), formerly Industry Canada, administers amateur radio regulations in Canada.",
        variables: {}
      }
    ]
  },
  
  operating: {
    subcategories: [
      "Repeater Operation",
      "Q Signals", 
      "Phonetic Alphabet",
      "RST System",
      "Band Plans",
      "Operating Procedures",
      "Emergency Communications",
      "Digital Modes",
      "Contest Operation",
      "DX Operation"
    ],
    templates: [
      {
        question: "What does the Q-signal {qSignal} mean?",
        options: ["{correctMeaning}", "{wrongMeaning1}", "{wrongMeaning2}", "{wrongMeaning3}"],
        correctAnswer: 0,
        explanation: "{qSignal} means '{correctMeaning}'. Q-signals are shorthand codes used in radio communications.",
        variables: {
          qSignal: ["QSY", "QRT", "QRZ", "QTH", "QRM", "QRN", "QRP", "QSL", "QSO", "QSB"],
          correctMeaning: [
            "I am changing frequency",
            "Stop transmitting",
            "Who is calling me?",
            "My location is",
            "Man-made interference",
            "Atmospheric noise",
            "Low power operation",
            "Confirmation received",
            "Communication",
            "Fading signal"
          ],
          wrongMeaning1: [
            "I am listening",
            "I am calling",
            "Change frequency",
            "What time is it?",
            "Atmospheric noise", 
            "Man-made interference",
            "High power operation",
            "Please confirm",
            "Emergency traffic",
            "Clear signal"
          ],
          wrongMeaning2: [
            "Please repeat",
            "Please wait",
            "Please respond",
            "Who are you?",
            "Clear signal",
            "Weak signal",
            "Medium power",
            "Message received",
            "End of transmission",
            "Strong signal"
          ],
          wrongMeaning3: [
            "Emergency traffic",
            "Call again",
            "I am busy",
            "Weather report",
            "Weak signal",
            "Fading signal",
            "Full power",
            "Negative",
            "Frequency change",
            "No signal"
          ]
        }
      },
      {
        question: "In the RST signal reporting system, what does the '{letter}' stand for?",
        options: ["{correctMeaning}", "{wrongMeaning1}", "{wrongMeaning2}", "{wrongMeaning3}"],
        correctAnswer: 0,
        explanation: "In the RST (Readability, Strength, Tone) signal reporting system, '{letter}' stands for {correctMeaning}.",
        variables: {
          letter: ["R", "S", "T"],
          correctMeaning: ["Readability", "Strength", "Tone"],
          wrongMeaning1: ["Reliability", "Signal", "Time"],
          wrongMeaning2: ["Reception", "Sound", "Transmitter"],
          wrongMeaning3: ["Radio", "Station", "Throughput"]
        }
      },
      {
        question: "What is the correct way to call CQ on a repeater?",
        options: [
          "This is {callsign}, anyone around for a chat?",
          "CQ CQ CQ, this is {callsign} calling CQ and listening",
          "{callsign} listening",
          "CQ DX, CQ DX, this is {callsign}"
        ],
        correctAnswer: 0,
        explanation: "On a repeater, it's customary to simply announce your callsign and that you're listening or available for a chat. 'CQ' calls are typically used on HF bands.",
        variables: {
          callsign: ["VE7ABC", "VE3XYZ", "VE1DEF", "VE2GHI", "VE4JKL", "VE5MNO", "VE6PQR", "VE8STU", "VE9VWX", "VY0YZA"]
        }
      },
      {
        question: "What does the term '{term}' refer to?",
        options: ["{correctMeaning}", "{wrongMeaning1}", "{wrongMeaning2}", "{wrongMeaning3}"],
        correctAnswer: 0,
        explanation: "{term} refers to {correctMeaning}.",
        variables: {
          term: ["QRM", "QRN", "QSB", "QRP", "APRS", "IRLP", "EchoLink", "Winlink"],
          correctMeaning: [
            "Man-made interference",
            "Atmospheric noise", 
            "Signal fading",
            "Low power operation",
            "Automatic Packet Reporting System",
            "Internet Radio Linking Project",
            "Voice over Internet Protocol for amateur radio",
            "Email over radio system"
          ],
          wrongMeaning1: [
            "Atmospheric noise",
            "Man-made interference",
            "Signal strength",
            "High power operation", 
            "Amateur Position Radio Service",
            "International Radio Link Protocol",
            "Emergency Communication Link",
            "Wireless Internet Link"
          ],
          wrongMeaning2: [
            "Fading signals",
            "Weak signals",
            "Clear signals",
            "Medium power",
            "Automated Position Reporting Service",
            "Internet Relay Link Protocol", 
            "Electronic Communication Link",
            "Weather Information Network Link"
          ],
          wrongMeaning3: [
            "A good readable signal",
            "Strong signals",
            "Stable signals",
            "Emergency power",
            "Automatic Position Radio System",
            "Internet Radio Link Protocol",
            "Emergency Communication Hub Link",
            "Worldwide Information Network Link"
          ]
        }
      }
    ]
  },

  technical: {
    subcategories: [
      "Ohm's Law",
      "AC/DC Circuits", 
      "Capacitors",
      "Inductors",
      "Resistors",
      "Transistors",
      "Diodes",
      "Operational Amplifiers",
      "Oscillators",
      "Filters",
      "Amplifiers",
      "Power Supplies",
      "Modulation",
      "Frequency",
      "Wavelength"
    ],
    templates: [
      {
        question: "Which component is used to store electrical energy in an electric field?",
        options: ["Capacitor", "Inductor", "Resistor", "Diode"],
        correctAnswer: 0,
        explanation: "A capacitor stores electrical energy in an electric field between its plates.",
        variables: {}
      },
      {
        question: "What is the resonant frequency of a circuit with a {inductance} inductor and a {capacitance} capacitor?",
        options: ["{correctFreq}", "{wrongFreq1}", "{wrongFreq2}", "{wrongFreq3}"],
        correctAnswer: 0,
        explanation: "Using the formula f = 1/(2π√LC), the resonant frequency is {correctFreq}.",
        variables: {
          inductance: ["10 µH", "1 µH", "100 µH", "1 mH", "10 mH"],
          capacitance: ["100 pF", "1000 pF", "10 pF", "1 nF", "100 nF"],
          correctFreq: ["5.03 MHz", "5.03 MHz", "15.9 MHz", "5.03 kHz", "503 Hz"],
          wrongFreq1: ["1.59 MHz", "1.59 MHz", "5.03 MHz", "1.59 kHz", "159 Hz"],
          wrongFreq2: ["15.9 MHz", "15.9 MHz", "50.3 MHz", "15.9 kHz", "1.59 kHz"],
          wrongFreq3: ["50.3 MHz", "50.3 MHz", "159 MHz", "50.3 kHz", "5.03 kHz"]
        }
      },
      {
        question: "What is the velocity factor of a typical {cableType}?",
        options: ["{correctVF}", "{wrongVF1}", "{wrongVF2}", "{wrongVF3}"],
        correctAnswer: 0,
        explanation: "The velocity factor of a typical {cableType} is {correctVF}, meaning radio waves travel at about {percent}% of the speed of light through the cable.",
        variables: {
          cableType: ["coaxial cable", "twin-lead cable", "ladder line", "hardline coax"],
          correctVF: ["0.66", "0.82", "0.95", "0.88"],
          wrongVF1: ["1.0", "0.66", "0.82", "0.66"],
          wrongVF2: ["0.1", "1.0", "0.66", "1.0"],
          wrongVF3: ["2.0", "0.1", "1.0", "0.1"],
          percent: ["66", "82", "95", "88"]
        }
      },
      {
        question: "According to Ohm's law, if the voltage across a resistor is {voltage} and the current through it is {current}, what is the resistance?",
        options: ["{correctResistance}", "{wrongResistance1}", "{wrongResistance2}", "{wrongResistance3}"],
        correctAnswer: 0,
        explanation: "Using Ohm's law (R = V/I), the resistance is {voltage} ÷ {current} = {correctResistance}.",
        variables: {
          voltage: ["12 V", "24 V", "5 V", "9 V", "15 V"],
          current: ["2 A", "4 A", "1 A", "3 A", "5 A"],
          correctResistance: ["6 Ω", "6 Ω", "5 Ω", "3 Ω", "3 Ω"],
          wrongResistance1: ["24 Ω", "96 Ω", "5 kΩ", "27 Ω", "75 Ω"],
          wrongResistance2: ["14 Ω", "28 Ω", "6 Ω", "12 Ω", "20 Ω"],
          wrongResistance3: ["10 Ω", "20 Ω", "4 Ω", "6 Ω", "10 Ω"]
        }
      },
      {
        question: "What happens to the reactance of a capacitor as frequency increases?",
        options: ["It decreases", "It increases", "It remains constant", "It becomes zero"],
        correctAnswer: 0,
        explanation: "Capacitive reactance (Xc = 1/(2πfC)) is inversely proportional to frequency, so it decreases as frequency increases.",
        variables: {}
      },
      {
        question: "What type of modulation is used in {mode}?",
        options: ["{correctModulation}", "{wrongModulation1}", "{wrongModulation2}", "{wrongModulation3}"],
        correctAnswer: 0,
        explanation: "{mode} uses {correctModulation} modulation.",
        variables: {
          mode: ["FM voice communications", "AM broadcast radio", "SSB voice", "CW transmission", "FT8 digital mode"],
          correctModulation: ["Frequency modulation", "Amplitude modulation", "Single sideband", "On-off keying", "Frequency shift keying"],
          wrongModulation1: ["Amplitude modulation", "Frequency modulation", "Amplitude modulation", "Frequency modulation", "Amplitude modulation"],
          wrongModulation2: ["Phase modulation", "Phase modulation", "Frequency modulation", "Amplitude modulation", "Phase modulation"],
          wrongModulation3: ["Pulse modulation", "Single sideband", "Phase modulation", "Phase modulation", "Pulse modulation"]
        }
      }
    ]
  },

  antenna: {
    subcategories: [
      "Dipole Antennas",
      "Vertical Antennas",
      "Yagi Antennas", 
      "Loop Antennas",
      "Antenna Gain",
      "SWR",
      "Feedlines",
      "Antenna Tuners",
      "Antenna Modeling",
      "Antenna Safety"
    ],
    templates: [
      {
        question: "What is the approximate length of a half-wave dipole for {frequency}?",
        options: ["{correctLength}", "{wrongLength1}", "{wrongLength2}", "{wrongLength3}"],
        correctAnswer: 0,
        explanation: "A half-wave dipole for {frequency} is approximately {correctLength} long, calculated using the formula 468/frequency in MHz.",
        variables: {
          frequency: ["146 MHz", "7.0 MHz", "14.0 MHz", "28.0 MHz", "3.7 MHz", "21.0 MHz", "446 MHz"],
          correctLength: ["3.2 feet", "66.9 feet", "33.4 feet", "16.7 feet", "126.5 feet", "22.3 feet", "1.05 feet"],
          wrongLength1: ["6.4 feet", "33.4 feet", "66.9 feet", "33.4 feet", "63.2 feet", "44.6 feet", "2.1 feet"],
          wrongLength2: ["1.6 feet", "133.8 feet", "16.7 feet", "8.3 feet", "253 feet", "11.1 feet", "0.52 feet"],
          wrongLength3: ["12.8 feet", "22.3 feet", "126.5 feet", "66.9 feet", "42.1 feet", "66.9 feet", "4.2 feet"]
        }
      },
      {
        question: "What is the purpose of an RF choke in an antenna system?",
        options: [
          "To block RF current on the outside of a coaxial cable",
          "To match impedances",
          "To filter DC power",
          "To reduce harmonic radiation"
        ],
        correctAnswer: 0,
        explanation: "An RF choke in an antenna system is used to block unwanted RF current from flowing on the outside of a coaxial cable shield.",
        variables: {}
      },
      {
        question: "What does an SWR reading of {swr} indicate?",
        options: ["{interpretation}", "{wrongInterpretation1}", "{wrongInterpretation2}", "{wrongInterpretation3}"],
        correctAnswer: 0,
        explanation: "An SWR of {swr} indicates {interpretation}.",
        variables: {
          swr: ["1.0:1", "1.5:1", "3.0:1", "∞:1"],
          interpretation: [
            "Perfect impedance match",
            "Acceptable impedance match", 
            "Poor impedance match requiring attention",
            "Complete impedance mismatch"
          ],
          wrongInterpretation1: [
            "High reflection",
            "Perfect impedance match",
            "Acceptable impedance match",
            "Good impedance match"
          ],
          wrongInterpretation2: [
            "No power transfer",
            "Poor impedance match",
            "Perfect impedance match",
            "Partial impedance match"
          ],
          wrongInterpretation3: [
            "Antenna damage",
            "High reflection",
            "Good impedance match",
            "No impedance mismatch"
          ]
        }
      },
      {
        question: "Which type of antenna has the highest gain?",
        options: ["Yagi array", "Dipole", "Quarter-wave vertical", "Loop antenna"],
        correctAnswer: 0,
        explanation: "A Yagi array antenna typically has the highest gain among these options, providing directional characteristics and signal focusing.",
        variables: {}
      },
      {
        question: "What is the characteristic impedance of most amateur radio coaxial cables?",
        options: ["50 ohms", "75 ohms", "300 ohms", "600 ohms"],
        correctAnswer: 0,
        explanation: "Most amateur radio coaxial cables have a characteristic impedance of 50 ohms, which matches typical amateur radio equipment.",
        variables: {}
      }
    ]
  },

  safety: {
    subcategories: [
      "RF Exposure",
      "Electrical Safety",
      "Antenna Safety",
      "Tower Safety",
      "Lightning Protection",
      "Station Grounding",
      "Emergency Procedures",
      "First Aid",
      "SAR Limits",
      "Safe Operating Practices"
    ],
    templates: [
      {
        question: "What is the maximum permissible exposure (MPE) limit for the general public in the {band} band?",
        options: ["{correctMPE}", "{wrongMPE1}", "{wrongMPE2}", "{wrongMPE3}"],
        correctAnswer: 0,
        explanation: "The MPE limit for the general public in the {band} band is {correctMPE} according to Health Canada Safety Code 6.",
        variables: {
          band: ["VHF", "UHF", "HF"],
          correctMPE: ["1 mW/cm²", "5 mW/cm²", "10 mW/cm²"],
          wrongMPE1: ["5 mW/cm²", "1 mW/cm²", "1 mW/cm²"],
          wrongMPE2: ["10 mW/cm²", "10 mW/cm²", "5 mW/cm²"],
          wrongMPE3: ["100 mW/cm²", "100 mW/cm²", "100 mW/cm²"]
        }
      },
      {
        question: "Why should you never work alone when {activity}?",
        options: [
          "Safety requires having someone to assist in case of emergency",
          "It violates amateur radio regulations",
          "It reduces work efficiency",
          "It prevents proper grounding"
        ],
        correctAnswer: 0,
        explanation: "When {activity}, you should never work alone because safety requires having someone to assist in case of emergency, injury, or equipment failure.",
        variables: {
          activity: [
            "climbing towers",
            "working on high-voltage equipment",
            "installing outdoor antennas",
            "working with RF amplifiers"
          ]
        }
      },
      {
        question: "What is the primary purpose of station grounding?",
        options: [
          "Safety and RF interference reduction",
          "Reducing transmitter power consumption",
          "Improving antenna radiation efficiency",
          "Meeting building code requirements"
        ],
        correctAnswer: 0,
        explanation: "The primary purpose of station grounding is safety (protection from electrical shock) and RF interference reduction.",
        variables: {}
      },
      {
        question: "Which of the following is the most important safety consideration when installing outdoor antennas?",
        options: [
          "Avoiding contact with power lines",
          "Using corrosion-resistant materials",
          "Minimizing visual impact",
          "Reducing wind loading"
        ],
        correctAnswer: 0,
        explanation: "The most important safety consideration when installing outdoor antennas is avoiding contact with power lines, which can be fatal.",
        variables: {}
      },
      {
        question: "At what power level does an amateur station require an RF exposure evaluation?",
        options: ["{correctPower}", "{wrongPower1}", "{wrongPower2}", "{wrongPower3}"],
        correctAnswer: 0,
        explanation: "An amateur station requires an RF exposure evaluation when transmitting at {correctPower} or more.",
        variables: {
          correctPower: ["25 watts"],
          wrongPower1: ["5 watts"],
          wrongPower2: ["100 watts"],
          wrongPower3: ["250 watts"]
        }
      }
    ]
  },

  digital: {
    subcategories: [
      "Packet Radio",
      "APRS",
      "PSK31",
      "FT8/FT4",
      "RTTY",
      "Digital Voice",
      "Winlink",
      "D-STAR",
      "DMR",
      "System Fusion"
    ],
    templates: [
      {
        question: "What does APRS stand for?",
        options: [
          "Automatic Packet Reporting System",
          "Amateur Position Reporting System", 
          "Automated Position Radio Service",
          "Amateur Packet Radio Service"
        ],
        correctAnswer: 0,
        explanation: "APRS stands for Automatic Packet Reporting System, which is used for real-time digital communications for local situational awareness.",
        variables: {}
      },
      {
        question: "Which of the following is NOT a digital mode used in amateur radio?",
        options: ["CDMA", "PSK31", "RTTY", "FT8"],
        correctAnswer: 0,
        explanation: "CDMA (Code Division Multiple Access) is a commercial cellular technology, not an amateur radio digital mode.",
        variables: {}
      },
      {
        question: "What is the typical baud rate for {mode}?",
        options: ["{correctBaud}", "{wrongBaud1}", "{wrongBaud2}", "{wrongBaud3}"],
        correctAnswer: 0,
        explanation: "{mode} typically operates at {correctBaud}.",
        variables: {
          mode: ["PSK31", "RTTY", "Packet radio", "APRS"],
          correctBaud: ["31.25 baud", "45.45 baud", "1200 baud", "1200 baud"],
          wrongBaud1: ["45.45 baud", "31.25 baud", "300 baud", "300 baud"],
          wrongBaud2: ["1200 baud", "1200 baud", "9600 baud", "9600 baud"],
          wrongBaud3: ["9600 baud", "9600 baud", "19200 baud", "19200 baud"]
        }
      },
      {
        question: "Which digital mode is designed for weak signal communication?",
        options: ["FT8", "RTTY", "Packet", "PSK31"],
        correctAnswer: 0,
        explanation: "FT8 is specifically designed for weak signal communication, using advanced error correction and signal processing techniques.",
        variables: {}
      },
      {
        question: "What does DMR stand for in amateur radio?",
        options: [
          "Digital Mobile Radio",
          "Digital Mode Radio",
          "Direct Mode Radio", 
          "Digital Message Radio"
        ],
        correctAnswer: 0,
        explanation: "DMR stands for Digital Mobile Radio, a digital voice protocol used in amateur radio repeater systems.",
        variables: {}
      }
    ]
  },

  emergency: {
    subcategories: [
      "Emergency Communications",
      "Health and Welfare Traffic",
      "Emergency Nets",
      "Message Handling",
      "Emergency Power",
      "Go Kits",
      "EMCOMM Protocols", 
      "ICS Integration",
      "Public Service",
      "Disaster Response"
    ],
    templates: [
      {
        question: "What is the first priority in emergency communications?",
        options: [
          "Life safety communications",
          "Health and welfare traffic",
          "Equipment damage reports",
          "Logistics coordination"
        ],
        correctAnswer: 0,
        explanation: "In emergency communications, life safety communications always takes first priority over all other traffic.",
        variables: {}
      },
      {
        question: "Which frequency is designated as the national emergency frequency in Canada?",
        options: [
          "146.520 MHz",
          "145.500 MHz",
          "147.420 MHz",
          "144.390 MHz"
        ],
        correctAnswer: 0,
        explanation: "146.520 MHz is designated as the national emergency frequency in Canada for VHF communications.",
        variables: {}
      },
      {
        question: "In emergency communications, what does the term 'health and welfare traffic' refer to?",
        options: [
          "Non-emergency messages about personal well-being",
          "Medical emergency reports",
          "Emergency shelter requests",
          "First aid instructions"
        ],
        correctAnswer: 0,
        explanation: "Health and welfare traffic refers to non-emergency messages that allow people to communicate their personal well-being to family and friends.",
        variables: {}
      },
      {
        question: "What should be included in a basic amateur radio emergency 'go kit'?",
        options: [
          "Handheld radio, spare batteries, emergency power source, notebook",
          "Base station radio, AC power supply, computer",
          "Mobile radio, vehicle charger only",
          "Repeater equipment, high-gain antenna"
        ],
        correctAnswer: 0,
        explanation: "A basic emergency 'go kit' should include portable equipment that can operate independently: handheld radio, spare batteries, emergency power source, and materials for logging communications.",
        variables: {}
      },
      {
        question: "When should an amateur operator declare an emergency on the air?",
        options: [
          "When there is immediate danger to life or property",
          "When unable to contact a repeater",
          "When experiencing equipment failure",
          "When wanting priority access to a frequency"
        ],
        correctAnswer: 0,
        explanation: "An amateur operator should only declare an emergency when there is immediate danger to life or property requiring urgent assistance.",
        variables: {}
      }
    ]
  }
};

// Advanced question generation functions
function generateVariableQuestion(template: any, category: string, subcategory: string): InsertExamQuestion {
  const question = { ...template };
  
  // If template has variables, substitute them
  if (question.variables && Object.keys(question.variables).length > 0) {
    const variableKeys = Object.keys(question.variables);
    const randomIndex = Math.floor(Math.random() * question.variables[variableKeys[0]].length);
    
    // Replace all variables in question text
    let questionText = question.question;
    let explanationText = question.explanation;
    
    variableKeys.forEach(key => {
      const value = question.variables[key][randomIndex];
      questionText = questionText.replace(new RegExp(`{${key}}`, 'g'), value);
      explanationText = explanationText.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    // Replace variables in options
    const options = question.options.map((option: string) => {
      let optionText = option;
      variableKeys.forEach(key => {
        const value = question.variables[key][randomIndex];
        optionText = optionText.replace(new RegExp(`{${key}}`, 'g'), value);
      });
      return optionText;
    });
    
    return {
      question: questionText,
      optionA: options[0],
      optionB: options[1], 
      optionC: options[2],
      optionD: options[3],
      correctAnswer: question.correctAnswer,
      explanation: explanationText,
      category: category,
      subcategory: subcategory,
      difficulty: 'basic',
      examType: 'basic',
      questionNumber: null,
      isActive: true
    };
  }
  
  // Handle static questions (no variables)
  return {
    question: question.question,
    optionA: question.options[0],
    optionB: question.options[1],
    optionC: question.options[2], 
    optionD: question.options[3],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    category: category,
    subcategory: subcategory,
    difficulty: 'basic',
    examType: 'basic',
    questionNumber: null,
    isActive: true
  };
}

// Generate mathematical/calculation questions
function generateCalculationQuestions(): InsertExamQuestion[] {
  const questions: InsertExamQuestion[] = [];
  
  // Ohm's Law variations
  for (let i = 0; i < 50; i++) {
    const voltage = [3, 5, 6, 9, 12, 15, 18, 24, 36, 48][Math.floor(Math.random() * 10)];
    const current = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8][Math.floor(Math.random() * 10)];
    const resistance = voltage / current;
    
    questions.push({
      question: `According to Ohm's law, if the voltage across a resistor is ${voltage} V and the current through it is ${current} A, what is the resistance?`,
      optionA: `${resistance} Ω`,
      optionB: `${resistance * 2} Ω`,
      optionC: `${voltage + current} Ω`,
      optionD: `${voltage * current} Ω`,
      correctAnswer: 0,
      explanation: `Using Ohm's law (R = V/I), the resistance is ${voltage} V ÷ ${current} A = ${resistance} Ω.`,
      category: 'technical',
      subcategory: 'Ohm\'s Law',
      difficulty: 'basic',
      examType: 'basic',
      questionNumber: null,
      isActive: true
    });
  }
  
  // Frequency/Wavelength calculations
  for (let i = 0; i < 30; i++) {
    const frequencies = [3.7, 7.0, 14.0, 21.0, 28.0, 50, 146, 446];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    const wavelength = freq < 30 ? (300 / freq).toFixed(1) + ' meters' : (300 / freq).toFixed(2) + ' meters';
    
    questions.push({
      question: `What is the wavelength of a ${freq} MHz signal?`,
      optionA: wavelength,
      optionB: (300 / (freq * 2)).toFixed(2) + ' meters',
      optionC: (300 / (freq / 2)).toFixed(1) + ' meters', 
      optionD: (freq / 300).toFixed(3) + ' meters',
      correctAnswer: 0,
      explanation: `Using the formula λ = c/f, where c = 300,000,000 m/s and f = ${freq * 1000000} Hz, the wavelength is ${wavelength}.`,
      category: 'technical',
      subcategory: 'Frequency',
      difficulty: 'basic',
      examType: 'basic',
      questionNumber: null,
      isActive: true
    });
  }
  
  return questions;
}

// Generate band-specific questions
function generateBandQuestions(): InsertExamQuestion[] {
  const questions: InsertExamQuestion[] = [];
  
  const bands = [
    { name: '80 meters', freq: '3.5-4.0 MHz', wavelength: '80m', privileges: 'Extra and Advanced' },
    { name: '40 meters', freq: '7.0-7.3 MHz', wavelength: '40m', privileges: 'All license classes' },
    { name: '20 meters', freq: '14.0-14.35 MHz', wavelength: '20m', privileges: 'All license classes' },
    { name: '15 meters', freq: '21.0-21.45 MHz', wavelength: '15m', privileges: 'All license classes' },
    { name: '10 meters', freq: '28-29.7 MHz', wavelength: '10m', privileges: 'All license classes' },
    { name: '6 meters', freq: '50-54 MHz', wavelength: '6m', privileges: 'All license classes' },
    { name: '2 meters', freq: '144-148 MHz', wavelength: '2m', privileges: 'All license classes' },
    { name: '70 cm', freq: '420-450 MHz', wavelength: '70cm', privileges: 'All license classes' }
  ];
  
  bands.forEach(band => {
    // Band frequency range questions
    questions.push({
      question: `What is the frequency range of the ${band.name} amateur band in Canada?`,
      optionA: band.freq,
      optionB: '146-148 MHz',
      optionC: '28-29.7 MHz',
      optionD: '420-450 MHz',
      correctAnswer: 0,
      explanation: `The ${band.name} amateur band in Canada operates on ${band.freq}.`,
      category: 'regulations',
      subcategory: 'Band Plans',
      difficulty: 'basic',
      examType: 'basic',
      questionNumber: null,
      isActive: true
    });
    
    // Band characteristics questions
    if (parseFloat(band.freq.split('-')[0]) < 30) {
      questions.push({
        question: `Which of the following best describes propagation characteristics of the ${band.name} band?`,
        optionA: 'Long distance propagation, varies with solar cycle',
        optionB: 'Line of sight propagation only',
        optionC: 'Ground wave propagation only',
        optionD: 'Satellite communication only',
        correctAnswer: 0,
        explanation: `The ${band.name} band is an HF band with long distance propagation that varies with solar activity and ionospheric conditions.`,
        category: 'technical',
        subcategory: 'Propagation',
        difficulty: 'basic',
        examType: 'basic',
        questionNumber: null,
        isActive: true
      });
    } else {
      questions.push({
        question: `Which of the following best describes propagation characteristics of the ${band.name} band?`,
        optionA: 'Line of sight and local repeater coverage',
        optionB: 'Worldwide propagation',
        optionC: 'Ground wave propagation',
        optionD: 'Ionospheric skip propagation',
        correctAnswer: 0,
        explanation: `The ${band.name} band is a VHF/UHF band with primarily line of sight propagation and local repeater coverage.`,
        category: 'technical',
        subcategory: 'Propagation',
        difficulty: 'basic',
        examType: 'basic',
        questionNumber: null,
        isActive: true
      });
    }
  });
  
  return questions;
}

// Main generation function
export async function generateThousandsOfQuestions(): Promise<void> {
  console.log("Starting generation of thousands of ham radio exam questions...");
  
  const allQuestions: InsertExamQuestion[] = [];
  
  // Generate questions from templates
  Object.entries(QUESTION_TEMPLATES).forEach(([categoryName, categoryData]) => {
    console.log(`Generating questions for category: ${categoryName}`);
    
    categoryData.subcategories.forEach(subcategory => {
      // Generate multiple variations of each template
      categoryData.templates.forEach(template => {
        // Generate 20-50 variations of each template depending on variables
        const variationCount = template.variables && Object.keys(template.variables).length > 0 ? 
          Math.min(50, (template.variables as any)[Object.keys(template.variables)[0]].length * 3) : 5;
        
        for (let i = 0; i < variationCount; i++) {
          try {
            const question = generateVariableQuestion(template, categoryName, subcategory);
            allQuestions.push(question);
          } catch (error) {
            console.error(`Error generating question for ${categoryName}/${subcategory}:`, error);
          }
        }
      });
    });
  });
  
  // Add calculation questions
  console.log("Generating calculation questions...");
  allQuestions.push(...generateCalculationQuestions());
  
  // Add band-specific questions
  console.log("Generating band-specific questions...");
  allQuestions.push(...generateBandQuestions());
  
  // Generate additional questions for comprehensive coverage
  console.log("Generating additional comprehensive questions...");
  
  // Shuffle the questions array
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }
  
  console.log(`Generated ${allQuestions.length} total questions. Saving to database...`);
  
  // Save to database in batches to avoid overwhelming the system
  const batchSize = 100;
  let savedCount = 0;
  
  for (let i = 0; i < allQuestions.length; i += batchSize) {
    const batch = allQuestions.slice(i, i + batchSize);
    try {
      await storage.createExamQuestions(batch);
      savedCount += batch.length;
      console.log(`Saved batch ${Math.floor(i/batchSize) + 1}, total saved: ${savedCount}`);
    } catch (error) {
      console.error(`Error saving batch ${Math.floor(i/batchSize) + 1}:`, error);
    }
  }
  
  console.log(`Successfully generated and saved ${savedCount} ham radio exam questions!`);
  
  // Print statistics
  const stats = {
    regulations: allQuestions.filter(q => q.category === 'regulations').length,
    operating: allQuestions.filter(q => q.category === 'operating').length,
    technical: allQuestions.filter(q => q.category === 'technical').length,
    antenna: allQuestions.filter(q => q.category === 'antenna').length,
    safety: allQuestions.filter(q => q.category === 'safety').length,
    digital: allQuestions.filter(q => q.category === 'digital').length,
    emergency: allQuestions.filter(q => q.category === 'emergency').length
  };
  
  console.log("Questions by category:", stats);
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateThousandsOfQuestions()
    .then(() => {
      console.log("Question generation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error generating questions:", error);
      process.exit(1);
    });
}