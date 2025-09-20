# Powell River Amateur Radio Companion

## Overview

The Powell River Amateur Radio Companion is a comprehensive web application designed specifically for amateur radio operators in the Powell River, BC area. This PWA (Progressive Web App) serves as a complete toolkit for ham radio operators, providing essential features like frequency monitoring, repeater information, logbook management, morse code training, and community resources. The application is built to work both online and offline, making it reliable for field use.

The app targets the local Powell River Amateur Radio Club community while providing educational resources for new operators and advanced tools for experienced hams. It combines practical radio operation tools with learning features, maps, and real-time communication capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, utilizing a modern component-based architecture. The app uses Vite as the build tool and development server, configured with React plugin support and PWA capabilities. The UI framework is based on shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling.

Key architectural decisions:
- **Component Structure**: Organized into logical feature folders (frequencies, repeaters, logbook, learning, etc.)
- **State Management**: Uses React Query (@tanstack/react-query) for server state management and local React state for UI state
- **Routing**: Implemented with Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom radio-themed styling and dark mode support
- **PWA Features**: Service worker for offline functionality, manifest for app installation

### Backend Architecture
The backend follows an Express.js REST API pattern with TypeScript. The server is structured with separation of concerns between routing, data access, and business logic.

Key architectural decisions:
- **API Design**: RESTful endpoints with consistent JSON responses
- **Data Layer**: Abstracted through a storage interface pattern for database operations
- **Error Handling**: Centralized error handling middleware for consistent API responses
- **WebSocket Support**: Real-time communication features for chat and DX cluster functionality

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is designed around amateur radio concepts with proper relationships and constraints.

Core tables:
- **frequencies**: Local frequency listings with monitoring capabilities
- **repeaters**: Repeater information with geographic coordinates
- **logEntries**: QSO logging with signal reports and technical details
- **users**: Simple authentication system
- **referenceItems**: Educational content and club information
- **weatherCache**: Cached weather data for propagation analysis

### Authentication System
Uses a simplified authentication mechanism stored in localStorage, designed for ease of use rather than high security. This approach was chosen because the app primarily handles non-sensitive amateur radio data.

### PWA Implementation
The app is designed as a Progressive Web App with:
- **Service Worker**: Caches essential resources and API responses for offline use
- **App Manifest**: Enables installation on mobile devices and desktops
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Offline Support**: Core features work without internet connectivity

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **TypeScript**: Type safety throughout the application
- **Express.js**: Node.js web framework for the backend server
- **Vite**: Build tool and development server

### Database and ORM
- **PostgreSQL**: Production database (configured for Neon serverless)
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **Drizzle ORM**: Type-safe database operations with migration support
- **drizzle-kit**: Database migration and introspection tools

### UI and Styling
- **@radix-ui**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Data Fetching and State
- **@tanstack/react-query**: Server state management with caching and synchronization
- **Axios**: HTTP client for API requests
- **WebSocket (ws)**: Real-time communication support

### Development and Build Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### PWA and Utility Libraries
- **uuid**: Unique identifier generation
- **canvas-confetti**: Celebratory animations for gamification features
- **@types packages**: TypeScript definitions for various libraries

### Maps and Geolocation
- **@types/leaflet**: TypeScript support for mapping functionality (Leaflet integration planned)

### Form Handling
- **@hookform/resolvers**: Form validation integration
- **React Hook Form**: Efficient form state management (implied by resolvers dependency)

The application is designed to work with external services for weather data, callsign lookups, and DX cluster information, though these integrations use mock data in the current implementation for demonstration purposes.