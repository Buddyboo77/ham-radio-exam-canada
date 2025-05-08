import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFrequencySchema, insertLogEntrySchema, insertRepeaterSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database with sample data
  try {
    await storage.initializeData();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
  
  // prefix all routes with /api
  const apiRouter = app.get("/api/status", (req, res) => {
    res.json({ status: "online" });
  });

  // Frequencies endpoints
  app.get("/api/frequencies", async (req, res) => {
    try {
      const frequencies = await storage.getAllFrequencies();
      res.json(frequencies);
    } catch (error) {
      console.error("Error fetching frequencies:", error);
      res.status(500).json({ message: "Failed to fetch frequencies" });
    }
  });

  app.get("/api/frequencies/monitored", async (req, res) => {
    try {
      const monitoredFrequencies = await storage.getMonitoredFrequencies();
      res.json(monitoredFrequencies);
    } catch (error) {
      console.error("Error fetching monitored frequencies:", error);
      res.status(500).json({ message: "Failed to fetch monitored frequencies" });
    }
  });

  app.get("/api/frequencies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid frequency ID" });
      }
      
      const frequency = await storage.getFrequencyById(id);
      if (!frequency) {
        return res.status(404).json({ message: "Frequency not found" });
      }
      
      res.json(frequency);
    } catch (error) {
      console.error("Error fetching frequency:", error);
      res.status(500).json({ message: "Failed to fetch frequency" });
    }
  });

  app.patch("/api/frequencies/:id/monitor", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid frequency ID" });
      }
      
      const updateSchema = z.object({
        isMonitored: z.boolean(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedFrequency = await storage.updateFrequencyMonitored(id, validatedData.isMonitored);
      
      if (!updatedFrequency) {
        return res.status(404).json({ message: "Frequency not found" });
      }
      
      res.json(updatedFrequency);
    } catch (error) {
      console.error("Error updating frequency monitoring status:", error);
      res.status(500).json({ message: "Failed to update frequency monitoring status" });
    }
  });

  app.post("/api/frequencies", async (req, res) => {
    try {
      const validatedData = insertFrequencySchema.parse(req.body);
      const newFrequency = await storage.createFrequency(validatedData);
      res.status(201).json(newFrequency);
    } catch (error) {
      console.error("Error creating frequency:", error);
      res.status(500).json({ message: "Failed to create frequency" });
    }
  });

  // Repeaters endpoints
  app.get("/api/repeaters", async (req, res) => {
    try {
      const repeaters = await storage.getAllRepeaters();
      res.json(repeaters);
    } catch (error) {
      console.error("Error fetching repeaters:", error);
      res.status(500).json({ message: "Failed to fetch repeaters" });
    }
  });

  app.get("/api/repeaters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid repeater ID" });
      }
      
      const repeater = await storage.getRepeaterById(id);
      if (!repeater) {
        return res.status(404).json({ message: "Repeater not found" });
      }
      
      res.json(repeater);
    } catch (error) {
      console.error("Error fetching repeater:", error);
      res.status(500).json({ message: "Failed to fetch repeater" });
    }
  });

  app.post("/api/repeaters", async (req, res) => {
    try {
      const validatedData = insertRepeaterSchema.parse(req.body);
      const newRepeater = await storage.createRepeater(validatedData);
      res.status(201).json(newRepeater);
    } catch (error) {
      console.error("Error creating repeater:", error);
      res.status(500).json({ message: "Failed to create repeater" });
    }
  });

  // Log entries endpoints
  app.get("/api/logbook", async (req, res) => {
    try {
      const logEntries = await storage.getAllLogEntries();
      res.json(logEntries);
    } catch (error) {
      console.error("Error fetching log entries:", error);
      res.status(500).json({ message: "Failed to fetch log entries" });
    }
  });

  app.get("/api/logbook/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid log entry ID" });
      }
      
      const logEntry = await storage.getLogEntryById(id);
      if (!logEntry) {
        return res.status(404).json({ message: "Log entry not found" });
      }
      
      res.json(logEntry);
    } catch (error) {
      console.error("Error fetching log entry:", error);
      res.status(500).json({ message: "Failed to fetch log entry" });
    }
  });

  app.post("/api/logbook", async (req, res) => {
    try {
      const validatedData = insertLogEntrySchema.parse(req.body);
      const newLogEntry = await storage.createLogEntry(validatedData);
      res.status(201).json(newLogEntry);
    } catch (error) {
      console.error("Error creating log entry:", error);
      res.status(500).json({ message: "Failed to create log entry" });
    }
  });

  app.patch("/api/logbook/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid log entry ID" });
      }
      
      // Validate the update data
      const validatedData = insertLogEntrySchema.partial().parse(req.body);
      const updatedLogEntry = await storage.updateLogEntry(id, validatedData);
      
      if (!updatedLogEntry) {
        return res.status(404).json({ message: "Log entry not found" });
      }
      
      res.json(updatedLogEntry);
    } catch (error) {
      console.error("Error updating log entry:", error);
      res.status(500).json({ message: "Failed to update log entry" });
    }
  });

  app.delete("/api/logbook/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid log entry ID" });
      }
      
      const deleted = await storage.deleteLogEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Log entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting log entry:", error);
      res.status(500).json({ message: "Failed to delete log entry" });
    }
  });

  // Reference items endpoints
  app.get("/api/reference", async (req, res) => {
    try {
      const referenceItems = await storage.getAllReferenceItems();
      res.json(referenceItems);
    } catch (error) {
      console.error("Error fetching reference items:", error);
      res.status(500).json({ message: "Failed to fetch reference items" });
    }
  });

  app.get("/api/reference/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const referenceItems = await storage.getReferenceItemsByCategory(category);
      res.json(referenceItems);
    } catch (error) {
      console.error("Error fetching reference items by category:", error);
      res.status(500).json({ message: "Failed to fetch reference items" });
    }
  });

  app.get("/api/reference/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reference item ID" });
      }
      
      const referenceItem = await storage.getReferenceItemById(id);
      if (!referenceItem) {
        return res.status(404).json({ message: "Reference item not found" });
      }
      
      res.json(referenceItem);
    } catch (error) {
      console.error("Error fetching reference item:", error);
      res.status(500).json({ message: "Failed to fetch reference item" });
    }
  });

  // Weather endpoints
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const location = req.params.location || "Powell River, BC";
      let weatherData = await storage.getWeatherByLocation(location);
      
      // Check if weather data exists and is less than 1 hour old
      const currentTime = new Date();
      if (!weatherData || 
          (currentTime.getTime() - new Date(weatherData.lastUpdated).getTime() > 3600000)) {
        // If no data or data is old, fetch new data from a weather API
        try {
          // In a real app, we would use a real weather API like OpenWeatherMap
          // For this example, we'll use a simulated response
          
          // Simulate API call
          // const apiKey = process.env.WEATHER_API_KEY;
          // const response = await axios.get(`https://api.example.com/weather?q=${location}&appid=${apiKey}`);
          
          // Simulated response
          const simulatedWeatherData = {
            temperature: 12 + Math.floor(Math.random() * 5),
            condition: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][Math.floor(Math.random() * 4)],
            windSpeed: 5 + Math.floor(Math.random() * 10),
            windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
          };
          
          // Update cache
          weatherData = await storage.updateWeatherCache({
            location,
            temperature: simulatedWeatherData.temperature,
            condition: simulatedWeatherData.condition,
            windSpeed: simulatedWeatherData.windSpeed,
            windDirection: simulatedWeatherData.windDirection,
            lastUpdated: new Date(),
            rawData: JSON.stringify(simulatedWeatherData)
          });
        } catch (apiError) {
          console.error("Error fetching weather from API:", apiError);
          // If API call fails but we have old data, return that
          if (weatherData) {
            return res.json({
              ...weatherData,
              stale: true
            });
          }
          throw apiError; // Re-throw for the outer catch block
        }
      }
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
