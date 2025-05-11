import { pgTable, text, serial, integer, boolean, timestamp, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Frequency table
export const frequencies = pgTable("frequencies", {
  id: serial("id").primaryKey(),
  frequency: real("frequency").notNull(),
  name: text("name").notNull(),
  tone: text("tone"),
  description: text("description"),
  isEmergency: boolean("is_emergency").default(false),
  isActive: boolean("is_active").default(false),
  status: text("status").default("inactive"), // "active", "inactive", "intermittent"
  category: text("category"), // "VHF", "UHF", "Marine", etc.
  isMonitored: boolean("is_monitored").default(false),
});

export const insertFrequencySchema = createInsertSchema(frequencies).omit({
  id: true,
});

export type InsertFrequency = z.infer<typeof insertFrequencySchema>;
export type Frequency = typeof frequencies.$inferSelect;

// Repeater table
export const repeaters = pgTable("repeaters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  frequency: real("frequency").notNull(),
  offset: real("offset").notNull(),
  tone: text("tone"),
  status: text("status").default("operational"), // "operational", "down", "intermittent"
  location: text("location"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  coverage: text("coverage"),
  notes: text("notes"),
});

export const insertRepeaterSchema = createInsertSchema(repeaters).omit({
  id: true,
});

export type InsertRepeater = z.infer<typeof insertRepeaterSchema>;
export type Repeater = typeof repeaters.$inferSelect;

// Logbook entry table
export const logEntries = pgTable("log_entries", {
  id: serial("id").primaryKey(),
  dateTime: timestamp("date_time").notNull().defaultNow(),
  frequency: real("frequency").notNull(),
  callSign: text("call_sign").notNull(),
  operatorName: text("operator_name"),
  location: text("location"),
  signalReport: text("signal_report"),
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  // Media attachments
  photoUrl: text("photo_url"),
  audioUrl: text("audio_url"),
  // QSO details
  mode: text("mode"),
  band: text("band"),
  power: real("power"),
  qslSent: boolean("qsl_sent").default(false),
  qslReceived: boolean("qsl_received").default(false),
  favorite: boolean("favorite").default(false),
});

export const insertLogEntrySchema = createInsertSchema(logEntries).omit({
  id: true,
  userId: true,
});

export type InsertLogEntry = z.infer<typeof insertLogEntrySchema>;
export type LogEntry = typeof logEntries.$inferSelect;

// Reference items table
export const referenceItems = pgTable("reference_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "Emergency Protocols", "Q Codes", "Phonetic Alphabet", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const insertReferenceItemSchema = createInsertSchema(referenceItems).omit({
  id: true,
});

export type InsertReferenceItem = z.infer<typeof insertReferenceItemSchema>;
export type ReferenceItem = typeof referenceItems.$inferSelect;

// Weather data (cached from external API)
export const weatherCache = pgTable("weather_cache", {
  id: serial("id").primaryKey(),
  location: text("location").notNull().unique(),
  temperature: real("temperature"),
  condition: text("condition"),
  windSpeed: real("wind_speed"),
  windDirection: text("wind_direction"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  rawData: text("raw_data"),
});

export const insertWeatherCacheSchema = createInsertSchema(weatherCache).omit({
  id: true,
});

export type InsertWeatherCache = z.infer<typeof insertWeatherCacheSchema>;
export type WeatherCache = typeof weatherCache.$inferSelect;
