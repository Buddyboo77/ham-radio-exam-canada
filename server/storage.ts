import { 
  frequencies, 
  type Frequency, 
  type InsertFrequency,
  repeaters,
  type Repeater,
  type InsertRepeater,
  logEntries,
  type LogEntry,
  type InsertLogEntry,
  referenceItems,
  type ReferenceItem,
  type InsertReferenceItem,
  weatherCache,
  type WeatherCache,
  type InsertWeatherCache,
  users, 
  type User, 
  type InsertUser 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Frequency operations
  getAllFrequencies(): Promise<Frequency[]>;
  getFrequencyById(id: number): Promise<Frequency | undefined>;
  getFrequenciesByCategory(category: string): Promise<Frequency[]>;
  createFrequency(frequency: InsertFrequency): Promise<Frequency>;
  updateFrequency(id: number, frequency: Partial<InsertFrequency>): Promise<Frequency | undefined>;
  updateFrequencyMonitored(id: number, isMonitored: boolean): Promise<Frequency | undefined>;
  getMonitoredFrequencies(): Promise<Frequency[]>;
  
  // Repeater operations
  getAllRepeaters(): Promise<Repeater[]>;
  getRepeaterById(id: number): Promise<Repeater | undefined>;
  createRepeater(repeater: InsertRepeater): Promise<Repeater>;
  updateRepeater(id: number, repeater: Partial<InsertRepeater>): Promise<Repeater | undefined>;
  
  // Log entry operations
  getAllLogEntries(): Promise<LogEntry[]>;
  getLogEntryById(id: number): Promise<LogEntry | undefined>;
  createLogEntry(logEntry: InsertLogEntry): Promise<LogEntry>;
  updateLogEntry(id: number, logEntry: Partial<InsertLogEntry>): Promise<LogEntry | undefined>;
  deleteLogEntry(id: number): Promise<boolean>;
  
  // Reference item operations
  getAllReferenceItems(): Promise<ReferenceItem[]>;
  getReferenceItemsByCategory(category: string): Promise<ReferenceItem[]>;
  getReferenceItemById(id: number): Promise<ReferenceItem | undefined>;
  createReferenceItem(referenceItem: InsertReferenceItem): Promise<ReferenceItem>;
  
  // Weather operations
  getWeatherByLocation(location: string): Promise<WeatherCache | undefined>;
  updateWeatherCache(weatherData: InsertWeatherCache): Promise<WeatherCache>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private frequencies: Map<number, Frequency>;
  private repeaters: Map<number, Repeater>;
  private logEntries: Map<number, LogEntry>;
  private referenceItems: Map<number, ReferenceItem>;
  private weatherCache: Map<string, WeatherCache>;
  
  private userCurrentId: number;
  private frequencyCurrentId: number;
  private repeaterCurrentId: number;
  private logEntryCurrentId: number;
  private referenceItemCurrentId: number;
  private weatherCacheCurrentId: number;

  constructor() {
    this.users = new Map();
    this.frequencies = new Map();
    this.repeaters = new Map();
    this.logEntries = new Map();
    this.referenceItems = new Map();
    this.weatherCache = new Map();
    
    this.userCurrentId = 1;
    this.frequencyCurrentId = 1;
    this.repeaterCurrentId = 1;
    this.logEntryCurrentId = 1;
    this.referenceItemCurrentId = 1;
    this.weatherCacheCurrentId = 1;
    
    // Initialize with Powell River ham radio data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Frequency operations
  async getAllFrequencies(): Promise<Frequency[]> {
    return Array.from(this.frequencies.values());
  }
  
  async getFrequencyById(id: number): Promise<Frequency | undefined> {
    return this.frequencies.get(id);
  }
  
  async getFrequenciesByCategory(category: string): Promise<Frequency[]> {
    return Array.from(this.frequencies.values()).filter(
      frequency => frequency.category === category
    );
  }
  
  async createFrequency(insertFrequency: InsertFrequency): Promise<Frequency> {
    const id = this.frequencyCurrentId++;
    const frequency: Frequency = { ...insertFrequency, id };
    this.frequencies.set(id, frequency);
    return frequency;
  }
  
  async updateFrequency(id: number, frequencyUpdate: Partial<InsertFrequency>): Promise<Frequency | undefined> {
    const existingFrequency = this.frequencies.get(id);
    if (!existingFrequency) return undefined;
    
    const updatedFrequency = { ...existingFrequency, ...frequencyUpdate };
    this.frequencies.set(id, updatedFrequency);
    return updatedFrequency;
  }
  
  async updateFrequencyMonitored(id: number, isMonitored: boolean): Promise<Frequency | undefined> {
    return this.updateFrequency(id, { isMonitored });
  }
  
  async getMonitoredFrequencies(): Promise<Frequency[]> {
    return Array.from(this.frequencies.values()).filter(
      frequency => frequency.isMonitored
    );
  }
  
  // Repeater operations
  async getAllRepeaters(): Promise<Repeater[]> {
    return Array.from(this.repeaters.values());
  }
  
  async getRepeaterById(id: number): Promise<Repeater | undefined> {
    return this.repeaters.get(id);
  }
  
  async createRepeater(insertRepeater: InsertRepeater): Promise<Repeater> {
    const id = this.repeaterCurrentId++;
    const repeater: Repeater = { ...insertRepeater, id };
    this.repeaters.set(id, repeater);
    return repeater;
  }
  
  async updateRepeater(id: number, repeaterUpdate: Partial<InsertRepeater>): Promise<Repeater | undefined> {
    const existingRepeater = this.repeaters.get(id);
    if (!existingRepeater) return undefined;
    
    const updatedRepeater = { ...existingRepeater, ...repeaterUpdate };
    this.repeaters.set(id, updatedRepeater);
    return updatedRepeater;
  }
  
  // Log entry operations
  async getAllLogEntries(): Promise<LogEntry[]> {
    return Array.from(this.logEntries.values()).sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
  }
  
  async getLogEntryById(id: number): Promise<LogEntry | undefined> {
    return this.logEntries.get(id);
  }
  
  async createLogEntry(insertLogEntry: InsertLogEntry): Promise<LogEntry> {
    const id = this.logEntryCurrentId++;
    const logEntry: LogEntry = { ...insertLogEntry, id };
    this.logEntries.set(id, logEntry);
    return logEntry;
  }
  
  async updateLogEntry(id: number, logEntryUpdate: Partial<InsertLogEntry>): Promise<LogEntry | undefined> {
    const existingLogEntry = this.logEntries.get(id);
    if (!existingLogEntry) return undefined;
    
    const updatedLogEntry = { ...existingLogEntry, ...logEntryUpdate };
    this.logEntries.set(id, updatedLogEntry);
    return updatedLogEntry;
  }
  
  async deleteLogEntry(id: number): Promise<boolean> {
    return this.logEntries.delete(id);
  }
  
  // Reference item operations
  async getAllReferenceItems(): Promise<ReferenceItem[]> {
    return Array.from(this.referenceItems.values()).sort((a, b) => {
      if (a.category === b.category) {
        return a.sortOrder - b.sortOrder;
      }
      return a.category.localeCompare(b.category);
    });
  }
  
  async getReferenceItemsByCategory(category: string): Promise<ReferenceItem[]> {
    return Array.from(this.referenceItems.values())
      .filter(item => item.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  async getReferenceItemById(id: number): Promise<ReferenceItem | undefined> {
    return this.referenceItems.get(id);
  }
  
  async createReferenceItem(insertReferenceItem: InsertReferenceItem): Promise<ReferenceItem> {
    const id = this.referenceItemCurrentId++;
    const referenceItem: ReferenceItem = { ...insertReferenceItem, id };
    this.referenceItems.set(id, referenceItem);
    return referenceItem;
  }
  
  // Weather operations
  async getWeatherByLocation(location: string): Promise<WeatherCache | undefined> {
    return this.weatherCache.get(location);
  }
  
  async updateWeatherCache(insertWeatherCache: InsertWeatherCache): Promise<WeatherCache> {
    const id = this.weatherCacheCurrentId++;
    const weatherData: WeatherCache = { ...insertWeatherCache, id };
    this.weatherCache.set(insertWeatherCache.location, weatherData);
    return weatherData;
  }
  
  // Initialize data with Powell River ham radio information
  private initializeData() {
    // Add frequencies
    this.createFrequency({
      frequency: 146.84,
      name: "Powell River Amateur Radio Club",
      tone: "103.5 Hz",
      description: "Main repeater for Powell River area",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "VHF",
      isMonitored: false
    });
    
    this.createFrequency({
      frequency: 147.2,
      name: "Texada Island Repeater",
      tone: "123.0 Hz",
      description: "Repeater on Texada Island",
      isEmergency: false,
      isActive: false,
      status: "inactive",
      category: "VHF",
      isMonitored: false
    });
    
    this.createFrequency({
      frequency: 146.52,
      name: "National Simplex Calling",
      tone: "No Tone",
      description: "National calling frequency",
      isEmergency: true,
      isActive: false,
      status: "inactive",
      category: "VHF",
      isMonitored: false
    });
    
    this.createFrequency({
      frequency: 443.125,
      name: "Powell River UHF Repeater",
      tone: "103.5 Hz",
      description: "UHF repeater for Powell River area",
      isEmergency: false,
      isActive: false,
      status: "intermittent",
      category: "UHF",
      isMonitored: false
    });
    
    // Add repeaters
    this.createRepeater({
      name: "Powell River Amateur Radio Club",
      frequency: 146.84,
      offset: -0.6,
      tone: "103.5 Hz",
      status: "operational",
      location: "Myrtle Rock Lookout, Powell River",
      latitude: 49.8268,
      longitude: -124.5248,
      coverage: "Powell River, Texada Island, portions of Vancouver Island",
      notes: "Main repeater for the Powell River area"
    });
    
    this.createRepeater({
      name: "Texada Island Repeater",
      frequency: 147.2,
      offset: 0.6,
      tone: "123.0 Hz",
      status: "operational",
      location: "Mount Pocahontas, Texada Island",
      latitude: 49.6942,
      longitude: -124.4050,
      coverage: "Texada Island, Powell River, parts of Vancouver Island",
      notes: "Excellent coverage across the strait"
    });
    
    this.createRepeater({
      name: "Powell River UHF Repeater",
      frequency: 443.125,
      offset: 5.0,
      tone: "103.5 Hz",
      status: "intermittent",
      location: "Powell River",
      latitude: 49.8352,
      longitude: -124.5247,
      coverage: "Powell River city limits",
      notes: "Experiencing occasional outages"
    });
    
    // Add reference items
    // Emergency Protocols
    this.createReferenceItem({
      category: "Emergency Protocols",
      title: "Emergency Frequencies",
      description: "VHF: 146.520 MHz - National Calling Frequency\nPowell River Emergency: 146.840 MHz\nMarine Distress: 156.800 MHz (Channel 16)",
      sortOrder: 1
    });
    
    this.createReferenceItem({
      category: "Emergency Protocols",
      title: "Emergency Procedures",
      description: "1. Clearly state \"MAYDAY, MAYDAY, MAYDAY\" for life-threatening emergencies\n2. Give your call sign\n3. State location as precisely as possible\n4. Describe the emergency situation\n5. Specify assistance needed\n6. Provide number of persons involved and condition",
      sortOrder: 2
    });
    
    this.createReferenceItem({
      category: "Emergency Protocols",
      title: "Powell River Emergency Resources",
      description: "Powell River Emergency Operations Center: 604-485-8600\nPowell River Amateur Radio Club Emergency Coordinator: VE7ABC\nPowell River Hospital: 604-485-3211",
      sortOrder: 3
    });
    
    // Q Codes
    this.createReferenceItem({
      category: "Q Codes",
      title: "QRM",
      description: "I am being interfered with",
      sortOrder: 1
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QRN",
      description: "I am troubled by static",
      sortOrder: 2
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QRO",
      description: "Increase power",
      sortOrder: 3
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QRP",
      description: "Decrease power",
      sortOrder: 4
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QRT",
      description: "Stop sending",
      sortOrder: 5
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QRZ",
      description: "Who is calling me?",
      sortOrder: 6
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QSL",
      description: "I acknowledge receipt",
      sortOrder: 7
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QSO",
      description: "I can communicate with",
      sortOrder: 8
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QSY",
      description: "Change frequency",
      sortOrder: 9
    });
    
    this.createReferenceItem({
      category: "Q Codes",
      title: "QTH",
      description: "My location is",
      sortOrder: 10
    });
    
    // Phonetic Alphabet
    this.createReferenceItem({
      category: "Phonetic Alphabet",
      title: "A-F",
      description: "A - Alpha\nB - Bravo\nC - Charlie\nD - Delta\nE - Echo\nF - Foxtrot",
      sortOrder: 1
    });
    
    this.createReferenceItem({
      category: "Phonetic Alphabet",
      title: "G-L",
      description: "G - Golf\nH - Hotel\nI - India\nJ - Juliet\nK - Kilo\nL - Lima",
      sortOrder: 2
    });
    
    this.createReferenceItem({
      category: "Phonetic Alphabet",
      title: "M-R",
      description: "M - Mike\nN - November\nO - Oscar\nP - Papa\nQ - Quebec\nR - Romeo",
      sortOrder: 3
    });
    
    this.createReferenceItem({
      category: "Phonetic Alphabet",
      title: "S-Z",
      description: "S - Sierra\nT - Tango\nU - Uniform\nV - Victor\nW - Whiskey\nX - X-ray\nY - Yankee\nZ - Zulu",
      sortOrder: 4
    });
    
    // Signal Reports
    this.createReferenceItem({
      category: "Signal Reports",
      title: "RST System",
      description: "R - Readability (1-5)\n1: Unreadable\n2: Barely readable\n3: Readable with difficulty\n4: Readable with almost no difficulty\n5: Perfectly readable\n\nS - Strength (1-9)\n1: Faint signals barely perceptible\n9: Extremely strong signals\n\nT - Tone (1-9, used in CW/Morse)\n1: Extremely rough note\n9: Perfect tone",
      sortOrder: 1
    });
    
    this.createReferenceItem({
      category: "Signal Reports",
      title: "Common Signal Reports",
      description: "59 or 5-9: Excellent copy, very strong signal (ideal)\n57 or 5-7: Good copy, strong signal\n55 or 5-5: Fair copy, moderate signal\n53 or 5-3: Readable with difficulty\n51 or 5-1: Barely readable",
      sortOrder: 2
    });
    
    // Club Information
    this.createReferenceItem({
      category: "Powell River Amateur Radio Club",
      title: "Club Information",
      description: "Meeting Location: Powell River Recreation Complex\nMeeting Time: First Tuesday of each month at 7:00 PM\nClub Callsign: VE7PRN\nWebsite: https://powellriverarc.ca\nMailing Address: P.O. Box 85, Powell River, BC V8A 4Z5",
      sortOrder: 1
    });
    
    this.createReferenceItem({
      category: "Powell River Amateur Radio Club",
      title: "Club Nets",
      description: "Weekly Net: Thursday 7:00 PM on 146.840 MHz\nEmergency Net: First Sunday of each month at 1:00 PM on 146.840 MHz",
      sortOrder: 2
    });
    
    // Add initial weather data
    this.updateWeatherCache({
      location: "Powell River, BC",
      temperature: 12,
      condition: "Partly Cloudy",
      windSpeed: 5,
      windDirection: "NW",
      lastUpdated: new Date(),
      rawData: JSON.stringify({
        temp: 12,
        condition: "Partly Cloudy",
        wind: { speed: 5, direction: "NW" }
      })
    });
    
    // Sample log entry
    this.createLogEntry({
      dateTime: new Date("2023-05-15T10:25:00"),
      frequency: 146.84,
      callSign: "VE7ABC",
      operatorName: "John Smith",
      location: "Texada Island",
      signalReport: "59",
      notes: "Clear conversation about upcoming field day event. Good signal strength throughout.",
    });
    
    this.createLogEntry({
      dateTime: new Date("2023-05-12T16:45:00"),
      frequency: 147.2,
      callSign: "VE7XYZ",
      operatorName: "Mary Johnson",
      location: "Vancouver Island",
      signalReport: "57",
      notes: "Discussed local weather conditions and equipment setup.",
    });
    
    this.createLogEntry({
      dateTime: new Date("2023-05-10T19:15:00"),
      frequency: 443.125,
      callSign: "VA7DEF",
      operatorName: "Robert Wilson",
      location: "Powell River",
      signalReport: "55",
      notes: "Brief contact with occasional signal fading.",
    });
  }
}

export const storage = new MemStorage();
