import { 
  users, frequencies, repeaters, logEntries, referenceItems, weatherCache,
  type User, type InsertUser, 
  type Frequency, type InsertFrequency,
  type Repeater, type InsertRepeater,
  type LogEntry, type InsertLogEntry,
  type ReferenceItem, type InsertReferenceItem,
  type WeatherCache, type InsertWeatherCache
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";
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

  // Initialize the database with sample data if it's empty
  async initializeData() {
    // Check if we have any data already
    const freqCount = await db.select({ count: frequencies.id }).from(frequencies);
    if (freqCount.length && freqCount[0].count) {
      return; // Database already has data
    }

    // Add frequencies
    await this.createFrequency({
      frequency: 146.84,
      name: "Powell River Amateur Radio Club",
      tone: "103.5 Hz",
      description: "Main repeater for Powell River",
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
      description: "Repeater on Texada Island",
      isEmergency: false,
      isActive: false,
      status: "inactive",
      category: "VHF",
      isMonitored: false
    });
    
    await this.createFrequency({
      frequency: EMERGENCY_FREQUENCY,
      name: "National Simplex Calling",
      tone: "No Tone",
      description: "National calling frequency",
      isEmergency: true,
      isActive: false,
      status: "inactive",
      category: "VHF",
      isMonitored: false
    });
    
    await this.createFrequency({
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
      notes: "Main repeater for the Powell River area"
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
      notes: "Good coverage of northern Strait of Georgia"
    });
    
    await this.createRepeater({
      name: "Powell River UHF",
      frequency: 443.125,
      offset: 5.0,
      tone: "103.5 Hz",
      status: "intermittent",
      location: "Powell River",
      latitude: 49.8352,
      longitude: -124.5247,
      coverage: "Powell River city area",
      notes: "Limited range, primarily for local communications"
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
    
    // Sample log entry
    await this.createLogEntry({
      dateTime: new Date("2023-05-15T10:25:00"),
      frequency: 146.84,
      callSign: "VE7ABC",
      operatorName: "John Smith",
      location: "Texada Island",
      signalReport: "59",
      notes: "Clear conversation about upcoming field day event. Good signal strength throughout.",
    });
    
    await this.createLogEntry({
      dateTime: new Date("2023-05-12T15:40:00"),
      frequency: 147.2,
      callSign: "VA7XYZ",
      operatorName: "Jane Doe",
      location: "Savary Island",
      signalReport: "57",
      notes: "Discussed marine conditions and ferry schedules. Some static interference.",
    });
  }
}

export const storage = new DatabaseStorage();