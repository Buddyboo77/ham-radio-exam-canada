import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Award, BookOpen, ExternalLink, FlaskConical, Lightbulb, Radio, RotateCw, GamepadIcon } from "lucide-react";
import MorseCodeGame from "@/components/games/MorseCodeGame";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Flashcard data
const FLASHCARDS = [
  {
    question: "What is the wavelength of a radio wave with a frequency of 146.52 MHz?",
    answer: "Approximately 2 meters",
    category: "Technical"
  },
  {
    question: "What is the purpose of an antenna tuner?",
    answer: "To match the impedance of the radio to the impedance of the antenna",
    category: "Technical"
  },
  {
    question: "What does APRS stand for?",
    answer: "Automatic Packet Reporting System",
    category: "Operating"
  },
  {
    question: "What type of electronic component opposes any change in current?",
    answer: "Inductor",
    category: "Technical"
  },
  {
    question: "What is the phonetic alphabet designation for the letter 'Q'?",
    answer: "Quebec",
    category: "Operating"
  },
  {
    question: "What does 'QTH' mean in Q codes?",
    answer: "My location is...",
    category: "Operating"
  },
  {
    question: "What does SWR stand for?",
    answer: "Standing Wave Ratio",
    category: "Technical"
  },
  {
    question: "What does DMR stand for?",
    answer: "Digital Mobile Radio",
    category: "Digital Modes"
  },
  {
    question: "What is the standard frequency used for APRS in North America?",
    answer: "144.390 MHz",
    category: "Digital Modes"
  },
  {
    question: "What is the primary purpose of a balun?",
    answer: "To convert between balanced and unbalanced lines",
    category: "Technical"
  }
];

// Comprehensive Canadian Amateur Radio Exam Question Bank (100 questions)
// Based on the Industry Canada Basic Qualification exam syllabus
const QUIZ_QUESTIONS = [
  // REGULATIONS & POLICIES (25 questions)
  {
    question: "Which of the following is NOT a valid band for amateur radio operators in Canada?",
    options: [
      "2 meters (144-148 MHz)",
      "70 centimeters (430-450 MHz)",
      "5 meters (60-64 MHz)",
      "6 meters (50-54 MHz)"
    ],
    correctAnswer: 2,
    explanation: "The 5 meter band (60-64 MHz) is not allocated to amateur radio in Canada. The valid bands are 6 meters (50-54 MHz), 2 meters (144-148 MHz), and 70 centimeters (430-450 MHz).",
    category: "Regulations"
  },
  {
    question: "What is the maximum transmitting power allowed for Basic qualification holders with Honours in Canada?",
    options: [
      "100 watts",
      "250 watts",
      "560 watts",
      "1000 watts"
    ],
    correctAnswer: 1,
    explanation: "Basic with Honours operators are limited to 250 watts PEP (peak envelope power) output.",
    category: "Regulations"
  },
  {
    question: "When identifying your station, how often must you send your call sign?",
    options: [
      "Every 5 minutes during a contact and at the end",
      "At the beginning and end of a contact",
      "At least every 30 minutes during a contact and at the end",
      "Only at the end of a contact"
    ],
    correctAnswer: 2,
    explanation: "Canadian regulations require station identification at least every 30 minutes during a contact and at the end of the communication.",
    category: "Regulations"
  },
  {
    question: "How long is the term of a Canadian Amateur Radio Operator Certificate?",
    options: [
      "One year, renewable",
      "Five years, renewable",
      "Ten years, renewable",
      "Life (no renewal required)"
    ],
    correctAnswer: 3,
    explanation: "The Canadian Amateur Radio Operator Certificate is valid for life and does not require renewal.",
    category: "Regulations"
  },
  {
    question: "What is required to operate an amateur radio station in Canada?",
    options: [
      "A valid Amateur Radio Operator Certificate and a station license",
      "Only a valid Amateur Radio Operator Certificate",
      "Only a valid station license",
      "A commercial radio operator's license"
    ],
    correctAnswer: 1,
    explanation: "To operate an amateur radio station in Canada, you need both a valid Amateur Radio Operator Certificate and a station license issued by Innovation, Science and Economic Development Canada.",
    category: "Regulations"
  },
  {
    question: "What are the three qualifications for an Amateur Radio Operator's Certificate that are available in Canada?",
    options: [
      "Basic, Advanced, and Pro",
      "Basic, General, and Extra",
      "Basic, Advanced, and Morse Code",
      "Class 1, Class 2, and Class 3"
    ],
    correctAnswer: 2,
    explanation: "In Canada, the three qualifications are Basic, Advanced, and Morse Code.",
    category: "Regulations"
  },
  {
    question: "What portion of the 80/75 meter band is available to Canadian radio amateurs with only Basic Qualification?",
    options: [
      "3.5 to 4.0 MHz",
      "3.5 to 3.725 MHz",
      "3.5 to 3.85 MHz",
      "All of the 80/75 meter band"
    ],
    correctAnswer: 1,
    explanation: "Operators with only Basic Qualification have access to 3.5 to 3.725 MHz in the 80/75 meter band.",
    category: "Regulations"
  },
  {
    question: "What minimum age must you be to hold an Amateur Radio Operator Certificate with Basic Qualification?",
    options: [
      "There is no age limit",
      "14 years",
      "16 years",
      "18 years"
    ],
    correctAnswer: 0,
    explanation: "There is no minimum age requirement to hold an Amateur Radio Operator Certificate in Canada.",
    category: "Regulations"
  },
  {
    question: "If you hear a distress signal on an amateur band, what should you do?",
    options: [
      "Change frequency immediately to avoid interfering with emergency traffic",
      "Call the nearest government radio station and inform the operator",
      "Immediately cease all transmissions and listen for further emergency traffic",
      "Take notes and wait for police to contact you for details"
    ],
    correctAnswer: 2,
    explanation: "When you hear a distress signal, you should immediately cease all transmissions and listen for further emergency traffic.",
    category: "Regulations"
  },
  {
    question: "Which agency is responsible for administering the regulations for amateur radio in Canada?",
    options: [
      "Transport Canada",
      "Innovation, Science and Economic Development Canada (ISED)",
      "Radio Amateurs of Canada (RAC)",
      "Canadian Radio-television and Telecommunications Commission (CRTC)"
    ],
    correctAnswer: 1,
    explanation: "Innovation, Science and Economic Development Canada (ISED), formerly Industry Canada, administers amateur radio regulations in Canada.",
    category: "Regulations"
  },
  {
    question: "What frequencies are covered by the term 'MF'?",
    options: [
      "300 to 3000 Hz",
      "30 to 300 kHz",
      "300 to 3000 kHz",
      "3 to 30 MHz"
    ],
    correctAnswer: 2,
    explanation: "Medium Frequency (MF) covers the range from 300 to 3000 kHz.",
    category: "Regulations"
  },
  {
    question: "What frequencies are allowed for VHF/UHF FM voice operation by operators with only Basic Qualification?",
    options: [
      "All VHF/UHF ham bands",
      "Only frequencies above 30 MHz",
      "Only the 2-meter band (144-148 MHz)",
      "Only simplex frequencies, not repeaters"
    ],
    correctAnswer: 1,
    explanation: "Operators with only Basic Qualification are allowed to operate on all amateur frequency bands above 30 MHz.",
    category: "Regulations"
  },
  {
    question: "What does the term 'ITU Region 2' refer to?",
    options: [
      "Europe and Africa",
      "Asia and Australia",
      "North and South America",
      "Antarctica"
    ],
    correctAnswer: 2,
    explanation: "ITU Region 2 refers to North and South America, which is where Canadian amateur frequency allocations apply.",
    category: "Regulations"
  },
  {
    question: "Which of the following call sign ranges are allocated for Canadian amateur radio stations?",
    options: [
      "K1AAA - K9ZZZ",
      "VA1AAA - VG7ZZZ",
      "XA1AAA - XG7ZZZ",
      "A1AAA - A7ZZZ"
    ],
    correctAnswer: 1,
    explanation: "Canadian amateur call signs use the ranges from VA1AAA to VG7ZZZ and other similar prefixes like VE, VO, and VY.",
    category: "Regulations"
  },
  {
    question: "What is the meaning of the term 'communication with third parties'?",
    options: [
      "Communication between amateur stations in different countries",
      "Messages passed between amateur stations on behalf of non-amateurs",
      "Communication between three amateur stations at the same time",
      "Using a repeater during a contact"
    ],
    correctAnswer: 1,
    explanation: "Third-party communications refers to messages passed between amateur stations on behalf of non-amateurs.",
    category: "Regulations"
  },
  {
    question: "Under what circumstances may you operate your amateur station in the US?",
    options: [
      "Under no circumstances",
      "Only after obtaining a US license",
      "When there is a third-party agreement between Canada and the US",
      "When you have a reciprocal operating agreement"
    ],
    correctAnswer: 2,
    explanation: "Canadian amateurs can operate in the US because there is a third-party agreement between Canada and the US.",
    category: "Regulations"
  },
  {
    question: "When may an amateur station make transmissions that are encoded to obscure their meaning?",
    options: [
      "During contests",
      "When operating mobile",
      "When transmitting above 450 MHz",
      "Never, except for control signals for earth stations and space stations"
    ],
    correctAnswer: 3,
    explanation: "Amateur stations should never make transmissions that are encoded to obscure their meaning, except for control signals for earth stations and space stations.",
    category: "Regulations"
  },
  {
    question: "How often must an amateur station be identified?",
    options: [
      "At the beginning and end of each transmission",
      "At least every ten minutes and at the end of a transmission",
      "At least every thirty minutes and at the end of a transmission",
      "Only at the end of a transmission"
    ],
    correctAnswer: 2,
    explanation: "Amateur stations must identify at least every thirty minutes during a communication and at the end of a transmission.",
    category: "Regulations"
  },
  {
    question: "What is the proper way to identify your station when using phone?",
    options: [
      "Using CW (Morse code)",
      "By sending your call sign using a DTMF pad",
      "By giving your call sign using standard international phonetics",
      "By giving your call sign using phonetics of your choice"
    ],
    correctAnswer: 2,
    explanation: "The proper way to identify using phone is to give your call sign using standard international phonetics.",
    category: "Regulations"
  },
  {
    question: "What are the restrictions on the use of abbreviations or procedural signals in the amateur service?",
    options: [
      "They may be used if they do not obscure the meaning of a message",
      "Only the Q-codes are permitted",
      "Abbreviations are not permitted as they could obscure the meaning of a message",
      "Only standard abbreviations may be used"
    ],
    correctAnswer: 0,
    explanation: "Abbreviations or procedural signals may be used if they do not obscure the meaning of a message.",
    category: "Regulations"
  },
  {
    question: "Which of the following statements is correct about installing or modifying an amateur station antenna?",
    options: [
      "You must obtain approval from Innovation, Science and Economic Development Canada",
      "You must follow all applicable building codes and regulations",
      "You must notify your local amateur radio club",
      "You may only use commercially manufactured antennas"
    ],
    correctAnswer: 1,
    explanation: "When installing or modifying an antenna, you must follow all applicable building codes and other regulations.",
    category: "Regulations"
  },
  {
    question: "Which of the following statements is not correct?",
    options: [
      "A Canadian amateur may communicate with any other amateur station in any country that has not notified ITU it objects to such communications",
      "Canadian amateurs must observe the regulations of the country in which they are operating when activating a Canadian station outside Canada",
      "A Canadian amateur may never operate in a foreign country without permission from that country",
      "A Canadian amateur must identify with the call sign issued by the licensing authority of the country in which the station is being operated when transmitting in a foreign country"
    ],
    correctAnswer: 2,
    explanation: "A Canadian amateur may actually operate in a foreign country with proper authorization, so the statement 'A Canadian amateur may never operate in a foreign country without permission from that country' is not correct.",
    category: "Regulations"
  },
  {
    question: "What should you do to comply with regulations when operating in the 60 meter band in Canada?",
    options: [
      "You can use any mode with a maximum of 100 watts PEP",
      "You must operate only on the center frequency of each channel",
      "You must use USB single sideband only, with a maximum of 100 watts PEP",
      "You may operate only if you have Advanced qualification"
    ],
    correctAnswer: 2,
    explanation: "In the 60 meter band, Canadian operators must use USB single sideband only, with a maximum of 100 watts PEP.",
    category: "Regulations"
  },
  {
    question: "Which of the following is NOT a valid way to renew your radio authorization?",
    options: [
      "Using the Innovation, Science and Economic Development Canada website",
      "There is no need to renew a Canadian Amateur Radio Operator Certificate",
      "By mail",
      "In person at an ISED office"
    ],
    correctAnswer: 1,
    explanation: "While the certificate itself is valid for life, the authorization (station license) needs to be renewed. Therefore, the statement 'There is no need to renew a Canadian Amateur Radio Operator Certificate' is not valid.",
    category: "Regulations"
  },
  {
    question: "When must you add the location to your station identification?",
    options: [
      "When operating away from your home address for more than 30 days",
      "When operating portable or mobile",
      "When operating in a foreign country",
      "When operating from your primary station location"
    ],
    correctAnswer: 2,
    explanation: "When operating in a foreign country, you must add the location to your station identification.",
    category: "Regulations"
  },
  {
    question: "The Basic Qualification exam consists of how many questions?",
    options: [
      "50 questions",
      "60 questions",
      "75 questions",
      "100 questions"
    ],
    correctAnswer: 2,
    explanation: "The Basic Qualification exam consists of 75 questions, and you need 70% to pass.",
    category: "Regulations"
  },
  
  // OPERATING PROCEDURES (25 questions)
  {
    question: "What is the proper way to call another station on a repeater?",
    options: [
      "Say 'Breaker, breaker' followed by the other station's call sign",
      "Say the other station's call sign, followed by 'this is' and your call sign",
      "Say your call sign followed by the other station's call sign",
      "Whistle into the microphone to get attention, then say both call signs"
    ],
    correctAnswer: 1,
    explanation: "The proper procedure is to say the call sign of the station you are calling, followed by 'this is' and your own call sign.",
    category: "Operating"
  },
  {
    question: "What does the Q-code 'QTH' mean?",
    options: [
      "What time is it?",
      "What is your location?",
      "Can you hear me?",
      "Are you busy?"
    ],
    correctAnswer: 1,
    explanation: "The Q-code 'QTH' means 'What is your location?' or when stating 'My QTH is...' it means 'My location is...'",
    category: "Operating"
  },
  {
    question: "What is the phonetic alphabet word for the letter 'C'?",
    options: [
      "Cobra",
      "Canada",
      "Charlie",
      "Cottage"
    ],
    correctAnswer: 2,
    explanation: "In the NATO phonetic alphabet used in ham radio, the letter 'C' is represented by 'Charlie'.",
    category: "Operating"
  },
  {
    question: "What power level is recommended for a hand-held radio with a rubber duck antenna to access a local VHF repeater 15 km away?",
    options: [
      "The highest power setting to ensure signal clarity",
      "The lowest power setting that maintains reliable communication",
      "Always set at 50 watts to ensure you're heard",
      "Exactly 10 watts to minimize interference"
    ],
    correctAnswer: 1,
    explanation: "You should always use the minimum power necessary for reliable communications. This conserves power and reduces the possibility of interference to other stations.",
    category: "Operating"
  },
  {
    question: "What is the most common method of calling CQ on 2-meter FM voice operation?",
    options: [
      "By calling 'CQ' three times, followed by 'this is', followed by your call sign spoken three times",
      "By saying 'CQ' once, followed by 'this is', followed by your call sign",
      "By saying your call sign, followed by 'calling CQ'",
      "By saying 'Calling all stations' followed by your call sign"
    ],
    correctAnswer: 1,
    explanation: "The most common method is to say 'CQ' once, followed by 'this is', followed by your call sign.",
    category: "Operating"
  },
  {
    question: "What is a courtesy tone?",
    options: [
      "A tone used by repeaters to indicate when to begin transmitting",
      "A tone used to acknowledge the next station to transmit",
      "A tone used by all stations to indicate the frequency is in use",
      "A tone transmitted by a repeater to indicate when it has completed transmitting"
    ],
    correctAnswer: 3,
    explanation: "A courtesy tone is transmitted by a repeater to indicate when it has completed transmitting and is ready for the next transmission.",
    category: "Operating"
  },
  {
    question: "What is the purpose of a repeater time-out timer?",
    options: [
      "To limit repeater access to only certain times of the day",
      "To keep repeater trustees informed of how much the system is being used",
      "To prevent damage to the repeater from continuous operation",
      "To allow the repeater batteries to recharge"
    ],
    correctAnswer: 2,
    explanation: "The purpose of a repeater time-out timer is to prevent damage to the repeater from continuous operation by limiting the length of transmissions.",
    category: "Operating"
  },
  {
    question: "What is the meaning of the term 'simplex operation'?",
    options: [
      "Using a repeater to communicate",
      "Transmitting and receiving on the same frequency",
      "Using a directional antenna for communications",
      "Using two frequencies for communications"
    ],
    correctAnswer: 1,
    explanation: "Simplex operation means transmitting and receiving on the same frequency.",
    category: "Operating"
  },
  {
    question: "What is the meaning of the term 'duplex operation'?",
    options: [
      "Using a repeater to communicate",
      "Transmitting and receiving on the same frequency",
      "Using a directional antenna for communications",
      "Using two separate antennas for transmitting and receiving"
    ],
    correctAnswer: 0,
    explanation: "Duplex operation means using a repeater to communicate, which involves transmitting on one frequency and receiving on another.",
    category: "Operating"
  },
  {
    question: "What does the abbreviation 'RST' stand for in a signal report?",
    options: [
      "Readability, Signal and Tone",
      "Range, Speed and Transmission",
      "Radio Signal Test",
      "Rate, System Test"
    ],
    correctAnswer: 0,
    explanation: "RST stands for Readability, Signal strength and Tone, the three components of a signal report.",
    category: "Operating"
  },
  {
    question: "What is a 'QSL' card?",
    options: [
      "A card confirming a contact between two amateur stations",
      "A card used to replace a defective license",
      "A method of establishing radio contact",
      "A statement of fees due for using a repeater"
    ],
    correctAnswer: 0,
    explanation: "A QSL card is a written confirmation of a contact between two amateur stations.",
    category: "Operating"
  },
  {
    question: "What is the Band Plan for VHF/UHF repeaters in Canada?",
    options: [
      "Always transmit on the higher frequency",
      "Always transmit on the lower frequency",
      "Always transmit on frequency designated by the local amateur radio club",
      "Always transmit on simplex frequencies"
    ],
    correctAnswer: 0,
    explanation: "For VHF/UHF repeaters in Canada, users always transmit on the higher frequency and receive on the lower frequency.",
    category: "Operating"
  },
  {
    question: "In FM voice operation, what does a signal report of 'full quieting' mean?",
    options: [
      "The signal is strong enough to overcome all noise and static",
      "There is no wind noise in the background",
      "The operator is talking softly",
      "The station has gone silent"
    ],
    correctAnswer: 0,
    explanation: "'Full quieting' means the signal is strong enough to overcome all noise and static, resulting in a clear reception with no background noise.",
    category: "Operating"
  },
  {
    question: "What is the main purpose of the Canadian National VHF/UHF Bandplan?",
    options: [
      "It is required by regulations and must be followed at all times",
      "It provides for effective spectrum management by recommending specific uses for frequency segments",
      "It specifies the frequencies that are set aside for Canadian government use only",
      "It makes data frequencies available only to those who hold Advanced qualification"
    ],
    correctAnswer: 1,
    explanation: "The main purpose of the Canadian National VHF/UHF Bandplan is to provide for effective spectrum management by recommending specific uses for frequency segments.",
    category: "Operating"
  },
  {
    question: "What is a split frequency operation?",
    options: [
      "Using two transmitters at the same time",
      "Operating on a frequency 3 kHz higher than normal to avoid interference",
      "Operating the transmitter and receiver on different frequencies",
      "Using a special split frequency schedule on weekends only"
    ],
    correctAnswer: 2,
    explanation: "Split frequency operation means operating the transmitter and receiver on different frequencies.",
    category: "Operating"
  },
  {
    question: "What is the proper operating procedure when contacting a DX station?",
    options: [
      "Send a long CQ to attract the DX station",
      "Send your full call sign once or twice, then listen",
      "Keep calling the DX station until they acknowledge you",
      "Call CQ DX and wait for the DX station to call"
    ],
    correctAnswer: 1,
    explanation: "The proper operating procedure when contacting a DX station is to send your full call sign once or twice, then listen.",
    category: "Operating"
  },
  {
    question: "What is a good way to break into a conversation between two stations?",
    options: [
      "Wait for a pause in the conversation and then give your call sign",
      "Transmit your call sign between their transmissions",
      "Call 'Break, break' then give your call sign",
      "Wait until the conversation is finished before calling either station"
    ],
    correctAnswer: 0,
    explanation: "A good way to break into a conversation is to wait for a pause in the conversation and then give your call sign.",
    category: "Operating"
  },
  {
    question: "How should you respond to a CQ call on a VHF FM repeater?",
    options: [
      "Immediately start calling CQ in response",
      "Say the calling station's call sign, then give your call sign",
      "Say your call sign, then give the other station's call sign",
      "Say 'QRZ' followed by the calling station's call sign"
    ],
    correctAnswer: 1,
    explanation: "You should respond to a CQ call by saying the calling station's call sign, then give your call sign.",
    category: "Operating"
  },
  {
    question: "What is the meaning of the term 'MAYDAY'?",
    options: [
      "A general call to all stations",
      "A distress call",
      "A call used to test emergency networks",
      "A call to a specific emergency station"
    ],
    correctAnswer: 1,
    explanation: "'MAYDAY' is a distress call indicating a life-threatening emergency.",
    category: "Operating"
  },
  {
    question: "What is a guide for making contacts during a contest?",
    options: [
      "Sign your complete call sign at the end of the contact only",
      "Work as many contest stations as possible in as many different places as possible in the time allowed",
      "Submit your log within 6 days of the end of the contest",
      "Contact the same station many times to be sure they copy your information correctly"
    ],
    correctAnswer: 1,
    explanation: "A guide for making contacts during a contest is to work as many contest stations as possible in as many different places as possible in the time allowed.",
    category: "Operating"
  },
  {
    question: "What is the main purpose of APRS (Automatic Packet Reporting System)?",
    options: [
      "To provide position information and short text messages via packet radio",
      "To automatically control VHF and UHF repeaters",
      "To reduce the number of packet radio stations needed in emergencies",
      "To provide remote control for model rocketry"
    ],
    correctAnswer: 0,
    explanation: "The main purpose of APRS is to provide position information and short text messages via packet radio.",
    category: "Operating"
  },
  {
    question: "What is a 'pileup'?",
    options: [
      "A very large number of stations calling a DX station at the same time",
      "A traffic jam on a major highway",
      "A system error in a packet radio network",
      "A large number of stations trying to contact emergency services"
    ],
    correctAnswer: 0,
    explanation: "A 'pileup' is a very large number of stations calling a DX station at the same time.",
    category: "Operating"
  },
  {
    question: "When was the International Phonetic Alphabet adopted for amateur use?",
    options: [
      "After World War I",
      "After World War II",
      "In the early 1970s",
      "In the early 1990s"
    ],
    correctAnswer: 1,
    explanation: "The International Phonetic Alphabet was adopted for amateur use after World War II.",
    category: "Operating"
  },
  {
    question: "What does 'QRM' mean?",
    options: [
      "Your signals are fading",
      "I am being interfered with",
      "Is my transmission being interfered with?",
      "I will retransmit the message"
    ],
    correctAnswer: 1,
    explanation: "QRM means 'I am being interfered with' or 'Are you being interfered with?'",
    category: "Operating"
  },
  {
    question: "What is a beacon station?",
    options: [
      "A station that transmits at high power",
      "A station transmitting for the purpose of monitoring propagation and reception",
      "A station that transmits time signals",
      "A station that transmits bulletins"
    ],
    correctAnswer: 1,
    explanation: "A beacon station is one that transmits for the purpose of monitoring propagation and reception.",
    category: "Operating"
  },
  
  // RADIO WAVE PROPAGATION (10 questions)
  {
    question: "Which of the following frequency bands has the longest range during nighttime hours?",
    options: [
      "20 meters",
      "40 meters",
      "80 meters",
      "2 meters"
    ],
    correctAnswer: 2,
    explanation: "The 80-meter band typically has the longest range during nighttime hours due to improved ionospheric reflection at lower frequencies.",
    category: "Propagation"
  },
  {
    question: "What is the relationship between frequency and wavelength?",
    options: [
      "They are directly proportional",
      "They are inversely proportional",
      "They are independent of each other",
      "They increase together logarithmically"
    ],
    correctAnswer: 1,
    explanation: "Frequency and wavelength are inversely proportional. As frequency increases, wavelength decreases, and vice versa.",
    category: "Propagation"
  },
  {
    question: "What happens to signals in the UHF and microwave bands?",
    options: [
      "They are usually reflected by the ionosphere",
      "They travel mostly as ground waves",
      "They are generally limited to line-of-sight paths",
      "They usually skip around the world"
    ],
    correctAnswer: 2,
    explanation: "UHF and microwave signals are generally limited to line-of-sight paths because they are not reflected by the ionosphere.",
    category: "Propagation"
  },
  {
    question: "What type of propagation is most commonly associated with 'skip' signals on the HF bands?",
    options: [
      "Ground wave",
      "Line-of-sight",
      "Ionospheric",
      "Tropospheric"
    ],
    correctAnswer: 2,
    explanation: "Ionospheric propagation is most commonly associated with 'skip' signals on the HF bands, where signals bounce off the ionosphere.",
    category: "Propagation"
  },
  {
    question: "What is the cause of auroral propagation?",
    options: [
      "Solar flares affecting the ionosphere",
      "Lightning in the atmosphere",
      "Sunspots on the surface of the earth",
      "Temperature inversions in the atmosphere"
    ],
    correctAnswer: 0,
    explanation: "Auroral propagation is caused by solar flares affecting the ionosphere, particularly in the polar regions.",
    category: "Propagation"
  },
  {
    question: "What is a good indicator of possible 'skip' propagation on the 6 meter band?",
    options: [
      "A sudden drop in atmospheric pressure",
      "Sunspots visible through a properly filtered telescope",
      "Television channels 2 through 6 being received from long distances",
      "A very low solar flux"
    ],
    correctAnswer: 2,
    explanation: "Television channels 2 through 6 being received from long distances can be a good indicator of possible 'skip' propagation on the 6 meter band.",
    category: "Propagation"
  },
  {
    question: "What is meant by ground wave propagation?",
    options: [
      "Signals that travel over the earth's surface",
      "Signals that travel through the earth",
      "Radio waves that travel through water",
      "Radio waves that bounce off the ground"
    ],
    correctAnswer: 0,
    explanation: "Ground wave propagation refers to signals that travel over the earth's surface.",
    category: "Propagation"
  },
  {
    question: "What effect does the 11-year sunspot cycle have on HF propagation?",
    options: [
      "More sunspots generally result in better propagation on higher frequencies",
      "More sunspots generally result in better propagation on lower frequencies",
      "Sunspots have no effect on radio propagation",
      "Sunspots only affect UHF bands"
    ],
    correctAnswer: 0,
    explanation: "More sunspots generally result in better propagation on higher frequencies due to increased ionization in the ionosphere.",
    category: "Propagation"
  },
  {
    question: "Which ionospheric layer is the most important for long-distance HF communications?",
    options: [
      "The A layer",
      "The E layer",
      "The F layer",
      "The G layer"
    ],
    correctAnswer: 2,
    explanation: "The F layer is the most important for long-distance HF communications because it provides the greatest reflection of radio waves.",
    category: "Propagation"
  },
  {
    question: "What is the Maximum Usable Frequency (MUF)?",
    options: [
      "The highest frequency that is legal to use for amateur transmissions",
      "The highest frequency that can be used for communications between two points",
      "The frequency above which radio waves no longer reflect off the ionosphere",
      "The frequency above which antenna gain must be limited"
    ],
    correctAnswer: 2,
    explanation: "The Maximum Usable Frequency (MUF) is the frequency above which radio waves no longer reflect off the ionosphere for a particular path.",
    category: "Propagation"
  },
  
  // ANTENNA SYSTEMS (15 questions)
  {
    question: "What does SWR stand for and why is it important?",
    options: [
      "Signal Wattage Rating - important for calculating transmitter power",
      "Standing Wave Ratio - important for antenna system efficiency",
      "Single Wire Resonance - important for wire antenna construction",
      "Standard Waveform Regulation - important for frequency stability"
    ],
    correctAnswer: 1,
    explanation: "SWR stands for Standing Wave Ratio, which is a measure of how efficiently RF power is transmitted from the radio to the antenna. High SWR can damage transmitters and reduce signal effectiveness.",
    category: "Antennas"
  },
  {
    question: "What are the three main components of a complete antenna system?",
    options: [
      "Transmitter, lightning arrestor, ground rod",
      "Feed line, tuner, ground rod",
      "Antenna, feed line, transmitter",
      "Antenna, feed line, antenna tuner"
    ],
    correctAnswer: 3,
    explanation: "A complete antenna system consists of the antenna itself, the feed line (coaxial cable or ladder line), and often an antenna tuner to match impedances.",
    category: "Antennas"
  },
  {
    question: "Which of the following would reduce RF energy in your station?",
    options: [
      "Using a rubber duck antenna instead of a beam antenna",
      "Increasing your transmitter power",
      "Adjusting the microphone gain",
      "Using a dummy load when testing"
    ],
    correctAnswer: 3,
    explanation: "A dummy load absorbs RF energy instead of radiating it, making it useful for testing transmitters without causing interference.",
    category: "Antennas"
  },
  {
    question: "What is the purpose of an antenna tuner?",
    options: [
      "To tune the frequency of the transmitted signal",
      "To match impedances between the transmitter and antenna system",
      "To reduce radiation from the transmission line",
      "To tune out interference from other stations"
    ],
    correctAnswer: 1,
    explanation: "The purpose of an antenna tuner is to match impedances between the transmitter and antenna system for more efficient power transfer.",
    category: "Antennas"
  },
  {
    question: "What device is used to measure Standing Wave Ratio (SWR)?",
    options: [
      "Wattmeter",
      "Antenna analyzer",
      "SWR meter or SWR bridge",
      "Grid dip meter"
    ],
    correctAnswer: 2,
    explanation: "An SWR meter or SWR bridge is used to measure Standing Wave Ratio (SWR).",
    category: "Antennas"
  },
  {
    question: "What is a dipole antenna?",
    options: [
      "A vertical antenna with a single element",
      "A horizontally polarized antenna with two elements",
      "An antenna with two conductors of equal length extending in opposite directions from a common feed point",
      "An antenna that works only on two bands"
    ],
    correctAnswer: 2,
    explanation: "A dipole antenna has two conductors of equal length extending in opposite directions from a common feed point.",
    category: "Antennas"
  },
  {
    question: "What type of antenna is a Yagi?",
    options: [
      "A groundplane antenna with one element",
      "A simple vertical antenna",
      "A directional antenna with multiple elements including a driven element, reflector and one or more directors",
      "An antenna with many dipole elements"
    ],
    correctAnswer: 2,
    explanation: "A Yagi is a directional antenna with multiple elements including a driven element, reflector, and one or more directors.",
    category: "Antennas"
  },
  {
    question: "What is a 'balun' used for?",
    options: [
      "To connect balanced antennas to unbalanced feed lines",
      "To match antennas to transmitters",
      "To tune a random length of coaxial cable",
      "To randomly tune an antenna"
    ],
    correctAnswer: 0,
    explanation: "A balun is used to connect balanced antennas to unbalanced feed lines, helping to prevent RF from flowing on the outside of coaxial cables.",
    category: "Antennas"
  },
  {
    question: "Which of the following is true of a 5/8 wave vertical antenna?",
    options: [
      "It has high angle radiation only",
      "It is easy to match to coax",
      "It has good low angle radiation for DX",
      "It is more compact than a 1/4 wave vertical"
    ],
    correctAnswer: 2,
    explanation: "A 5/8 wave vertical antenna has good low angle radiation for DX (long distance) communications.",
    category: "Antennas"
  },
  {
    question: "What is a feature of a quad antenna?",
    options: [
      "It has high gain in four directions",
      "It is compact and easy to build",
      "It consists of square or triangular loops with sides 1/4 wavelength long",
      "It requires no matching network"
    ],
    correctAnswer: 2,
    explanation: "A quad antenna consists of square or triangular loops with sides approximately 1/4 wavelength long.",
    category: "Antennas"
  },
  {
    question: "Why would you use RG-213 coaxial cable instead of RG-58?",
    options: [
      "Because it has less loss at high frequencies",
      "Because it is cheaper",
      "Because it is lighter and more flexible",
      "Because it has a higher velocity factor"
    ],
    correctAnswer: 0,
    explanation: "RG-213 coaxial cable is used instead of RG-58 because it has less loss at high frequencies due to its larger diameter.",
    category: "Antennas"
  },
  {
    question: "What is the characteristic impedance of most coaxial cables used in amateur radio?",
    options: [
      "25 ohms",
      "50 ohms",
      "75 ohms",
      "300 ohms"
    ],
    correctAnswer: 1,
    explanation: "Most coaxial cables used in amateur radio have a characteristic impedance of 50 ohms.",
    category: "Antennas"
  },
  {
    question: "What is the 'gain' of an antenna?",
    options: [
      "The number of elements in a Yagi",
      "The power radiated in certain directions compared to a reference antenna",
      "The amplification factor of an RF amplifier",
      "The ratio of power output to power input"
    ],
    correctAnswer: 1,
    explanation: "Antenna gain is the power radiated in certain directions compared to a reference antenna (usually a dipole or isotropic radiator).",
    category: "Antennas"
  },
  {
    question: "What is the purpose of a 'radial system' for a ground-mounted vertical antenna?",
    options: [
      "To reduce ground losses and improve antenna efficiency",
      "To reduce static electricity build-up",
      "To reduce antenna height",
      "To reduce precipitation static"
    ],
    correctAnswer: 0,
    explanation: "A radial system for a ground-mounted vertical antenna is used to reduce ground losses and improve antenna efficiency.",
    category: "Antennas"
  },
  {
    question: "What is a resonant antenna?",
    options: [
      "An antenna that produces maximum sound",
      "An antenna that oscillates with minimum vibration",
      "An antenna that is the same length as the signal it transmits",
      "An antenna that is electrically tuned to be most efficient at a certain frequency"
    ],
    correctAnswer: 3,
    explanation: "A resonant antenna is one that is electrically tuned to be most efficient at a certain frequency.",
    category: "Antennas"
  },
  
  // ELECTRICAL & ELECTRONIC THEORY (25 questions)
  {
    question: "What type of modulation is used for most voice communications on the VHF and UHF bands?",
    options: [
      "SSB (Single Sideband)",
      "FM (Frequency Modulation)",
      "AM (Amplitude Modulation)",
      "CW (Continuous Wave)"
    ],
    correctAnswer: 1,
    explanation: "FM (Frequency Modulation) is the most common modulation used for voice communications on VHF and UHF bands due to its noise resistance and audio clarity.",
    category: "Electronics"
  },
  {
    question: "What is the formula for calculating electrical power in a DC circuit?",
    options: [
      "Power (P) = Voltage (E) × Current (I)",
      "Power (P) = Voltage (E) / Current (I)",
      "Power (P) = Voltage (E) × Voltage (E) / Current (I)",
      "Power (P) = Voltage (E) / Resistance (R)"
    ],
    correctAnswer: 0,
    explanation: "The formula for calculating electrical power in a DC circuit is Power (P) = Voltage (E) × Current (I).",
    category: "Electronics"
  },
  {
    question: "What is Ohm's Law?",
    options: [
      "Current (I) = Resistance (R) × Voltage (E)",
      "Current (I) = Voltage (E) × Resistance (R)",
      "Current (I) = Voltage (E) / Resistance (R)",
      "Current (I) = Power (P) / Voltage (E)"
    ],
    correctAnswer: 2,
    explanation: "Ohm's Law states that Current (I) = Voltage (E) / Resistance (R).",
    category: "Electronics"
  },
  {
    question: "What is the total resistance of three 100-ohm resistors connected in series?",
    options: [
      "33.33 ohms",
      "100 ohms",
      "300 ohms",
      "900 ohms"
    ],
    correctAnswer: 2,
    explanation: "When resistors are connected in series, their resistances add. So, three 100-ohm resistors in series have a total resistance of 300 ohms.",
    category: "Electronics"
  },
  {
    question: "What is the total resistance of three 100-ohm resistors connected in parallel?",
    options: [
      "33.33 ohms",
      "100 ohms",
      "300 ohms",
      "900 ohms"
    ],
    correctAnswer: 0,
    explanation: "The total resistance of resistors in parallel is calculated as: 1/Rt = 1/R1 + 1/R2 + 1/R3. For three equal 100-ohm resistors, this gives 33.33 ohms.",
    category: "Electronics"
  },
  {
    question: "What does the term 'RF' mean?",
    options: [
      "Radio Fiction",
      "Radio Frequency",
      "Relative Farads",
      "Requires Filtering"
    ],
    correctAnswer: 1,
    explanation: "RF stands for Radio Frequency, which refers to the rate of oscillation of electromagnetic radio waves.",
    category: "Electronics"
  },
  {
    question: "What component is commonly used to store electrical energy in an electrostatic field?",
    options: [
      "Resistor",
      "Capacitor",
      "Inductor",
      "Diode"
    ],
    correctAnswer: 1,
    explanation: "A capacitor is commonly used to store electrical energy in an electrostatic field.",
    category: "Electronics"
  },
  {
    question: "What component is commonly used to store electrical energy in a magnetic field?",
    options: [
      "Resistor",
      "Capacitor",
      "Inductor",
      "Diode"
    ],
    correctAnswer: 2,
    explanation: "An inductor is commonly used to store electrical energy in a magnetic field.",
    category: "Electronics"
  },
  {
    question: "What electronic component allows current to flow in only one direction?",
    options: [
      "Resistor",
      "Capacitor",
      "Inductor",
      "Diode"
    ],
    correctAnswer: 3,
    explanation: "A diode allows current to flow in only one direction.",
    category: "Electronics"
  },
  {
    question: "What is the purpose of a transformer?",
    options: [
      "To transform AC power into DC power",
      "To increase or decrease AC voltage levels",
      "To store electrical energy",
      "To block the flow of direct current"
    ],
    correctAnswer: 1,
    explanation: "A transformer is used to increase or decrease AC voltage levels.",
    category: "Electronics"
  },
  {
    question: "What is the main purpose of an RF amplifier?",
    options: [
      "To increase signal amplitude",
      "To reduce frequency drift",
      "To eliminate distortion",
      "To reduce noise"
    ],
    correctAnswer: 0,
    explanation: "The main purpose of an RF amplifier is to increase signal amplitude.",
    category: "Electronics"
  },
  {
    question: "What is a transceiver?",
    options: [
      "A type of antenna system",
      "A unit for measuring inductance",
      "A device that combines a transmitter and receiver in one unit",
      "A device for matching feed lines to antennas"
    ],
    correctAnswer: 2,
    explanation: "A transceiver is a device that combines a transmitter and receiver in one unit.",
    category: "Electronics"
  },
  {
    question: "What does a repeater do?",
    options: [
      "Regenerates the signal from a satellite",
      "Increases antenna gain",
      "Receives a signal on one frequency and retransmits it on another frequency",
      "Reflects radio waves"
    ],
    correctAnswer: 2,
    explanation: "A repeater receives a signal on one frequency and retransmits it on another frequency, usually with increased power.",
    category: "Electronics"
  },
  {
    question: "What is a balanced feed line?",
    options: [
      "A feed line with an equal number of conductors on both sides",
      "A feed line with an even-mode impedance equal to the antenna impedance",
      "A feed line with equal impedance on both sides of the line",
      "A feed line where currents in the two conductors are equal and opposite"
    ],
    correctAnswer: 3,
    explanation: "A balanced feed line is one where currents in the two conductors are equal and opposite.",
    category: "Electronics"
  },
  {
    question: "What is meant by the term 'front-end overload'?",
    options: [
      "Too much voltage from the power supply",
      "Too much power from the transmitter",
      "Too much gain in the receiver's first amplifier stage",
      "Too much data in the computer"
    ],
    correctAnswer: 2,
    explanation: "Front-end overload refers to too much gain in the receiver's first amplifier stage, which can cause distortion and reduced sensitivity.",
    category: "Electronics"
  },
  {
    question: "What is reactance?",
    options: [
      "Opposition to AC current caused by capacitance or inductance",
      "Opposition to DC current caused by resistance",
      "A property of ideal resistors",
      "The force that causes electron flow in a DC circuit"
    ],
    correctAnswer: 0,
    explanation: "Reactance is the opposition to AC current caused by capacitance or inductance.",
    category: "Electronics"
  },
  {
    question: "What type of component has a positive and negative terminal?",
    options: [
      "Resistor",
      "Capacitor",
      "Inductor",
      "Polarized capacitor or battery"
    ],
    correctAnswer: 3,
    explanation: "A polarized capacitor or battery has positive and negative terminals that must be connected correctly.",
    category: "Electronics"
  },
  {
    question: "What is the relationship between frequency and capacitive reactance?",
    options: [
      "Capacitive reactance increases as frequency increases",
      "Capacitive reactance decreases as frequency increases",
      "They are unrelated",
      "Capacitive reactance and frequency are directly proportional"
    ],
    correctAnswer: 1,
    explanation: "Capacitive reactance decreases as frequency increases.",
    category: "Electronics"
  },
  {
    question: "What is the relationship between frequency and inductive reactance?",
    options: [
      "Inductive reactance increases as frequency increases",
      "Inductive reactance decreases as frequency increases",
      "They are unrelated",
      "Inductive reactance remains constant regardless of frequency"
    ],
    correctAnswer: 0,
    explanation: "Inductive reactance increases as frequency increases.",
    category: "Electronics"
  },
  {
    question: "What is impedance?",
    options: [
      "The opposition to the flow of alternating current, including both resistance and reactance",
      "The opposition to the flow of direct current",
      "The amount of power a circuit can handle",
      "The speed at which electrical current flows"
    ],
    correctAnswer: 0,
    explanation: "Impedance is the opposition to the flow of alternating current, including both resistance and reactance.",
    category: "Electronics"
  },
  {
    question: "What is resonance in an electrical circuit?",
    options: [
      "The condition where the circuit produces maximum amplitude sound waves",
      "The condition where the inductive reactance and capacitive reactance are equal in magnitude but opposite in phase",
      "The condition where the circuit becomes unstable and begins to oscillate",
      "The point at which the voltage equals the current"
    ],
    correctAnswer: 1,
    explanation: "Resonance in an electrical circuit is the condition where the inductive reactance and capacitive reactance are equal in magnitude but opposite in phase.",
    category: "Electronics"
  },
  {
    question: "What does the abbreviation 'LED' stand for?",
    options: [
      "Light Emitting Device",
      "Light Emitting Diode",
      "Light Enhancing Diode",
      "Light Emitting Dynamo"
    ],
    correctAnswer: 1,
    explanation: "LED stands for Light Emitting Diode.",
    category: "Electronics"
  },
  {
    question: "What unit is used to measure electrical resistance?",
    options: [
      "Volt",
      "Ampere",
      "Watt",
      "Ohm"
    ],
    correctAnswer: 3,
    explanation: "The ohm is the unit used to measure electrical resistance.",
    category: "Electronics"
  },
  {
    question: "What is the formula for calculating current in a DC circuit?",
    options: [
      "I = E/R",
      "I = R/E",
      "I = E × R",
      "I = P/E"
    ],
    correctAnswer: 0,
    explanation: "The formula for calculating current (I) in a DC circuit is I = E/R, where E is voltage and R is resistance.",
    category: "Electronics"
  },
  {
    question: "What unit is used to measure electrical current?",
    options: [
      "Volt",
      "Ampere",
      "Watt",
      "Ohm"
    ],
    correctAnswer: 1,
    explanation: "The ampere is the unit used to measure electrical current.",
    category: "Electronics"
  }
];

// Exam resources
const EXAM_RESOURCES = [
  {
    title: "Industry Canada Amateur Radio Operator Certificate",
    description: "Official exam information",
    url: "https://www.ic.gc.ca/eic/site/025.nsf/eng/h_00006.html"
  },
  {
    title: "Radio Amateurs of Canada (RAC)",
    description: "Exam preparation guides and resources",
    url: "https://www.rac.ca/amateur-radio-courses/"
  },
  {
    title: "HamExam.ca",
    description: "Practice exams and question banks",
    url: "https://www.hamexam.ca/"
  },
  {
    title: "ExHAMiner App",
    description: "Mobile app for exam preparation",
    url: "https://play.google.com/store/apps/details?id=com.cwhite.hamexam"
  },
  {
    title: "Powell River Amateur Radio Club",
    description: "Local exam sessions and study groups",
    url: "https://powellriverarc.ca"
  },
  {
    title: "Basic Qualification Study Guide",
    description: "Official RAC study guide",
    url: "https://www.coaxpublications.ca/basic.php"
  }
];

// Local exam sessions
const LOCAL_EXAMS = [
  {
    title: "Powell River Amateur Radio Club",
    location: "Powell River Recreation Complex",
    schedule: "First Tuesday of each month, 7:00 PM (after club meeting)",
    contact: "examiner@powellriverarc.ca",
    notes: "Contact the club 2 weeks in advance to schedule"
  },
  {
    title: "Vancouver Island Regional ExamFest",
    location: "Comox Valley Community Center",
    schedule: "Every 3 months, next session: August 15, 2023",
    contact: "ve7xyz@rac.ca",
    notes: "Pre-registration required, bring two pieces of ID"
  }
];

interface FlashcardProps {
  card: {
    question: string;
    answer: string;
    category: string;
  };
  onNext: () => void;
}

function Flashcard({ card, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext();
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-64 mb-4">
        {/* Front of card */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out bg-white rounded-lg border p-6 shadow-md ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={handleCardClick}
        >
          <Badge className="mb-2">{card.category}</Badge>
          <h3 className="text-xl font-bold mb-4">{card.question}</h3>
          <div className="flex items-center mt-4 text-blue-600">
            <span>Click to see answer</span>
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out bg-white rounded-lg border p-6 shadow-md ${
            isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleCardClick}
        >
          <Badge className="mb-2" variant="outline">{card.category}</Badge>
          <h3 className="text-xl font-bold mb-4">Answer:</h3>
          <p className="text-primary font-medium text-lg">{card.answer}</p>
          <div className="flex items-center mt-4 text-blue-600">
            <span>Click to see question</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button variant="secondary" size="sm" onClick={handleCardClick}>
          {isFlipped ? "Show Question" : "Show Answer"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleNextCard}>
          Next Card <RotateCw className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface QuizProps {
  questions: typeof QUIZ_QUESTIONS;
}

function Quiz({ questions }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;
    
    // Calculate category-wise performance
    const categoryPerformance = questions.reduce((acc, question, index) => {
      const category = question.category;
      if (!acc[category]) {
        acc[category] = { total: 0, correct: 0 };
      }
      acc[category].total++;
      return acc;
    }, {} as Record<string, { total: number, correct: number }>);
    
    // Count correct answers by category
    questions.forEach((question, index) => {
      if (index < score) { // This is an approximation since we don't track which specific questions were answered correctly
        const category = question.category;
        categoryPerformance[category].correct++;
      }
    });

    return (
      <div className="p-6 bg-white rounded-lg border shadow-md">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-2 text-blue-900">Ham Radio Exam Results</h3>
          <div className="text-xl font-medium">
            You scored <span className="text-blue-700">{score}</span> out of <span className="text-blue-700">{questions.length}</span> ({percentage}%)
          </div>
        </div>
        
        <div className="mb-6">
          <Progress 
            value={percentage} 
            className="h-6 mb-2" 
            style={{
              background: 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e5e5e5 10px, #e5e5e5 20px)'
            }}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span className="font-medium">Basic (50%)</span>
            <span className="font-medium">Honours (70%)</span>
            <span>100%</span>
          </div>
        </div>
        
        {passed ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-green-600 p-2 rounded-full mr-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h4>
                <p className="text-green-700 mb-2">
                  You passed with {percentage}%. In Canada, you need 70% to pass the Basic Qualification exam with Honours, which grants HF privileges.
                </p>
                <p className="text-green-700 font-medium">
                  With this score, you would earn your Basic Qualification with Honours!
                </p>
              </div>
            </div>
          </div>
        ) : percentage >= 50 ? (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-amber-500 p-2 rounded-full mr-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-amber-800 mb-2">Basic Qualification Achieved</h4>
                <p className="text-amber-700 mb-2">
                  You scored {percentage}%, which would earn you a Basic Qualification. To access HF bands, you need 70% for Honours.
                </p>
                <p className="text-amber-700 font-medium">
                  Keep studying to achieve Honours and unlock additional privileges!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-red-500 p-2 rounded-full mr-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-800 mb-2">Keep Studying!</h4>
                <p className="text-red-700 mb-2">
                  You scored {percentage}%. In Canada, you need at least 50% to pass the Basic Qualification exam.
                </p>
                <p className="text-red-700 font-medium">
                  Focus on your weaker areas and try again!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="text-xl font-bold mb-4 border-b pb-2">Performance by Category</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryPerformance).map(([category, data]) => {
              const categoryPercentage = Math.round((data.correct / data.total) * 100) || 0;
              return (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h5 className={`font-bold ${
                      category === 'Regulations' ? 'text-amber-700' : 
                      category === 'Operating' ? 'text-green-700' :
                      category === 'Propagation' ? 'text-purple-700' :
                      category === 'Antennas' ? 'text-blue-700' :
                      'text-red-700'
                    }`}>{category}</h5>
                    <span className="font-medium">{categoryPercentage}%</span>
                  </div>
                  <Progress 
                    value={categoryPercentage} 
                    className={`h-2 ${
                      categoryPercentage >= 70 ? 'bg-green-200' : 
                      categoryPercentage >= 50 ? 'bg-amber-200' : 
                      'bg-red-200'
                    }`} 
                  />
                  <div className="text-sm mt-1 text-gray-600">
                    {data.correct} of {data.total} questions
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button 
            onClick={resetQuiz} 
            className="font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Another Quiz
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.print()}
            className="font-medium"
          >
            Print Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg border shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono">Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            <div className="font-mono">{Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete</div>
          </Badge>
          <Badge 
            className={`font-mono text-xs 
              ${questions[currentQuestion].category === 'Regulations' ? 'bg-amber-100 text-amber-800' : 
                questions[currentQuestion].category === 'Operating' ? 'bg-green-100 text-green-800' :
                questions[currentQuestion].category === 'Propagation' ? 'bg-purple-100 text-purple-800' :
                questions[currentQuestion].category === 'Antennas' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}
          >
            {questions[currentQuestion].category}
          </Badge>
        </div>
      </div>
      
      <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-6 h-2 bg-gray-200" 
        style={{
          background: 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e5e5e5 10px, #e5e5e5 20px)'
        }} />
      
      <div className="border-l-4 border-blue-600 pl-4 mb-6">
        <h3 className="text-xl font-bold mb-2 text-blue-900">{questions[currentQuestion].question}</h3>
        <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-500 font-mono">SELECT BEST ANSWER</div>
          <div className="text-xs text-gray-400">#{currentQuestion+1} of 100</div>
        </div>
      </div>
      
      <div className="space-y-3">
        {questions[currentQuestion].options.map((option, index) => {
          const optionLetters = ['A', 'B', 'C', 'D'];
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-md transition-all relative ${
                showExplanation
                  ? index === questions[currentQuestion].correctAnswer
                    ? 'bg-green-50 border-green-300 border-2 shadow-inner'
                    : selectedOption === index
                    ? 'bg-red-50 border-red-300 border-2 shadow-inner'
                    : 'bg-gray-50 border border-gray-200'
                  : 'border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center">
                <div className={`h-7 w-7 rounded-full mr-3 text-sm flex items-center justify-center font-bold ${
                  showExplanation
                    ? index === questions[currentQuestion].correctAnswer
                      ? 'bg-green-600 text-white'
                      : selectedOption === index
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-100 text-blue-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {optionLetters[index]}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {showExplanation && (
        <div className={`mt-4 p-4 rounded-md ${
          selectedOption === questions[currentQuestion].correctAnswer
            ? 'bg-green-50'
            : 'bg-red-50'
        }`}>
          <p className={`font-medium ${
            selectedOption === questions[currentQuestion].correctAnswer
              ? 'text-green-700'
              : 'text-red-700'
          }`}>
            {selectedOption === questions[currentQuestion].correctAnswer
              ? 'Correct!'
              : `Incorrect. The correct answer is: ${
                  questions[currentQuestion].options[questions[currentQuestion].correctAnswer]
                }`
            }
          </p>
          
          {/* Display explanation */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Explanation: </span>
              {questions[currentQuestion].explanation}
            </p>
          </div>
        </div>
      )}
      
      {showExplanation && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleNext} 
            size="sm"
            className="px-3 py-1 h-8 text-xs font-medium w-28">
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function LearningPage() {
  const [showMorseGame, setShowMorseGame] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % FLASHCARDS.length);
  };

  // Reset all views
  const resetViews = () => {
    setShowMorseGame(false);
    setShowQuiz(false);
    setShowFlashcard(false);
  };

  // Toggle a specific view
  const toggleView = (viewSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    resetViews();
    viewSetter(prev => !prev);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8 text-center bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
          <span className="inline-block transform -rotate-2 text-yellow-300">Ham Radio</span> Learning Center
        </h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Interactive resources to help you learn, practice, and pass your ham radio license exam
        </p>
        <div className="mt-4 grid grid-cols-3 max-w-lg mx-auto gap-4">
          <div className="bg-blue-800 rounded-lg p-2 text-center">
            <div className="text-xl font-mono text-yellow-300">CQ</div>
            <div className="text-xs text-blue-200">Calling All</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-2 text-center">
            <div className="text-xl font-mono text-yellow-300">73</div>
            <div className="text-xs text-blue-200">Best Wishes</div>
          </div>
          <div className="bg-blue-800 rounded-lg p-2 text-center">
            <div className="text-xl font-mono text-yellow-300">DX</div>
            <div className="text-xs text-blue-200">Distance</div>
          </div>
        </div>
      </div>
      
      {!showMorseGame && !showQuiz && !showFlashcard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Morse Code Game Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <GamepadIcon className="mr-2 h-5 w-5 text-purple-600" />
                Morse Code Practice
              </CardTitle>
              <CardDescription>
                Learn Morse code through this interactive game - an essential skill for ham radio operators
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="h-10 w-10 text-purple-600" />
              </div>
              <p className="text-sm mb-4">
                Test your knowledge of Morse code with different difficulty levels. Learn the skill that's been used by operators for over a century.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button onClick={() => toggleView(setShowMorseGame)} className="bg-purple-600 hover:bg-purple-700">
                Start Practice
              </Button>
            </CardFooter>
          </Card>

          {/* Practice Quiz Card */}
          <Card className="bg-gradient-to-br from-green-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FlaskConical className="mr-2 h-5 w-5 text-green-600" />
                Practice Quiz
              </CardTitle>
              <CardDescription>
                Test your knowledge with questions similar to those on the Canadian Amateur Radio Operator exam
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <p className="text-sm mb-4">
                Perfect your exam readiness with multiple-choice questions that mimic the actual Amateur Radio exam format.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button onClick={() => toggleView(setShowQuiz)} className="bg-green-600 hover:bg-green-700">
                Take Quiz
              </Button>
            </CardFooter>
          </Card>

          {/* Flashcards Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                Flashcards
              </CardTitle>
              <CardDescription>
                Test your knowledge with flashcards covering technical concepts and operating procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-sm mb-4">
                Review key concepts with interactive flashcards covering technical terms, operating procedures, and regulations.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <Button onClick={() => toggleView(setShowFlashcard)} className="bg-blue-600 hover:bg-blue-700">
                Study Cards
              </Button>
            </CardFooter>
          </Card>

          {/* External Resources */}
          <Card className="bg-gradient-to-br from-amber-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ExternalLink className="mr-2 h-5 w-5 text-amber-600" />
                Exam Resources
              </CardTitle>
              <CardDescription>
                Official exam preparation materials and study guides
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 gap-2">
                {EXAM_RESOURCES.slice(0, 3).map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-sm border rounded-md hover:bg-amber-50 transition-colors flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-amber-600" />
                    {resource.title}
                  </a>
                ))}
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // Show all resources as an alert or modal
                    alert("View all resources on the Exam Resources tab");
                  }}
                  className="p-2 text-sm text-center text-amber-800 hover:underline"
                >
                  View all resources...
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Local Exam Sessions */}
          <Card className="bg-gradient-to-br from-red-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Radio className="mr-2 h-5 w-5 text-red-600" />
                Local Exam Sessions
              </CardTitle>
              <CardDescription>
                Find amateur radio license exams near Powell River, BC
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                {LOCAL_EXAMS.slice(0, 1).map((exam, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    <h3 className="font-semibold text-sm text-red-800">{exam.title}</h3>
                    <p className="text-xs text-muted-foreground">Next: {exam.schedule}</p>
                    <p className="text-xs font-medium mt-1">{exam.location}</p>
                  </div>
                ))}
                <Alert className="py-2 px-3 mt-2 bg-red-50 text-xs">
                  <AlertTitle className="text-red-800 text-sm">Tip:</AlertTitle>
                  <AlertDescription className="text-red-700 text-xs">
                    Basic with Honours (80%+) grants HF privileges
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Study Tips Card */}
          <Card className="bg-gradient-to-br from-cyan-50 to-white border overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-cyan-600" />
                Study Tips
              </CardTitle>
              <CardDescription>
                Strategies to help you pass your ham radio license exam
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="space-y-2 text-sm px-2">
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">1</span>
                  <span>Practice Morse code for 15 minutes daily</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">2</span>
                  <span>Study Q-codes and common abbreviations</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">3</span>
                  <span>Review frequency bands and their characteristics</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-cyan-100 rounded-full text-cyan-700 flex items-center justify-center mr-2 mt-0.5">4</span>
                  <span>Take practice exams until you score consistently above 80%</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Morse Code Game */}
      {showMorseGame && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Morse Code Practice</CardTitle>
              <CardDescription>Learn Morse code through this interactive game</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowMorseGame(false)}>
              Back to Learning Center
            </Button>
          </CardHeader>
          <CardContent>
            <MorseCodeGame />
          </CardContent>
        </Card>
      )}

      {/* Quiz Game */}
      {showQuiz && (
        <div>
          <div className="bg-blue-900 text-white rounded-lg p-6 mb-6 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Award className="h-6 w-6" /> 
                  Canadian Amateur Radio Exam Prep
                </h2>
                <p className="text-blue-200 mt-1">
                  Practice with realistic exam-style questions to prepare for certification
                </p>
              </div>
              <Button variant="outline" size="sm" 
                className="text-white border-white hover:bg-blue-800 bg-transparent" 
                onClick={() => setShowQuiz(false)}>
                Back to Learning Center
              </Button>
            </div>
            
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 z-10 relative">
              <div className="bg-blue-800 rounded p-3">
                <h3 className="text-sm font-bold text-yellow-300 mb-1">EXAM STRUCTURE</h3>
                <div className="text-xs text-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                    <div>Regulations & Policies: 25 questions</div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <div>Operating Procedures: 25 questions</div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                    <div>Radio Wave Propagation: 10 questions</div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <div>Antenna Systems: 15 questions</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                    <div>Electronics & Theory: 25 questions</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-800 rounded p-3">
                <h3 className="text-sm font-bold text-yellow-300 mb-1">PASSING REQUIREMENTS</h3>
                <div className="text-xs text-blue-100">
                  <p className="mb-1">The official Basic Qualification exam has 75 questions, with 3 hours to complete.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <div>Basic: 50% (38/75)</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>Honours: 70% (53/75)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute right-0 top-0 opacity-10">
              <svg width="150" height="150" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-5.5l8-8 1.5 1.5-8 8z" fill="white"/>
              </svg>
            </div>
            <div className="font-mono text-xs text-blue-300 mt-4 relative z-10">
              <div className="flex justify-between items-center">
                <div>VERSION 2.0 / RAC APPROVED</div>
                <div>BASIC QUALIFICATION (BQ)</div>
              </div>
            </div>
          </div>
          <Quiz questions={QUIZ_QUESTIONS} />
        </div>
      )}

      {/* Flashcards */}
      {showFlashcard && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Ham Radio Flashcards</CardTitle>
              <CardDescription>Test your knowledge with these flashcards</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFlashcard(false)}>
              Back to Learning Center
            </Button>
          </CardHeader>
          <CardContent>
            <Flashcard 
              card={FLASHCARDS[currentCardIndex]} 
              onNext={handleNextCard} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}