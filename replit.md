# SignalAce Canada

## Overview

SignalAce Canada is a comprehensive Canadian amateur radio license exam preparation Progressive Web App. This FREE app with an optional $8.88 Pro upgrade (removes ads) provides essential study tools including Practice Exams, Morse Code training, and Study Guides with gamification elements like daily challenges, XP/level system, and achievement badges. The application is built to work both online and offline, making it reliable for studying anywhere.

The app targets Canadian amateur radio license exam candidates, providing educational resources for new operators preparing for their Basic or Advanced qualification exams. It combines practical exam preparation tools with learning features and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Official Question Bank Import Attempt (Nov 5, 2025)
**IMPORTANT - PDF Parsing Challenge:**
- Attempted to import the official ISED Canada question bank (984 questions) from PDF
- The PDF uses a complex multi-column table layout that doesn't parse cleanly with automated tools
- Initial import corrupted question text and answer options due to table structure
- **Database restored** with 4,031 validated template questions for testing
- Template questions are well-formatted and cover all required topics

**Next Steps for Official Question Import:**
- The official PDF (official_basic_questions.pdf) contains all 984 questions with correct answer indicators
- Recommended approach: Convert PDF to structured data (CSV/JSON) using:
  - PDF table extraction tools (e.g., Tabula, Adobe Acrobat Export)
  - Manual data entry with quality validation
  - OCR-based parsing with human review
- Once structured data is available, import script can be updated to use CSV/JSON format
- **Data integrity validation** must be added before any future imports to prevent corruption

**Current State:**
- App is fully functional with template questions
- All 984 official question IDs and correct answers were successfully identified in PDF
- Schema updated to support official questions (explanation field now nullable)
- Import infrastructure ready once structured data is available

### Critical Stability Fixes (Nov 5, 2025)
Fixed exam disappearing issues that could impact paying customers:

**ROOT CAUSE FIX - ProtectedRoute Component:**
- **CRITICAL BUG FIXED**: ProtectedRoute was creating new component functions on every parent re-render
- The App.tsx clock timer (updating every 60 seconds) triggered React to unmount/remount all protected routes
- This destroyed all exam state every 60 seconds, causing questions to disappear mid-test
- **SOLUTION**: Changed from inline `component={() => ...}` to stable children pattern
- Exams now remain stable indefinitely - no more 60-second unmount cycle

**Browser Navigation Protection:**
- Added beforeunload and popstate event handlers to block accidental navigation during active quiz
- Prevents browser back/forward buttons from destroying exam in progress
- Shows confirmation dialog if user attempts to leave page during exam

**Practice Exam Page (EnhancedLearningPage):**
- Hidden HOME and RETURN navigation buttons during active quiz to prevent accidental exits
- Added confirmation dialog to Exit button: "Are you sure you want to exit? Your progress will be lost."
- Added timer warnings for timed exams: alerts at 5 minutes, 1 minute, and when time expires
- Timer changes color (orange at 5 min, red pulsing at 1 min) for visual warning
- Buttons only appear during quiz setup and after completion, not during active testing

**Morse Code Page:**
- Added confirmation dialog to HOME button: "Are you sure you want to go home? Any in-progress training or exam will be lost."
- Prevents accidental navigation away during Morse code training or exams

**Exam Question Randomization:**
- Fixed critical bug where correct answer was always option A
- Implemented Fisher-Yates shuffle algorithm to randomize answer positions
- Correct answers now appear randomly at positions A, B, C, or D

These fixes ensure production-grade stability for the $8.88 Pro version - users won't lose progress accidentally.

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

### Development and Build Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### PWA and Utility Libraries
- **uuid**: Unique identifier generation
- **canvas-confetti**: Celebratory animations for gamification features
- **@types packages**: TypeScript definitions for various libraries

### Form Handling
- **@hookform/resolvers**: Form validation integration
- **React Hook Form**: Efficient form state management

### Monetization
- **Google AdSense**: Ad integration for free tier (requires user approval and publisher ID replacement)

The application currently uses comprehensive template questions for testing. Official ISED Canada question bank import is pending structured data conversion. The app supports offline functionality through service worker caching and localStorage.