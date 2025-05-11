import { useState, useEffect, useCallback, useRef } from 'react';

// Message types
export type MessageType = 
  | 'CHAT_MESSAGE' 
  | 'DX_SPOT' 
  | 'USER_JOINED' 
  | 'USER_LEFT' 
  | 'USER_UPDATED'
  | 'NEW_DX_SPOT'
  | 'INIT'
  | 'PING'
  | 'PONG';

export interface ChatMessage {
  type: 'CHAT_MESSAGE';
  username: string;
  callsign: string;
  message: string;
  timestamp: string;
}

export interface DXSpotMessage {
  type: 'DX_SPOT' | 'NEW_DX_SPOT';
  spot: {
    id: string;
    callsign: string;
    frequency: number;
    mode: string;
    spotter: string;
    comment: string;
    timestamp: string;
  };
}

export interface UserStatusMessage {
  type: 'USER_JOINED' | 'USER_LEFT' | 'USER_UPDATED';
  clientId: string;
  username: string;
  callsign?: string;
}

export interface InitMessage {
  type: 'INIT';
  clients: Array<{
    username: string;
    callsign: string;
  }>;
  dxSpots: Array<{
    id: string;
    callsign: string;
    frequency: number;
    mode: string;
    spotter: string;
    comment: string;
    timestamp: string;
  }>;
}

export type WebSocketMessage = 
  | ChatMessage 
  | DXSpotMessage 
  | UserStatusMessage
  | InitMessage
  | { type: 'PING' | 'PONG'; timestamp: number };

// Custom hook to manage WebSocket connection
export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [users, setUsers] = useState<Array<{ username: string; callsign: string }>>([]);
  const [dxSpots, setDxSpots] = useState<DXSpotMessage['spot'][]>([]);
  const webSocket = useRef<WebSocket | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Set up ping interval to keep connection alive
      pingInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
        }
      }, 30000); // Every 30 seconds
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        // Handle different message types
        switch (message.type) {
          case 'INIT':
            // Initialize users and DX spots
            setUsers(message.clients);
            setDxSpots(message.dxSpots);
            break;
            
          case 'CHAT_MESSAGE':
            // Add new chat message
            setMessages(prev => [...prev, message as ChatMessage].slice(-100)); // Keep last 100 messages
            break;
            
          case 'NEW_DX_SPOT':
            // Add new DX spot
            setDxSpots(prev => {
              const spot = (message as DXSpotMessage).spot;
              return [spot, ...prev].slice(0, 100); // Keep last 100 spots
            });
            break;
            
          case 'USER_JOINED':
          case 'USER_UPDATED':
          case 'USER_LEFT':
            // Update users list on next cycle to avoid race conditions
            setTimeout(() => {
              fetch('/api/active-users')
                .then(res => res.json())
                .then(data => setUsers(data))
                .catch(err => console.error('Error fetching active users:', err));
            }, 0);
            break;
        }
        
        // Add all messages to the messages array (except PING/PONG)
        if (message.type !== 'PING' && message.type !== 'PONG') {
          setMessages(prev => [...prev, message].slice(-100)); // Keep last 100 messages
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      clearPingInterval();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
      clearPingInterval();
    };

    webSocket.current = ws;

    // Clean up on unmount
    return () => {
      clearPingInterval();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Clear ping interval helper
  const clearPingInterval = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
  };

  // Send a message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (webSocket.current?.readyState === WebSocket.OPEN) {
      webSocket.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Send a chat message
  const sendChatMessage = useCallback((message: string) => {
    return sendMessage({
      type: 'CHAT_MESSAGE',
      message
    });
  }, [sendMessage]);

  // Send a DX spot
  const sendDXSpot = useCallback((spot: {
    callsign: string;
    frequency: number;
    mode: string;
    comment: string;
  }) => {
    return sendMessage({
      type: 'DX_SPOT',
      ...spot
    });
  }, [sendMessage]);

  // Update user information
  const updateUserInfo = useCallback((info: {
    username?: string;
    callsign?: string;
  }) => {
    return sendMessage({
      type: 'SET_USER_INFO',
      ...info
    });
  }, [sendMessage]);

  return {
    connected,
    messages,
    users,
    dxSpots,
    sendChatMessage,
    sendDXSpot,
    updateUserInfo
  };
}