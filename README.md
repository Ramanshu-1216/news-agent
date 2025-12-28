# 🚀 RAG-Powered News Chatbot

A sophisticated AI-powered news chatbot system built with modern web technologies, featuring real-time streaming, intelligent session management, and advanced RAG (Retrieval-Augmented Generation) capabilities.

## 🏗️ System Architecture

This project consists of three interconnected services that work together to provide an intelligent news chatbot experience:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │  Python AI      │
│   (Next.js)     │◄──►│   (Node.js)      │◄──►│  (FastAPI)      │
│                 │    │                  │    │                 │
│ • React 19      │    │ • Express.js     │    │ • FastAPI       │
│ • TanStack Query│    │ • PostgreSQL     │    │ • LangGraph     │
│ • Real-time UI  │    │ • Redis Cache    │    │ • Pinecone      │
│ • Session Mgmt  │    │ • Session API    │    │ • Google Gemini │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
news-agent/
├── frontend/          # Next.js React frontend
├── backend/           # Node.js Express backend
├── agentic-py/        # Python FastAPI AI service
├── render.yaml        # Deployment configuration
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend and backend)
- **Python 3.12+** (for AI service)
- **PostgreSQL** (database)
- **Redis** (caching)
- **Pinecone account** (vector database)
- **Google AI API key** (LLM)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd news-agent
```

### 2. Start the Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

**Backend runs on:** `http://localhost:8001`

### 3. Start the AI Service (Python)

```bash
cd agentic-py
poetry install
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**AI Service runs on:** `http://localhost:8000`

### 4. Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

## 🎯 Core Features

### 🤖 **Intelligent Chat System**

- **Real-time Streaming**: Live AI responses with Server-Sent Events
- **Context-Aware**: Maintains conversation history and context
- **Citation System**: Interactive source references with hover popups
- **Session Management**: Persistent chat sessions with UUID-based tracking

### 🧠 **Advanced RAG Pipeline**

- **Semantic Search**: Vector-based document retrieval from news articles
- **Query Analysis**: Intelligent routing between research, general chat, and clarification
- **Multi-Query Generation**: Comprehensive search with multiple query variations
- **Response Construction**: Context-aware answer generation with citations

### 📰 **News Processing Engine**

- **RSS Feed Processing**: Automated news article extraction and processing
- **Content Embedding**: Vector representation of articles for semantic search
- **Scheduled Updates**: Background processing with configurable cron jobs
- **Category Classification**: News categorization and filtering

### 🎨 **Modern User Interface**

- **Glass Morphism Design**: Modern translucent UI elements
- **Dark Theme**: Sophisticated color palette with high contrast
- **Responsive Layout**: Mobile-first design with adaptive components
- **Real-time Updates**: Smooth animations and live streaming responses

## 🔄 Data Flow

### 1. **User Query Processing**

```
User Input → Frontend → Backend → Python AI → LangGraph Agent →
Query Analysis → Research/General/Info Request → Vector Search →
Response Construction → Stream Back to User
```

### 2. **Session Management**

```
App Load → Check Local Storage → Session Validation → Backend API →
Database/Redis → Session Context → UI Rendering
```

### 3. **News Processing**

```
RSS Feeds → Python Service → Article Extraction → Content Processing →
Embedding Generation → Pinecone Storage → Search Ready
```

## 🛠️ Technology Stack

### **Frontend** (`/frontend`)

- **Next.js 15**: React framework with App Router and Turbopack
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **TanStack Query**: Server state management and caching
- **SCSS**: Advanced styling with CSS variables
- **Server-Sent Events**: Real-time streaming communication

### **Backend** (`/backend`)

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe development
- **PostgreSQL**: Primary database with Prisma ORM
- **Redis**: Caching and session management
- **Winston**: Structured logging
- **Zod**: Schema validation

### **AI Service** (`/agentic-py`)

- **Python 3.12+**: Programming language
- **FastAPI**: Modern, fast web framework
- **LangGraph**: Advanced agent orchestration
- **LangChain**: LLM framework for AI applications
- **Pinecone**: Vector database for semantic search
- **Google Gemini**: Large Language Model
- **News-Please**: News article extraction

## 📊 API Endpoints

### **Backend APIs** (`http://localhost:8001`)

#### Session Management

- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `DELETE /api/sessions/:id` - Clear session
- `GET /api/sessions` - List all sessions

#### Chat

- `POST /api/chat` - Send message (non-streaming)
- `POST /api/chat/stream` - Send message (streaming)
- `GET /api/chat-history/:sessionId` - Get chat history

#### Health

- `GET /health` - Service health check

### **AI Service APIs** (`http://localhost:8000`)

#### Chat

- `POST /chat/stream` - Real-time streaming chat
- `POST /chat/query` - Non-streaming chat query

#### Articles

- `POST /articles/embed` - Process and embed news articles

#### System

- `GET /health` - Service health check
- `GET /scheduler/status` - Background scheduler status

## 🚀 Deployment

### **Render.com Deployment**

The project includes a `render.yaml` configuration for easy deployment on Render.com:

```yaml
services:
  - type: web
    name: agentic-py
    env: python
    rootDir: agentic-py
    # Python AI service configuration

  - type: web
    name: backend
    env: node
    rootDir: backend
    # Node.js backend configuration
```

### **Environment Variables**

#### Backend

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PYTHON_BACKEND_URL=http://localhost:8000
NODE_ENV=production
```

#### AI Service

```bash
PINECONE_API_KEY=your_pinecone_key
JINA_API_KEY=your_jina_key
GOOGLE_API_KEY=your_google_key
```

#### Frontend

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 🔧 Development

### **Running in Development**

1. **Start all services:**

   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: AI Service
   cd agentic-py && poetry run uvicorn app.main:app --reload

   # Terminal 3: Frontend
   cd frontend && npm run dev
   ```

2. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8001`
   - AI Service: `http://localhost:8000`

### **Database Setup**

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### **Code Quality**

```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm run lint

# AI Service
cd agentic-py
poetry run black .
poetry run isort .
```

## 📚 Documentation

Each service has its own comprehensive README:

- **[Frontend README](./frontend/README.md)** - Next.js React application
- **[Backend README](./backend/README.md)** - Node.js Express API
- **[AI Service README](./agentic-py/README.md)** - Python FastAPI service

## 🎯 Use Cases

### **News Research Assistant**

- Real-time news analysis and summarization
- Citation-backed responses with source links
- Context-aware follow-up questions

### **Content Discovery**

- Semantic search across news articles
- Topic-based article recommendations
- Trend analysis and insights

### **Conversational AI**

- Natural language query processing
- Multi-turn conversations with context
- Intelligent routing based on query type

## 🔍 Monitoring & Health Checks

### **Health Endpoints**

- Backend: `GET /health`
- AI Service: `GET /health`
- Scheduler: `GET /scheduler/status`

### **Logging**

- **Backend**: Winston structured logging
- **AI Service**: Python logging with configurable levels
- **Frontend**: Browser console and error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Development Guidelines**

- Follow TypeScript best practices
- Add proper error handling
- Include input validation
- Write comprehensive tests
- Update documentation

## 📄 License

This project is part of the RAG-Powered News Chatbot system.

---

## 🚀 Getting Started Checklist

- [ ] Clone the repository
- [ ] Set up PostgreSQL database
- [ ] Set up Redis server
- [ ] Get Pinecone API key
- [ ] Get Google AI API key
- [ ] Configure environment variables
- [ ] Install dependencies for all services
- [ ] Run database migrations
- [ ] Start all three services
- [ ] Access the application at `http://localhost:3000`

---

_Built with ❤️ using Next.js, Node.js, Python, and modern AI technologies_
