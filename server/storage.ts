import { 
  users, frequencies, repeaters, logEntries, referenceItems, weatherCache, examQuestions,
  type User, type InsertUser, 
  type Frequency, type InsertFrequency,
  type Repeater, type InsertRepeater,
  type LogEntry, type InsertLogEntry,
  type ReferenceItem, type InsertReferenceItem,
  type WeatherCache, type InsertWeatherCache,
  type ExamQuestion, type InsertExamQuestion
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc, sql } from "drizzle-orm";
import { EMERGENCY_FREQUENCY } from "@/lib/constants";

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
  
  // Exam question operations
  getAllExamQuestions(): Promise<ExamQuestion[]>;
  getExamQuestionsByCategory(category: string): Promise<ExamQuestion[]>;
  getExamQuestionsByType(examType: string): Promise<ExamQuestion[]>;
  getExamQuestionsByDifficulty(difficulty: string): Promise<ExamQuestion[]>;
  getRandomExamQuestions(count: number, category?: string, examType?: string): Promise<ExamQuestion[]>;
  createExamQuestion(question: InsertExamQuestion): Promise<ExamQuestion>;
  createExamQuestions(questions: InsertExamQuestion[]): Promise<ExamQuestion[]>;
  updateExamQuestion(id: number, question: Partial<InsertExamQuestion>): Promise<ExamQuestion | undefined>;
  deleteExamQuestion(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0];
  }

  // Frequency operations
  async getAllFrequencies(): Promise<Frequency[]> {
    return await db.select().from(frequencies).orderBy(asc(frequencies.frequency));
  }

  async getFrequencyById(id: number): Promise<Frequency | undefined> {
    const results = await db.select().from(frequencies).where(eq(frequencies.id, id));
    return results[0];
  }

  async getFrequenciesByCategory(category: string): Promise<Frequency[]> {
    return await db.select().from(frequencies)
      .where(eq(frequencies.category, category))
      .orderBy(asc(frequencies.frequency));
  }

  async createFrequency(insertFrequency: InsertFrequency): Promise<Frequency> {
    const results = await db.insert(frequencies).values(insertFrequency).returning();
    return results[0];
  }

  async updateFrequency(id: number, frequencyUpdate: Partial<InsertFrequency>): Promise<Frequency | undefined> {
    const results = await db.update(frequencies)
      .set(frequencyUpdate)
      .where(eq(frequencies.id, id))
      .returning();
    return results[0];
  }

  async updateFrequencyMonitored(id: number, isMonitored: boolean): Promise<Frequency | undefined> {
    const results = await db.update(frequencies)
      .set({ isMonitored })
      .where(eq(frequencies.id, id))
      .returning();
    return results[0];
  }

  async getMonitoredFrequencies(): Promise<Frequency[]> {
    return await db.select().from(frequencies)
      .where(eq(frequencies.isMonitored, true))
      .orderBy(asc(frequencies.frequency));
  }

  // Repeater operations
  async getAllRepeaters(): Promise<Repeater[]> {
    return await db.select().from(repeaters).orderBy(asc(repeaters.frequency));
  }

  async getRepeaterById(id: number): Promise<Repeater | undefined> {
    const results = await db.select().from(repeaters).where(eq(repeaters.id, id));
    return results[0];
  }

  async createRepeater(insertRepeater: InsertRepeater): Promise<Repeater> {
    const results = await db.insert(repeaters).values(insertRepeater).returning();
    return results[0];
  }

  async updateRepeater(id: number, repeaterUpdate: Partial<InsertRepeater>): Promise<Repeater | undefined> {
    const results = await db.update(repeaters)
      .set(repeaterUpdate)
      .where(eq(repeaters.id, id))
      .returning();
    return results[0];
  }

  // Log entry operations
  async getAllLogEntries(): Promise<LogEntry[]> {
    return await db.select().from(logEntries).orderBy(desc(logEntries.dateTime));
  }

  async getLogEntryById(id: number): Promise<LogEntry | undefined> {
    const results = await db.select().from(logEntries).where(eq(logEntries.id, id));
    return results[0];
  }

  async createLogEntry(insertLogEntry: InsertLogEntry): Promise<LogEntry> {
    const results = await db.insert(logEntries).values(insertLogEntry).returning();
    return results[0];
  }

  async updateLogEntry(id: number, logEntryUpdate: Partial<InsertLogEntry>): Promise<LogEntry | undefined> {
    const results = await db.update(logEntries)
      .set(logEntryUpdate)
      .where(eq(logEntries.id, id))
      .returning();
    return results[0];
  }

  async deleteLogEntry(id: number): Promise<boolean> {
    const results = await db.delete(logEntries).where(eq(logEntries.id, id)).returning();
    return results.length > 0;
  }

  // Reference item operations
  async getAllReferenceItems(): Promise<ReferenceItem[]> {
    return await db.select().from(referenceItems)
      .orderBy(asc(referenceItems.category), asc(referenceItems.sortOrder));
  }

  async getReferenceItemsByCategory(category: string): Promise<ReferenceItem[]> {
    return await db.select().from(referenceItems)
      .where(eq(referenceItems.category, category))
      .orderBy(asc(referenceItems.sortOrder));
  }

  async getReferenceItemById(id: number): Promise<ReferenceItem | undefined> {
    const results = await db.select().from(referenceItems).where(eq(referenceItems.id, id));
    return results[0];
  }

  async createReferenceItem(insertReferenceItem: InsertReferenceItem): Promise<ReferenceItem> {
    const results = await db.insert(referenceItems).values(insertReferenceItem).returning();
    return results[0];
  }

  // Weather operations
  async getWeatherByLocation(location: string): Promise<WeatherCache | undefined> {
    const results = await db.select().from(weatherCache).where(eq(weatherCache.location, location));
    return results[0];
  }

  async updateWeatherCache(insertWeatherCache: InsertWeatherCache): Promise<WeatherCache> {
    // First check if it exists
    const existing = await this.getWeatherByLocation(insertWeatherCache.location);
    
    if (existing) {
      // Update existing record
      const results = await db.update(weatherCache)
        .set(insertWeatherCache)
        .where(eq(weatherCache.id, existing.id))
        .returning();
      return results[0];
    } else {
      // Create new record
      const results = await db.insert(weatherCache).values(insertWeatherCache).returning();
      return results[0];
    }
  }

  // Exam question operations
  async getAllExamQuestions(): Promise<ExamQuestion[]> {
    return await db.select().from(examQuestions)
      .where(eq(examQuestions.isActive, true))
      .orderBy(asc(examQuestions.category), asc(examQuestions.id));
  }

  async getExamQuestionsByCategory(category: string): Promise<ExamQuestion[]> {
    return await db.select().from(examQuestions)
      .where(and(eq(examQuestions.category, category), eq(examQuestions.isActive, true)))
      .orderBy(asc(examQuestions.id));
  }

  async getExamQuestionsByType(examType: string): Promise<ExamQuestion[]> {
    return await db.select().from(examQuestions)
      .where(and(eq(examQuestions.examType, examType), eq(examQuestions.isActive, true)))
      .orderBy(asc(examQuestions.category), asc(examQuestions.id));
  }

  async getExamQuestionsByDifficulty(difficulty: string): Promise<ExamQuestion[]> {
    return await db.select().from(examQuestions)
      .where(and(eq(examQuestions.difficulty, difficulty), eq(examQuestions.isActive, true)))
      .orderBy(asc(examQuestions.category), asc(examQuestions.id));
  }

  async getRandomExamQuestions(count: number, category?: string, examType?: string): Promise<ExamQuestion[]> {
    // Build conditions array
    const conditions = [eq(examQuestions.isActive, true)];
    
    if (category) {
      conditions.push(eq(examQuestions.category, category));
    }
    
    if (examType) {
      conditions.push(eq(examQuestions.examType, examType));
    }
    
    // Use database-level random sampling for much better performance
    // This avoids loading all questions into memory and does the randomization in PostgreSQL
    return await db.select().from(examQuestions)
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  async createExamQuestion(insertExamQuestion: InsertExamQuestion): Promise<ExamQuestion> {
    const results = await db.insert(examQuestions).values(insertExamQuestion).returning();
    return results[0];
  }

  async createExamQuestions(insertExamQuestions: InsertExamQuestion[]): Promise<ExamQuestion[]> {
    const results = await db.insert(examQuestions).values(insertExamQuestions).returning();
    return results;
  }

  async updateExamQuestion(id: number, questionUpdate: Partial<InsertExamQuestion>): Promise<ExamQuestion | undefined> {
    const results = await db.update(examQuestions)
      .set(questionUpdate)
      .where(eq(examQuestions.id, id))
      .returning();
    return results[0];
  }

  async deleteExamQuestion(id: number): Promise<boolean> {
    const results = await db.update(examQuestions)
      .set({ isActive: false })
      .where(eq(examQuestions.id, id))
      .returning();
    return results.length > 0;
  }

  // Initialize the database with sample data if it's empty
  async initializeData() {
    // Check if we have any data already
    const freqCount = await db.select({ count: frequencies.id }).from(frequencies);
    if (freqCount.length && freqCount[0].count) {
      return; // Database already has data
    }

    // Add frequencies
    // VHF Repeaters
    await this.createFrequency({
      frequency: 146.84,
      name: "Powell River Amateur Radio Club",
      tone: "103.5 Hz",
      description: "Main repeater for Powell River, wide coverage of local area and parts of Vancouver Island",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "VHF",
      isMonitored: true
    });
    
    await this.createFrequency({
      frequency: 147.2,
      name: "Texada Island Repeater",
      tone: "123.0 Hz",
      description: "Repeater on Texada Island with excellent coverage of Strait of Georgia",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "VHF",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 145.47,
      name: "Savary Island Repeater",
      tone: "100.0 Hz",
      description: "Located on Savary Island, good for coastal communications",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "VHF",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 145.15,
      name: "Lund Area Repeater",
      tone: "103.5 Hz",
      description: "Covers northern Sunshine Coast and Desolation Sound",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "VHF",
      isMonitored: false
    });
    
    // UHF Repeaters
    await this.createFrequency({
      frequency: 443.125,
      name: "Powell River UHF Repeater",
      tone: "103.5 Hz",
      description: "UHF repeater for Powell River area, good for local communications",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "UHF",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 444.925,
      name: "Texada Island UHF",
      tone: "103.5 Hz",
      description: "UHF repeater with IRLP connection (Node 1540), linked to Island VHF",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "UHF",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 442.1,
      name: "Lang Bay Digital Voice",
      tone: "DMR",
      description: "DMR repeater covering southern Powell River region, TimeslotTS 1: Local, TS 2: Worldwide",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "UHF",
      isMonitored: false
    });
    
    // Calling Frequencies
    await this.createFrequency({
      frequency: EMERGENCY_FREQUENCY,
      name: "National Simplex Calling",
      tone: "No Tone",
      description: "VHF National calling frequency - monitored during emergencies",
      isEmergency: true,
      isActive: true,
      status: "active",
      category: "VHF Simplex",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 446.0,
      name: "UHF Calling Frequency",
      tone: "No Tone",
      description: "UHF National Simplex Calling Frequency",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "UHF Simplex",
      isMonitored: false
    });
    
    // HF Frequencies
    await this.createFrequency({
      frequency: 3.755,
      name: "75m BC Net",
      tone: "No Tone",
      description: "BC Provincial Traffic Net - good nighttime coverage throughout BC",
      isEmergency: false,
      isActive: true,
      status: "active", 
      category: "HF",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 7.060,
      name: "40m BC Emergency",
      tone: "No Tone",
      description: "BC Emergency Communications frequency - reliable day/night propagation",
      isEmergency: true,
      isActive: true,
      status: "active",
      category: "HF",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 14.113,
      name: "20m DX FT8",
      tone: "No Tone",
      description: "Popular FT8 digital mode frequency - excellent for worldwide contacts",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "HF Digital",
      isMonitored: false
    });
    
    // Marine Frequencies
    await this.createFrequency({
      frequency: 156.8,
      name: "Marine Channel 16",
      tone: "No Tone",
      description: "International Distress, Safety and Calling Channel",
      isEmergency: true,
      isActive: true,
      status: "active",
      category: "Marine",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: 156.45,
      name: "Marine Channel 9",
      tone: "No Tone",
      description: "Boater Calling Channel - Alternative to Channel 16",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "Marine",
      isMonitored: false
    });
    
    // Weather Frequencies
    await this.createFrequency({
      frequency: 162.4,
      name: "NOAA Weather 1",
      tone: "No Tone",
      description: "Weather Radio Continuous Broadcast for Strait of Georgia",
      isEmergency: false,
      isActive: true,
      status: "active",
      category: "Weather",
      isMonitored: false
    });
    
    // Add repeaters
    await this.createRepeater({
      name: "Powell River Amateur Radio Club",
      frequency: 146.84,
      offset: -0.6,
      tone: "103.5 Hz",
      status: "operational",
      location: "Myrtle Rock Lookout, Powell River",
      latitude: 49.8268,
      longitude: -124.5248,
      coverage: "Powell River, Texada Island, portions of Vancouver Island",
      notes: "Main repeater for the Powell River area. 24/7 emergency power backup. Weekly net Thursday 7:00 PM."
    });
    
    await this.createRepeater({
      name: "Texada Island Repeater",
      frequency: 147.2,
      offset: 0.6,
      tone: "123.0 Hz",
      status: "operational",
      location: "Mt. Pocahontas, Texada Island",
      latitude: 49.6952,
      longitude: -124.4039,
      coverage: "Texada Island, Powell River, Comox, Campbell River",
      notes: "Excellent coverage of northern Strait of Georgia. Solar powered with battery backup."
    });
    
    await this.createRepeater({
      name: "Powell River UHF",
      frequency: 443.125,
      offset: 5.0,
      tone: "103.5 Hz",
      status: "operational",
      location: "Powell River Hospital",
      latitude: 49.8352,
      longitude: -124.5247,
      coverage: "Powell River city area",
      notes: "Primarily for local communications. Good in-building penetration."
    });
    
    await this.createRepeater({
      name: "Savary Island VHF",
      frequency: 145.47,
      offset: -0.6,
      tone: "100.0 Hz",
      status: "operational",
      location: "North Savary Island",
      latitude: 49.9486,
      longitude: -124.8243,
      coverage: "Savary Island, Lund, Hernando Island, Cortes Island",
      notes: "Solar powered system. Excellent for marine mobile stations in northern area."
    });
    
    await this.createRepeater({
      name: "Lund Harbour VHF",
      frequency: 145.15,
      offset: -0.6,
      tone: "103.5 Hz",
      status: "operational",
      location: "Finn Bay, Lund, BC",
      latitude: 50.0022,
      longitude: -124.7637,
      coverage: "Desolation Sound, Okeover Inlet, northern Sunshine Coast",
      notes: "Important for boater communications in Desolation Sound. Linked to Courtenay system during emergencies."
    });
    
    await this.createRepeater({
      name: "Texada Island UHF/IRLP",
      frequency: 444.925,
      offset: 5.0,
      tone: "103.5 Hz",
      status: "operational",
      location: "Mt. Pocahontas, Texada Island",
      latitude: 49.6952,
      longitude: -124.4039,
      coverage: "Texada Island, Powell River, parts of Vancouver Island",
      notes: "Features IRLP Node 1540 for worldwide linking. Can connect to reflectors and other IRLP nodes."
    });
    
    await this.createRepeater({
      name: "Lang Bay DMR",
      frequency: 442.1,
      offset: 5.0,
      tone: "DMR",
      status: "operational",
      location: "Lang Bay, BC",
      latitude: 49.7463,
      longitude: -124.4039,
      coverage: "Southern Powell River region, northern Texada Island",
      notes: "Digital Mode Repeater. Timeslot 1: Local/Regional, Timeslot 2: Worldwide. Color Code 1."
    });
    
    await this.createRepeater({
      name: "Powell River APRS Digipeater",
      frequency: 144.39,
      offset: 0,
      tone: "No Tone",
      status: "operational",
      location: "Powell River",
      latitude: 49.8352,
      longitude: -124.5247,
      coverage: "Powell River, Texada Island, parts of Vancouver Island",
      notes: "APRS digipeater and I-Gate. Connected to APRS-IS network. Good for position reporting and messaging."
    });
    
    await this.createRepeater({
      name: "Malaspina D-STAR",
      frequency: 145.13,
      offset: -0.6,
      tone: "D-STAR",
      status: "operational",
      location: "Malaspina Substation",
      latitude: 49.7742, 
      longitude: -124.3652,
      coverage: "Powell River to Saltery Bay, Texada Island",
      notes: "D-STAR digital voice and data system. Gateway connected. Supports callsign routing worldwide."
    });
    
    await this.createRepeater({
      name: "Powell River Winlink RMS",
      frequency: 145.05,
      offset: 0,
      tone: "No Tone",
      status: "operational",
      location: "Powell River",
      latitude: 49.8352,
      longitude: -124.5247,
      coverage: "Powell River area",
      notes: "Winlink email system node for email over radio. Operates packet at 1200 baud. Useful for emergency communications when internet is down."
    });
    
    // Add reference items
    await this.createReferenceItem({
      category: "Emergency Protocols",
      title: "Power Outage Procedure",
      description: "1. Switch to battery backup\n2. Tune to 146.840 MHz (PRARC repeater)\n3. Check in with net control if active\n4. Reduce transmit power to conserve battery\n5. Report outages and critical situations\n6. Maintain communication every 30 minutes",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Emergency Protocols",
      title: "Earthquake Response",
      description: "1. Ensure personal safety first\n2. Switch to battery power\n3. Tune to 146.520 MHz simplex\n4. Attempt contact with local operators\n5. Report to emergency net when established\n6. Relay emergency traffic only\n7. Document all communications",
      sortOrder: 2
    });
    
    await this.createReferenceItem({
      category: "Q Codes",
      title: "Common Q Codes",
      description: "QRM - Interference\nQRN - Static noise\nQRP - Low power operation\nQRT - Stop transmitting\nQRZ - Who is calling?\nQSB - Fading signal\nQSL - Confirmation\nQSO - Communication\nQSY - Change frequency\nQTH - Location",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Phonetic Alphabet",
      title: "NATO Phonetic Alphabet",
      description: "A - Alpha\nB - Bravo\nC - Charlie\nD - Delta\nE - Echo\nF - Foxtrot\nG - Golf\nH - Hotel\nI - India\nJ - Juliet\nK - Kilo\nL - Lima\nM - Mike\nN - November\nO - Oscar\nP - Papa\nQ - Quebec\nR - Romeo\nS - Sierra\nT - Tango\nU - Uniform\nV - Victor\nW - Whiskey\nX - X-ray\nY - Yankee\nZ - Zulu",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Powell River Amateur Radio Club",
      title: "Club Information",
      description: "Meeting Location: Powell River Recreation Complex\nMeeting Time: First Tuesday of each month at 7:00 PM\nClub Callsign: VE7PRN\nWebsite: https://powellriverarc.ca\nMailing Address: P.O. Box 85, Powell River, BC V8A 4Z5",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Powell River Amateur Radio Club",
      title: "Club Nets",
      description: "Weekly Net: Thursday 7:00 PM on 146.840 MHz\nEmergency Net: First Sunday of each month at 1:00 PM on 146.840 MHz",
      sortOrder: 2
    });
    
    // Learning Materials for Beginners
    await this.createReferenceItem({
      category: "Learning - Beginner",
      title: "Getting Started with Ham Radio",
      description: "1. Learn the basics: radio theory, regulations, and operation\n2. Study for your license exam (Basic or Advanced)\n3. Find a local club for mentorship\n4. Choose your first radio (handheld recommended)\n5. Learn repeater etiquette\n6. Make your first contact!\n\nRecommended Resources:\n- Radio Amateurs of Canada (RAC) website\n- YouTube channels: Ham Radio Crash Course, Dave Casler",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Learning - Beginner",
      title: "Canadian Amateur Radio License Guide",
      description: "License Types:\n\n1. Basic Qualification:\n- Minimum entry level license\n- Required for all operators\n- Grants VHF/UHF privileges\n- 70% pass mark required\n\n2. Basic with Honours:\n- Score 80%+ on Basic exam\n- Additional HF privileges\n\n3. Advanced Qualification:\n- All amateur privileges\n- Required for building/modifying transmitters\n- Required for sponsoring a club station\n\nExam Preparation:\n- Industry Canada Question Bank\n- ExHAMiner app\n- RAC study guides\n- Online practice tests",
      sortOrder: 2
    });
    
    await this.createReferenceItem({
      category: "Learning - Beginner",
      title: "First Radio Recommendations",
      description: "Handheld (Portable) Options:\n- Yaesu FT-65R: Durable, user-friendly, ~$150\n- Baofeng UV-5R: Budget option, ~$40\n- Anytone 878UV Plus: DMR capable, ~$250\n\nBase/Mobile Options:\n- Yaesu FT-891: Compact HF, ~$800\n- Icom IC-7300: All-mode, touchscreen, ~$1300\n- Kenwood TS-590SG: Reliable HF/50MHz, ~$1500\n\nTips:\n- Start with a dual-band handheld (2m/70cm)\n- Join a club before major purchases\n- Consider buying used for savings",
      sortOrder: 3
    });
    
    // Technical Reference
    await this.createReferenceItem({
      category: "Technical Reference",
      title: "Antenna Basics",
      description: "Common Antenna Types:\n\n1. Dipole: Simple wire antenna, 1/2 wavelength\n2. J-Pole: Omnidirectional, easy DIY project\n3. Yagi: Directional, high gain\n4. Quarter-wave ground plane: Good for VHF/UHF\n5. End-fed half-wave: Versatile HF antenna\n\nKey Concepts:\n- SWR (Standing Wave Ratio): Under 2:1 is acceptable\n- Gain: Measured in dBi or dBd\n- Polarization: Vertical or horizontal\n- Feedline: Use quality coax with appropriate impedance",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Technical Reference",
      title: "Digital Modes Guide",
      description: "Popular Digital Modes:\n\n1. FT8/FT4:\n- Weak signal HF communication\n- WSJT-X software required\n- Automated exchanges\n\n2. APRS:\n- Position reporting and messaging\n- Uses 144.390 MHz in North America\n\n3. DMR (Digital Mobile Radio):\n- Digital voice using time slots\n- Requires compatible radio\n- Organized by Talk Groups\n\n4. D-STAR:\n- Digital voice and data\n- Callsign routing\n- ICOM proprietary system\n\n5. Packet Radio:\n- Data communication over radio\n- Used for email, messaging",
      sortOrder: 2
    });
    
    await this.createReferenceItem({
      category: "Technical Reference",
      title: "Frequency Band Plans",
      description: "HF Bands (3-30 MHz):\n- 80m (3.5-4.0 MHz): Night regional, NVIS\n- 40m (7.0-7.3 MHz): Reliable day/night\n- 20m (14.0-14.35 MHz): Primary DX band\n- 15m (21.0-21.45 MHz): Daytime DX\n- 10m (28.0-29.7 MHz): Long distance during solar max\n\nVHF Bands:\n- 6m (50-54 MHz): 'Magic band' - sporadic E propagation\n- 2m (144-148 MHz): Most popular, local repeaters\n\nUHF Bands:\n- 70cm (430-450 MHz): Local communication, urban use\n- 33cm (902-928 MHz): Regional use\n\nTypical Band Activities:\n- CW (lower portion of bands)\n- Digital modes (clustered in specific segments)\n- Phone/voice (mid to upper portions)",
      sortOrder: 3
    });
    
    // Emergency Communications
    await this.createReferenceItem({
      category: "Emergency Protocols",
      title: "ARES Overview",
      description: "Amateur Radio Emergency Service (ARES):\n\n- Volunteer network of licensed amateurs\n- Provides emergency communications\n- Works with government and relief agencies\n- Regular training exercises\n\nHow to Participate:\n1. Become licensed amateur radio operator\n2. Contact local ARES Emergency Coordinator\n3. Complete basic emergency comms training\n4. Participate in exercises (like Simulated Emergency Test)\n5. Learn ICS (Incident Command System) basics\n\nPreparedness:\n- Portable station capability\n- Power redundancy (batteries, generators)\n- Operation without internet/infrastructure",
      sortOrder: 3
    });
    
    await this.createReferenceItem({
      category: "Emergency Protocols",
      title: "Emergency Frequencies",
      description: "Local Emergency Frequencies:\n- 146.840 MHz: Powell River primary emergency repeater\n- 147.200 MHz: Texada Island backup repeater\n\nCalling Frequencies:\n- 146.520 MHz: VHF National Simplex Calling\n- 446.000 MHz: UHF National Simplex Calling\n\nProvincial Emergency Frequencies:\n- 3.730 MHz: BC/Yukon Emergency Traffic\n- 7.060 MHz: BC/Yukon Emergency Traffic (alternate)\n\nMaritime Mobile Service:\n- Channel 16 (156.800 MHz): Marine distress and calling\n\nWeather Information:\n- 162.400-162.550 MHz: Environment Canada Weather",
      sortOrder: 4
    });
    
    // Testing & Certification
    await this.createReferenceItem({
      category: "Testing & Certification",
      title: "Canadian License Exam Preparation",
      description: "Study Resources:\n\n1. Official Study Guides:\n- Basic Qualification Guide (RAC)\n- Advanced Qualification Guide (RAC)\n\n2. Online Resources:\n- Industry Canada Question Bank\n- https://www.ic.gc.ca/eic/site/025.nsf/eng/home\n- https://www.rac.ca/\n- Practice tests: https://www.hamexam.ca/\n\n3. Mobile Apps:\n- ExHAMiner (Android/iOS)\n\nFinding an Exam Session:\n- Contact local clubs (Powell River Amateur Radio Club)\n- Radio Amateurs of Canada (RAC) accredited examiners\n- Check https://www.rac.ca/examiners/ for examiner lookup",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Testing & Certification",
      title: "License Upgrade Path",
      description: "Advancing Your Canadian License:\n\n1. Basic to Basic with Honours:\n- No additional exam if you scored 80%+ initially\n- Access to all amateur bands\n- Initial power limit: 250 watts\n\n2. Basic to Advanced:\n- Pass Advanced qualification exam\n- Study advanced electrical & antenna theory\n- More complex regulations and station operation\n\nAdvanced Qualification Benefits:\n- Build/modify transmitting equipment\n- Maximum power output (1000 watts)\n- Sponsor club stations\n- Remote control fixed stations\n\nMorse Code (optional):\n- No longer required for any license\n- Still valuable for CW operation",
      sortOrder: 2
    });
    
    // Fun Activities & Contests
    await this.createReferenceItem({
      category: "Fun Activities",
      title: "Popular Ham Radio Activities",
      description: "1. DXing:\n- Contacting distant stations worldwide\n- Collecting QSL cards or LOTW confirmations\n- Earning DXCC (100+ countries) award\n\n2. Contesting:\n- Weekend competitions for maximum contacts\n- Field Day, CQ Worldwide, RAC contests\n\n3. Parks on the Air (POTA):\n- Operate from parks and nature reserves\n- Both activator and hunter roles\n\n4. Islands on the Air (IOTA):\n- Contact or activate island stations\n- Great for BC coastal operators\n\n5. Special Event Stations:\n- Operating during commemorative events\n- Often issue special QSL cards",
      sortOrder: 1
    });
    
    await this.createReferenceItem({
      category: "Fun Activities",
      title: "Satellite Communications",
      description: "Amateur Radio Satellites:\n\n1. Getting Started:\n- Only requires basic handheld with external antenna\n- No special license needed\n- Track passes with apps like SatSat or website amsat.org\n\n2. Popular Satellites:\n- ISS (International Space Station)\n- SO-50 (Easy FM repeater satellite)\n- AO-91, AO-92 (FM repeaters)\n- FO-29 (SSB/CW linear transponder)\n\n3. Equipment:\n- Dual-band handheld radio\n- Directional antenna (Arrow, Elk)\n- Optional: headphones, recorder\n\n4. Making Contacts:\n- Brief exchanges due to short passes (5-15 min)\n- Standard format: call sign, grid square, signal report",
      sortOrder: 2
    });
    
    await this.createReferenceItem({
      category: "Fun Activities",
      title: "ARISS School Contacts",
      description: "Amateur Radio on the International Space Station:\n\n1. Educational Opportunity:\n- Students talk directly with ISS astronauts\n- 10-minute contact during ISS pass\n- Questions prepared in advance\n\n2. How to Participate:\n- School/educational organization applies\n- Application windows announced by ARISS\n- Technical team required for setup\n- Apply at ariss.org\n\n3. Equipment Needed:\n- 2m band capability for voice contacts\n- Tracking antennas with elevation control\n- Backup power and audio systems\n\n4. Local Expertise:\n- Powell River ARC can provide assistance\n- Contact club for volunteer technical support",
      sortOrder: 3
    });
    
    // Add initial weather data
    await this.updateWeatherCache({
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
    
    // Sample log entries - realistic ham radio contacts
    await this.createLogEntry({
      dateTime: new Date("2023-05-15T10:25:00"),
      frequency: 146.84,
      callSign: "VE7ABC",
      operatorName: "John Smith",
      location: "Texada Island",
      signalReport: "59",
      notes: "Clear conversation about upcoming field day event. Good signal strength throughout. Discussed equipment setup suggestions for new operators.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-05-12T15:40:00"),
      frequency: 147.2,
      callSign: "VA7XYZ",
      operatorName: "Jane Doe",
      location: "Savary Island",
      signalReport: "57",
      notes: "Discussed marine conditions and ferry schedules. Some static interference. They're using a marine mobile setup with a Shakespeare antenna.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-05-20T08:15:00"),
      frequency: 7.16,
      callSign: "KL7FH",
      operatorName: "Mike Johnson",
      location: "Anchorage, Alaska",
      signalReport: "55",
      notes: "Amazing DX contact on 40m band. Discussed aurora conditions. Using Kenwood TS-590 with G5RV antenna. QSL via Logbook of the World.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-05-22T21:05:00"),
      frequency: 14.113,
      callSign: "DL3AWI",
      operatorName: "Klaus",
      location: "Berlin, Germany",
      signalReport: "53",
      notes: "FT8 digital mode contact on 20m band. -12dB signal level received. Grid square JO62. Confirmed contact electronically via WSJT-X.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-05-25T16:30:00"),
      frequency: 146.52,
      callSign: "VE7KFM",
      operatorName: "Susan Williams",
      location: "Lang Bay, BC",
      signalReport: "59",
      notes: "Simplex contact while hiking. They were using a handheld at Mount Washington. Discussed backcountry communications techniques and battery saving tips.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-05-28T19:45:00"),
      frequency: 444.925,
      callSign: "VE7JKL",
      operatorName: "Robert Chen",
      location: "Courtenay, BC",
      signalReport: "58",
      notes: "Contact via IRLP node 1540. Robert was connected through node 2190 in Courtenay. Discussed upcoming Texada Island hamfest event.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-06-01T13:20:00"),
      frequency: 145.13,
      callSign: "VA7DMR",
      operatorName: "Dave Wilson",
      location: "Sechelt, BC",
      signalReport: "57",
      notes: "D-STAR digital contact. Using ID-51A handheld. Voice quality excellent. Discussed D-STAR gateway connections and reflector usage.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-06-03T10:10:00"),
      frequency: 3.755,
      callSign: "VE7HT",
      operatorName: "Harold Thompson",
      location: "Victoria, BC",
      signalReport: "56",
      notes: "BC Provincial Traffic Net. Passed formal radiogram message regarding emergency exercise. Net control operator was VE7RYL.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-06-05T14:50:00"),
      frequency: 145.47,
      callSign: "VA7MM/MM",
      operatorName: "Mark Miller",
      location: "Desolation Sound",
      signalReport: "54",
      notes: "Marine mobile station on sailboat. Provided weather update for Desolation Sound area. Some QSB (fading) due to boat movement.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-06-10T09:30:00"),
      frequency: 28.4,
      callSign: "JA1HBC",
      operatorName: "Hiro",
      location: "Tokyo, Japan",
      signalReport: "51",
      notes: "Rare 10m band opening! Very excited to make this contact during solar cycle peak. Long QSO about antenna designs. Using 4-element yagi.",
    });
  }
}

export const storage = new DatabaseStorage();