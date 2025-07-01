# Clinic Management System

## Overview

This is a comprehensive clinic management system built with React on the frontend and Express.js on the backend. The application facilitates appointment booking, patient management, and multi-role access for patients, doctors, and receptionists. It uses a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components for a polished user interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom medical theme variables
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful endpoints with proper error handling
- **Session Management**: Express sessions with PostgreSQL session store
- **Data Storage**: In-memory storage implementation with interface for future database integration

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and schemas
- `migrations/` - Database migration files (Drizzle)

## Key Components

### Role-Based Views
1. **Patient View**: Appointment booking, personal information management, notification settings
2. **Doctor View**: Schedule management, appointment overview, patient statistics
3. **Receptionist View**: Comprehensive dashboard for managing all appointments, bulk operations

### Core Features
- Multi-role authentication system (Patient, Doctor, Receptionist)
- Real-time appointment booking with time slot availability
- Appointment management (create, reschedule, cancel)
- Patient information management
- Doctor schedule viewing
- Notification preferences configuration
- Responsive design for desktop and mobile

### UI Components
- Custom appointment booking form with doctor selection
- Interactive schedule calendar
- Modal dialogs for appointment actions
- Data tables with filtering and sorting
- Real-time toast notifications
- Mobile-responsive navigation

## Data Flow

### Database Schema
- **Doctors**: Basic information, specialty, contact details
- **Patients**: Personal information, contact details, medical history
- **Appointments**: Booking details, status tracking, relationships to doctors/patients
- **Notification Settings**: User preferences for email, SMS, and push notifications

### API Endpoints
- `GET/POST /api/doctors` - Doctor management
- `GET/POST /api/patients` - Patient management  
- `GET/POST/PATCH/DELETE /api/appointments` - Appointment CRUD operations
- `GET/PATCH /api/notification-settings` - Notification preferences

### State Management
- TanStack Query handles all server state with caching and synchronization
- Local component state for UI interactions
- Form state managed by React Hook Form
- Global toast notifications via custom hook

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **@hookform/resolvers**: Form validation integration

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **eslint**: Code linting
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for backend development with auto-restart
- Concurrent development setup with proxy configuration

### Production Build
- Frontend: Vite build to static assets
- Backend: esbuild bundle for Node.js deployment
- Environment variable configuration for database connections
- Static asset serving from Express server

### Database
- Drizzle migrations for schema management
- PostgreSQL as primary database (Neon serverless compatible)
- Connection pooling and error handling
- Environment-based configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 01, 2025. Initial setup