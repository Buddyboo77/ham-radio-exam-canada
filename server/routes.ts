import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFrequencySchema, insertLogEntrySchema, insertRepeaterSchema, insertExamQuestionSchema } from "@shared/schema";
import axios from "axios";
import { WebSocketServer, WebSocket } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // Get frequency by value
  app.get('/api/frequencies/byValue/:value', async (req, res) => {
    try {
      const value = parseFloat(req.params.value);
      if (isNaN(value)) {
        return res.status(400).json({ error: 'Invalid frequency value' });
      }

      // Look for a frequency within 0.001 MHz of the requested value
      const frequencies = await storage.getAllFrequencies();
      const frequency = frequencies.find(f => 
        Math.abs(f.frequency - value) < 0.001
      );

      if (!frequency) {
        return res.status(404).json({ error: 'Frequency not found' });
      }

      res.json(frequency);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching frequency' });
    }
  });


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

  // Exam Questions endpoints
  app.get("/api/exam-questions", async (req, res) => {
    try {
      const { category, examType, difficulty, count } = req.query;
      
      if (count) {
        // Get random questions
        const questions = await storage.getRandomExamQuestions(
          parseInt(count as string),
          category as string,
          examType as string
        );
        return res.json(questions);
      }
      
      let questions;
      if (category) {
        questions = await storage.getExamQuestionsByCategory(category as string);
      } else if (examType) {
        questions = await storage.getExamQuestionsByType(examType as string);
      } else if (difficulty) {
        questions = await storage.getExamQuestionsByDifficulty(difficulty as string);
      } else {
        questions = await storage.getAllExamQuestions();
      }
      
      res.json(questions);
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      res.status(500).json({ message: "Failed to fetch exam questions" });
    }
  });

  app.post("/api/exam-questions", async (req, res) => {
    try {
      const result = insertExamQuestionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid exam question data", 
          errors: result.error.issues 
        });
      }

      const question = await storage.createExamQuestion(result.data);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating exam question:", error);
      res.status(500).json({ message: "Failed to create exam question" });
    }
  });

  app.post("/api/exam-questions/bulk", async (req, res) => {
    try {
      const { questions } = req.body;
      
      if (!Array.isArray(questions)) {
        return res.status(400).json({ message: "Questions must be an array" });
      }

      // Validate each question
      const validatedQuestions = [];
      for (const question of questions) {
        const result = insertExamQuestionSchema.safeParse(question);
        if (!result.success) {
          return res.status(400).json({ 
            message: "Invalid question data", 
            errors: result.error.issues 
          });
        }
        validatedQuestions.push(result.data);
      }

      const createdQuestions = await storage.createExamQuestions(validatedQuestions);
      res.status(201).json({ 
        message: `Successfully created ${createdQuestions.length} questions`,
        questions: createdQuestions 
      });
    } catch (error) {
      console.error("Error creating exam questions in bulk:", error);
      res.status(500).json({ message: "Failed to create exam questions" });
    }
  });

  app.get("/api/exam-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      // We'll need to add a getExamQuestionById method to storage
      const questions = await storage.getAllExamQuestions();
      const question = questions.find(q => q.id === id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json(question);
    } catch (error) {
      console.error("Error fetching exam question:", error);
      res.status(500).json({ message: "Failed to fetch exam question" });
    }
  });

  app.put("/api/exam-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const result = insertExamQuestionSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid exam question data", 
          errors: result.error.issues 
        });
      }

      const question = await storage.updateExamQuestion(id, result.data);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json(question);
    } catch (error) {
      console.error("Error updating exam question:", error);
      res.status(500).json({ message: "Failed to update exam question" });
    }
  });

  app.delete("/api/exam-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const success = await storage.deleteExamQuestion(id);
      if (!success) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error("Error deleting exam question:", error);
      res.status(500).json({ message: "Failed to delete exam question" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Active client connections
  const clients = new Map<string, { ws: WebSocket, callsign: string, username: string }>();
  const dxSpots = new Map<string, any>(); // Store recent DX spots
  
  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, { ws, callsign: '', username: `Guest-${clientId.substring(0, 5)}` });
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send initial state
    ws.send(JSON.stringify({
      type: 'INIT',
      clients: Array.from(clients.values())
        .filter(client => client.ws.readyState === WebSocket.OPEN)
        .map(client => ({ 
          callsign: client.callsign, 
          username: client.username 
        })),
      dxSpots: Array.from(dxSpots.values())
    }));
    
    // Broadcast to all clients that a new user joined
    broadcastMessage({
      type: 'USER_JOINED',
      clientId,
      username: clients.get(clientId)?.username
    });
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'CHAT_MESSAGE':
            // Broadcast chat message to all clients
            broadcastMessage({
              type: 'CHAT_MESSAGE',
              username: clients.get(clientId)?.username || 'Unknown',
              callsign: clients.get(clientId)?.callsign || '',
              message: data.message,
              timestamp: new Date().toISOString()
            });
            break;
            
          case 'DX_SPOT':
            // Add new DX spot and broadcast to all clients
            const spotId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const newSpot = {
              id: spotId,
              callsign: data.callsign,
              frequency: data.frequency,
              mode: data.mode,
              spotter: clients.get(clientId)?.callsign || data.spotter || 'Anonymous',
              comment: data.comment,
              timestamp: new Date().toISOString()
            };
            
            dxSpots.set(spotId, newSpot);
            
            // Keep only the last 100 spots
            if (dxSpots.size > 100) {
              const oldest = Array.from(dxSpots.keys())[0];
              dxSpots.delete(oldest);
            }
            
            broadcastMessage({
              type: 'NEW_DX_SPOT',
              spot: newSpot
            });
            break;
            
          case 'SET_USER_INFO':
            // Update user info
            if (clients.has(clientId)) {
              const client = clients.get(clientId)!;
              client.callsign = data.callsign || client.callsign;
              client.username = data.username || client.username;
              clients.set(clientId, client);
              
              // Notify all clients of the updated user
              broadcastMessage({
                type: 'USER_UPDATED',
                clientId,
                username: client.username,
                callsign: client.callsign
              });
            }
            break;
            
          case 'PING':
            // Respond with a pong to keep connection alive
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      // Notify all clients that a user left
      broadcastMessage({
        type: 'USER_LEFT',
        clientId,
        username: clients.get(clientId)?.username
      });
      
      // Remove client from active clients
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
  });
  
  // Function to broadcast message to all connected clients
  function broadcastMessage(message: any) {
    const messageString = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageString);
      }
    });
  }
  
  // Start periodic websocket maintenance
  setInterval(() => {
    clients.forEach((client, id) => {
      if (client.ws.readyState !== WebSocket.OPEN) {
        clients.delete(id);
      }
    });
  }, 30000); // Every 30 seconds
  
  return httpServer;
}
