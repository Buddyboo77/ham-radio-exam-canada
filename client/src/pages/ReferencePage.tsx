import { useState } from "react";
import { AlertTriangle, GraduationCap, Shield } from "lucide-react";
import HamLicenseGuide from "@/components/reference/HamLicenseGuide";

const EMERGENCY_FREQUENCIES = [
  { label: "VHF National Calling", freq: "146.52 MHz", note: "Simplex — monitor during emergencies" },
  { label: "UHF National Calling", freq: "446.00 MHz", note: "Alternative calling frequency" },
  { label: "HF International Distress", freq: "14.300 MHz", note: "International SSB calling" },
  { label: "Marine Channel 16", freq: "156.800 MHz", note: "International distress & calling" },
];

const PHONETIC_ALPHABET = [
  ["A", "Alpha"], ["B", "Bravo"], ["C", "Charlie"], ["D", "Delta"],
  ["E", "Echo"], ["F", "Foxtrot"], ["G", "Golf"], ["H", "Hotel"],
  ["I", "India"], ["J", "Juliet"], ["K", "Kilo"], ["L", "Lima"],
  ["M", "Mike"], ["N", "November"], ["O", "Oscar"], ["P", "Papa"],
  ["Q", "Quebec"], ["R", "Romeo"], ["S", "Sierra"], ["T", "Tango"],
  ["U", "Uniform"], ["V", "Victor"], ["W", "Whiskey"], ["X", "X-Ray"],
  ["Y", "Yankee"], ["Z", "Zulu"],
];

const Q_CODES = [
  { code: "QRZ", meaning: "Who is calling me?" },
  { code: "QSO", meaning: "I can communicate with ___" },
  { code: "QTH", meaning: "My location is ___" },
  { code: "QSL", meaning: "I acknowledge receipt" },
  { code: "QRM", meaning: "I am being interfered with" },
  { code: "QRN", meaning: "I am troubled by static" },
  { code: "QSY", meaning: "Change frequency to ___" },
  { code: "QRX", meaning: "Wait / Stand by" },
  { code: "QRT", meaning: "Stop transmitting" },
  { code: "QRV", meaning: "I am ready to operate" },
  { code: "QRO", meaning: "Increase transmitter power" },
  { code: "QRP", meaning: "Reduce transmitter power" },
  { code: "QST", meaning: "General call to all stations" },
  { code: "QTR", meaning: "What is the correct time?" },
];

type Tab = "license" | "emergency" | "phonetic" | "qcodes";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "license", label: "License Guide", icon: <GraduationCap size={16} /> },
  { id: "emergency", label: "Emergency", icon: <AlertTriangle size={16} /> },
  { id: "phonetic", label: "Phonetic", icon: <span className="text-xs font-bold">A/B</span> },
  { id: "qcodes", label: "Q Codes", icon: <span className="text-xs font-bold">Q?</span> },
];

const ReferencePage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("license");

  return (
    <div className="p-3 pb-4">
      {/* Page header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="radio-led green"></div>
        <h2 className="text-sm font-mono tracking-wide text-blue-100 uppercase">Study Guide</h2>
      </div>

      {/* Tab buttons — 2×2 grid for easy tapping on mobile */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium border transition-all ${
              activeTab === tab.id
                ? "bg-blue-700 border-blue-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* License Guide */}
      {activeTab === "license" && <HamLicenseGuide />}

      {/* Emergency Tab */}
      {activeTab === "emergency" && (
        <div className="space-y-3">
          <div className="bg-red-950 bg-opacity-40 rounded-lg p-3 border border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={15} className="text-red-400" />
              <h3 className="text-sm font-semibold text-red-300">Emergency Communications</h3>
            </div>
            <p className="text-xs text-gray-300">
              When conventional infrastructure fails, amateur radio operators play a critical role.
              Use <span className="text-red-300 font-medium">"MAYDAY"</span> for life-threatening emergencies,
              <span className="text-amber-300 font-medium"> "PAN PAN"</span> for urgent situations.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-700 bg-gray-900">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Key Frequencies</span>
            </div>
            <div className="divide-y divide-gray-700">
              {EMERGENCY_FREQUENCIES.map(f => (
                <div key={f.label} className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-200">{f.label}</span>
                    <span className="text-sm font-bold text-green-400 font-mono">{f.freq}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{f.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-700 bg-gray-900">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Emergency Traffic Priority</span>
            </div>
            <div className="px-3 py-3 space-y-2 text-xs text-gray-300">
              <p>• <span className="text-red-300 font-medium">MAYDAY</span> — immediate danger to life (3× repeated)</p>
              <p>• <span className="text-amber-300 font-medium">PAN PAN</span> — urgent, no immediate danger to life</p>
              <p>• <span className="text-blue-300 font-medium">SECURITE</span> — safety message (navigation hazard)</p>
              <p>• Stand by on calling frequency until directed to working frequency</p>
              <p>• Log all emergency traffic with time and callsigns</p>
            </div>
          </div>
        </div>
      )}

      {/* Phonetic Alphabet */}
      {activeTab === "phonetic" && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-700 bg-gray-900">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">NATO Phonetic Alphabet</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-700">
            <div className="divide-y divide-gray-700">
              {PHONETIC_ALPHABET.slice(0, 13).map(([letter, word]) => (
                <div key={letter} className="flex items-center gap-3 px-3 py-2">
                  <span className="text-blue-400 font-bold font-mono w-4 text-sm">{letter}</span>
                  <span className="text-gray-200 text-xs">{word}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-gray-700">
              {PHONETIC_ALPHABET.slice(13).map(([letter, word]) => (
                <div key={letter} className="flex items-center gap-3 px-3 py-2">
                  <span className="text-blue-400 font-bold font-mono w-4 text-sm">{letter}</span>
                  <span className="text-gray-200 text-xs">{word}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Q Codes */}
      {activeTab === "qcodes" && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-700 bg-gray-900">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Common Q Codes</span>
          </div>
          <div className="divide-y divide-gray-700">
            {Q_CODES.map(({ code, meaning }) => (
              <div key={code} className="flex items-start gap-3 px-3 py-2.5">
                <span className="text-green-400 font-bold font-mono text-sm w-10 shrink-0">{code}</span>
                <span className="text-gray-300 text-xs leading-relaxed">{meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferencePage;
