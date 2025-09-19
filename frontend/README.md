# 🎨 Frontend - RAG-Powered News Chatbot

A modern, responsive React frontend built with Next.js 15, featuring real-time chat streaming, intelligent session management, and an advanced citation system. This application provides a sleek, glass-morphism UI for interacting with the AI-powered news chatbot backend.

## 🏗️ Architecture Overview

### Core Technologies

- **Next.js 15**: React framework with App Router and Turbopack
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **TanStack Query**: Server state management and caching
- **SCSS**: Advanced styling with CSS variables
- **Server-Sent Events (SSE)**: Real-time streaming communication

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  React Context   │    │  TanStack Query │
│                 │    │                  │    │                 │
│ • App Router    │◄──►│ • Session State  │    │ • API Caching   │
│ • Components    │    │ • Chat State     │    │ • Background    │
│ • Pages         │    │ • Global State   │    │   Sync          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SCSS Styles   │    │  Custom Hooks    │    │  API Client     │
│                 │    │                  │    │                 │
│ • Glass Morphism│    │ • Chat Streaming │    │ • HTTP Client   │
│ • Dark Theme    │    │ • Session Mgmt   │    │ • Error Handling│
│ • Responsive    │    │ • Local Storage  │    │ • Type Safety   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Core Features

### 1. **Real-Time Chat Interface**

- **Live Streaming**: Server-Sent Events for real-time responses
- **Message History**: Persistent chat history with session management
- **Citation System**: Interactive citation bubbles with hover popups
- **Responsive Design**: Mobile-first, adaptive layout

### 2. **Session Management**

- **Session Creation**: Generate new chat sessions with UUID
- **Session Persistence**: Local storage with automatic restoration
- **Session Validation**: Verify existing session IDs
- **Session Clearing**: Reset chat history while preserving session

### 3. **Advanced UI/UX**

- **Glass Morphism**: Modern translucent design elements
- **Dark Theme**: Sophisticated color palette with high contrast
- **Smooth Animations**: CSS transitions and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation

### 4. **Citation System**

- **Interactive Bubbles**: Numbered citation references
- **Rich Popups**: Detailed article information on hover
- **Source Links**: Direct links to original articles
- **Smart Parsing**: Automatic citation extraction from responses

## 📊 Data Flows

### 1. Session Management Flow

```
App Load → Check Local Storage → Session Exists? → Load Session Data →
Session Guard → Create/Join Session → Set Session Context → Render App
```

### 2. Chat Streaming Flow

```
User Input → Validation → Send to Backend → SSE Connection →
Real-time Chunks → Update UI → Complete Response → Store in History
```

### 3. Citation Processing Flow

```
Response Text → Parse Citations → Extract Article IDs → Map to Citation Data →
Render Bubbles → Hover Popups → Click to Source
```

## 🛠️ Component Architecture

### Layout Components

#### **RootLayout** (`app/layout.tsx`)

- **Purpose**: Global app wrapper with providers
- **Features**: Font loading, global styles, metadata
- **Providers**: TanStack Query, Session, Chat contexts

#### **SessionGuard** (`src/components/layout/session-guard.tsx`)

- **Purpose**: Protect routes requiring active session
- **Logic**: Redirects to session creation if no session
- **Fallback**: Session creation form

#### **MainLayout** (`src/components/layout/main-layout.tsx`)

- **Purpose**: Main application layout with header
- **Features**: Session info, copy/clear actions, responsive header
- **State**: Session context integration

### Chat Components

#### **ChatInterface** (`src/components/chat/chat-interface.tsx`)

- **Purpose**: Message input and sending
- **Features**: Real-time streaming, loading states, validation
- **Integration**: Chat context and streaming hooks

#### **ChatMessages** (`src/components/chat/chat-messages.tsx`)

- **Purpose**: Display chat history and streaming messages
- **Features**: Message bubbles, timestamps, citations, sources
- **Styling**: User/assistant message differentiation

#### **CitationBubble** (`src/components/chat/citation-bubble.tsx`)

- **Purpose**: Interactive citation references
- **Features**: Hover popups, click-to-source, rich metadata
- **Data**: Article details, authors, publication dates

#### **MessageContent** (`src/components/chat/message-content.tsx`)

- **Purpose**: Parse and render message content with citations
- **Features**: Citation parsing, bubble rendering, text formatting

### Session Components

#### **CreateSessionForm** (`src/components/session/create-session-form.tsx`)

- **Purpose**: Session creation and joining interface
- **Features**: Tabbed interface, UUID validation, copy functionality
- **Options**: New session or join existing session

### Dashboard Components

#### **Dashboard** (`src/components/dashboard/dashboard.tsx`)

- **Purpose**: Main application dashboard
- **Features**: Conditional rendering, feature cards, chat interface
- **Logic**: Shows greeting when no messages, chat when active

### TanStack Query Integration

#### **Query Keys** (`src/lib/query-keys.ts`)

```typescript
export const queryKeys = {
  sessions: {
    all: ["sessions"] as const,
    detail: (id: string) => ["sessions", id] as const,
  },
  chatHistory: {
    all: ["chatHistory"] as const,
    detail: (sessionId: string) => ["chatHistory", sessionId] as const,
  },
  health: ["health"] as const,
};
```

#### **API Client** (`src/lib/api.ts`)

- **Error Handling**: Custom ApiError class with status codes
- **Type Safety**: Full TypeScript integration
- **Response Processing**: Consistent error handling across endpoints

## 🎨 Styling System

### SCSS Architecture

#### **Global Styles** (`src/styles/globals.scss`)

- **CSS Variables**: Comprehensive design system
- **Color Palette**: Modern blue/gray theme with dark mode support
- **Typography**: Geist font family with optimized loading
- **Spacing**: Consistent spacing scale
- **Shadows**: Layered shadow system for depth

## 🔄 Custom Hooks

### **useChatStream** (`src/hooks/use-chat-stream.ts`)

- **Purpose**: Handle real-time chat streaming
- **Features**: SSE connection, chunk processing, error handling
- **State**: Streaming status, error management

### **useSession** (`src/hooks/use-session.ts`)

- **Purpose**: Session data management
- **Features**: CRUD operations, validation, caching
- **Integration**: TanStack Query for server state

### **useLocalStorage** (`src/hooks/use-local-storage.ts`)

- **Purpose**: Persistent local storage with React state
- **Features**: Type-safe storage, SSR compatibility
- **Usage**: Session ID persistence

### **useChatHistory** (`src/hooks/use-chat-history.ts`)

- **Purpose**: Fetch and manage chat history
- **Features**: Automatic refetching, error handling
- **Integration**: Session-based data fetching

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8001

# Development
NODE_ENV=development
```

### Next.js Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.scss": {
          loaders: ["sass-loader"],
          as: "*.css",
        },
      },
    },
  },
};

export default nextConfig;
```

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": true,
    "esModuleInterop": true
  }
}
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Backend API running on port 8001

### Installation

```bash
# Clone repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Development Commands

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 🧪 Development Tools

### TanStack Query DevTools

- **Query Inspection**: Real-time query state monitoring
- **Cache Visualization**: Cache contents and invalidation
- **Performance Metrics**: Query timing and optimization

### ESLint Configuration

- **Next.js Rules**: Optimized for Next.js development
- **TypeScript Integration**: Type-aware linting
- **Code Quality**: Consistent code style enforcement

---

## 📚 Additional Resources

- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **TanStack Query**: [tanstack.com/query](https://tanstack.com/query)
- **React 19 Features**: [react.dev](https://react.dev)
- **SCSS Documentation**: [sass-lang.com](https://sass-lang.com)

---

_Built with ❤️ using Next.js, React, and modern web technologies_
