# RAG-Powered News Chatbot Backend

A robust Node.js/Express backend service that powers a RAG (Retrieval-Augmented Generation) chatbot for news articles. This service manages chat sessions, handles real-time streaming responses, and integrates with a Python FastAPI backend for AI-powered responses.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Node.js       │    │   Python        │
│   (Next.js)     │◄──►│   Backend       │◄──►│   Backend       │
│                 │    │   (Express)     │    │   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   + Redis       │
                       └─────────────────┘
```

## 🚀 Key Features

### Core Functionality

- **Session Management**: Create, retrieve, and manage chat sessions
- **Real-time Chat**: Streaming chat responses with Server-Sent Events (SSE)
- **Message History**: Persistent chat history with PostgreSQL
- **Caching Layer**: Redis-based caching for performance optimization
- **Citation System**: Rich citation support with article metadata

### Technical Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Prisma ORM**: Type-safe database operations
- **Input Validation**: Zod-based request validation
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Helmet, CORS, and rate limiting
- **Health Monitoring**: Service health checks and monitoring

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express application setup
│   ├── controllers/           # Request handlers
│   │   ├── chat.controller.ts
│   │   ├── session.controller.ts
│   │   └── chat-history.controller.ts
│   ├── services/              # Business logic
│   │   ├── chat.service.ts
│   │   ├── session.service.ts
│   │   ├── chat-history.service.ts
│   │   ├── python-backend.service.ts
│   │   ├── database.service.ts
│   │   └── redis.service.ts
│   ├── routes/                # API routes
│   │   ├── chat.routes.ts
│   │   ├── session.routes.ts
│   │   └── chat-history.routes.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   └── validation.middleware.ts
│   ├── validators/            # Request validation schemas
│   │   ├── chat.validator.ts
│   │   └── session.validator.ts
│   └── utils/
│       └── logger.ts          # Winston logging configuration
├── models/                    # TypeScript interfaces
│   ├── chat-message.model.ts
│   ├── session.model.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── server.ts                  # Application entry point
├── package.json
└── tsconfig.json
```

## 🔄 Data Flow

### 1. Chat Message Flow

```
User Input → Validation → Session Check → Store User Message →
Python Backend → Store AI Response → Return to Client
```

### 2. Streaming Chat Flow

```
User Input → Validation → Session Check → Store User Message →
Python Backend (Stream) → Real-time Chunks → Stream Live to Client →
Store Complete Response → Stream Complete Event to Client
```

### 3. Session Management Flow

```
Create Session → Generate UUID → Store in DB → Cache in Redis →
Return Session ID
```

### 4. Redis Cache Flow

```
Read Request → Check Redis Cache → Cache Hit? → Return Cached Data
                    ↓
                Cache Miss → Query Database → Store in Cache → Return Data
```

## 🗄️ Redis Caching Strategy

### Cache Layers

#### 1. Session Cache

- **Key Pattern**: `session:{sessionId}`
- **TTL**: 1 hour (3600 seconds)
- **Data**: Session metadata, message count, last activity
- **Warming**: Lazy loading on first access

#### 2. Chat History Cache

- **Key Pattern**: `chat_history:{sessionId}`
- **TTL**: 30 minutes (1800 seconds)
- **Data**: Recent messages (last 50 messages)
- **Warming**: Lazy loading on first access

#### 3. Message Count Cache

- **Key Pattern**: `message_count:{sessionId}`
- **TTL**: 15 minutes (900 seconds)
- **Data**: Total message count for pagination
- **Warming**: Lazy loading on first access

### TTL Strategy

| Cache Type    | TTL        | Reason                                         |
| ------------- | ---------- | ---------------------------------------------- |
| Session Cache | 1 hour     | Balance between performance and data freshness |
| Chat History  | 30 minutes | Messages changes frequently                    |
| Message Count | 15 minutes | Updated frequently, shorter TTL                |

### Cache Performance Benefits

- **Session Lookup**: ~1ms (vs ~50ms database)
- **Chat History**: ~2ms (vs ~100ms database)
- **Message Count**: ~0.5ms (vs ~30ms database)
- **Overall Response Time**: 60-80% improvement

## 🛠️ API Endpoints

### Health Check

- **GET** `/health` - Service health status

### Sessions

- **POST** `/api/sessions` - Create new session
- **GET** `/api/sessions/:sessionId` - Get session details
- **GET** `/api/sessions` - Get all sessions
- **DELETE** `/api/sessions/:sessionId` - Clear session (reset message count)

### Chat

- **POST** `/api/chat` - Send message (non-streaming)
- **POST** `/api/chat/stream` - Send message (streaming with SSE)

### Chat History

- **GET** `/api/chat-history/:sessionId` - Get chat history for session

## 📊 Database Schema

### Session Model

```typescript
interface Session {
  id: string; // UUID
  createdAt: Date; // Creation timestamp
  lastActivity: Date; // Last activity timestamp
  messageCount: number; // Total message count
  messages: ChatMessage[]; // Related messages
}
```

### ChatMessage Model

```typescript
interface ChatMessage {
  id: string; // UUID
  sessionId: string; // Foreign key to Session
  role: "user" | "assistant" | "system";
  content: string; // Message content
  timestamp: Date; // Message timestamp
  category?: string; // Message category
  citations?: any[]; // Article citations
  metadata?: any; // Additional metadata
}
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=8001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatbot_db"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Python Backend
PYTHON_BACKEND_URL=http://localhost:8000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Python backend service running

### Installation

1. **Clone and Install Dependencies**

```bash
cd backend
npm install
```

2. **Database Setup**

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed
```

3. **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

4. **Start Development Server**

```bash
# Development with hot reload
npm run dev:watch

# Or standard development
npm run dev
```

5. **Production Build**

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔍 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run dev:watch        # Start with hot reload

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Production
npm run build            # Build TypeScript
npm start                # Start production server
```

## 🏗️ Service Architecture

### Core Services

#### ChatService

- Handles chat message processing
- Manages streaming responses
- Integrates with Python backend
- Stores message history

#### SessionService

- Manages chat sessions
- Handles session lifecycle
- Provides session validation
- Updates session metadata

#### ChatHistoryService

- Manages message persistence
- Handles chat history retrieval
- Provides caching layer
- Manages message relationships

#### PythonBackendService

- Communicates with Python FastAPI service
- Handles streaming responses
- Manages SSE parsing
- Provides error handling

#### DatabaseService

- Prisma client management
- Database connection handling
- Health checks
- Connection pooling

#### RedisService

- Redis client management
- Caching operations
- Session caching
- Chat history caching

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting (100 requests/15 minutes)
- **Input Validation**: Zod-based request validation
- **Error Handling**: Secure error responses

## 📈 Performance Features

- **Redis Caching**: Session and chat history caching
- **Connection Pooling**: Database connection optimization
- **Streaming**: Real-time response streaming
- **Health Monitoring**: Service health checks
- **Logging**: Comprehensive request/error logging

## 🐛 Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: 400 Bad Request with detailed validation messages
- **Not Found Errors**: 404 Not Found for missing resources
- **Server Errors**: 500 Internal Server Error with logging
- **Service Errors**: 503 Service Unavailable for external service failures
