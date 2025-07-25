# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- Deploy: `firebase deploy --only hosting:web-relett`

## Architecture Overview

This is a React-based property investment platform built with:

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Radix UI primitives with shadcn/ui components + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Blockchain**: Hedera Hashgraph for property tokenization
- **Authentication**: Supabase Auth with wallet integration
- **State Management**: React Query (@tanstack/react-query) + Context API

### Key Integrations
- **Maps**: Google Maps API for property locations
- **Payments**: Paystack integration
- **File Storage**: Supabase Storage + IPFS via Pinata
- **Real-time**: Supabase realtime subscriptions
- **Notifications**: OneSignal + Twilio
- **Chat**: Real-time messaging system

### Project Structure

#### `/src/components/`
- `auth/` - Authentication forms and wallet connection
- `dashboard/` - Role-based dashboard components (Admin, Agent, Landowner, User, Verifier)
- `property/` - Property management, details, and forms
- `marketplace/` - Property marketplace and search
- `tokens/` - Tokenized property management and trading
- `investment/` - Investment portfolios and group management
- `hedera/` - Blockchain integration components
- `ui/` - Reusable UI components (shadcn/ui)

#### `/src/pages/`
Main application routes with role-based access control

#### `/src/hooks/`
Custom hooks for data fetching, caching, and business logic

#### `/src/lib/`
- `config.ts` - Configuration for services (Supabase, Hedera, Maps, etc.)
- `hedera/` - Hedera blockchain services
- `services/` - Trading and token management services

#### `/src/types/`
TypeScript definitions including comprehensive database types

### Database Architecture

The application uses Supabase with comprehensive database functions for:
- User management and role-based access
- Property lifecycle management
- Investment tracking and tokenization
- Real-time notifications
- Analytics and reporting

Key tables: users, properties, investments, transactions, notifications, conversations

### Authentication Flow

Multi-modal authentication system:
1. Traditional email/password via Supabase Auth
2. Hedera wallet connection for blockchain features
3. Role-based access control (Admin, Agent, Landowner, User, Verifier)

### Real-time Features

- Property updates and price changes
- Chat messaging system
- Booking notifications
- Investment group discussions
- Poll voting system

### Blockchain Integration

Hedera Hashgraph integration for:
- Property tokenization
- Revenue distribution
- Token trading
- Smart contract management

## Development Notes

### State Management Pattern
Use React Query for server state, Context API for global client state. Most data fetching is handled through custom hooks in `/src/hooks/`.

### Component Architecture
- UI components follow shadcn/ui patterns
- Business logic components use composition with custom hooks
- Forms use react-hook-form with Zod validation

### File Organization
- Components are organized by feature/domain
- Shared utilities in `/src/lib/` and `/src/utils/`
- Types are centralized in `/src/types/`

### Environment Configuration
Configuration is centralized in `/src/lib/config.ts` with feature flags for different integrations.

### Blockchain Development
Hedera integration requires proper testnet setup. Contract deployment info is stored in `/contracts/deployment-info.json`.

### Testing Strategy
No specific test framework is currently configured. When adding tests, follow the existing project structure.