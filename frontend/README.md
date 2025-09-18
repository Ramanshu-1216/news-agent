# 🚀 News Chatbot Frontend

A modern, responsive frontend for the RAG-powered news chatbot built with Next.js 15, TanStack Query, and SCSS.

## 🏗️ **Architecture Overview**

### **Tech Stack**

- **Framework**: Next.js 15 with App Router
- **State Management**: TanStack Query (React Query)
- **Styling**: SCSS with CSS Variables
- **TypeScript**: Full type safety
- **Session Management**: localStorage with React Context

### **Folder Structure**

```
src/
├── components/           # Reusable UI components
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components
│   └── session/         # Session-related components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── api.ts          # API client
│   ├── query-client.ts # TanStack Query setup
│   └── query-keys.ts   # Query key constants
└── styles/              # SCSS stylesheets
    ├── globals.scss    # Global styles
    └── components.scss # Component styles
```

## 🎯 **Key Features Implemented**

### **✅ Session Management**

- **Session Creation**: One-click session creation
- **localStorage Persistence**: Sessions survive page reloads
- **Session Guard**: Protects internal pages without valid session
- **Session Context**: Global session state management

### **✅ TanStack Query Integration**

- **Query Keys**: Centralized query key management
- **API Client**: Type-safe API calls
- **Caching**: Intelligent caching with TTL
- **DevTools**: Development debugging tools

### **✅ Modern UI/UX**

- **Clean Design**: Professional, formal appearance
- **Responsive**: Mobile-first responsive design
- **SCSS Styling**: Modular, maintainable styles
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### **✅ Type Safety**

- **Full TypeScript**: End-to-end type safety
- **API Types**: Strongly typed API responses
- **Component Props**: Typed component interfaces
- **Context Types**: Type-safe context usage

## 🔧 **Development Setup**

### **Prerequisites**

- Node.js 18+
- pnpm (recommended) or npm

### **Installation**

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### **Environment Variables**

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 🎨 **Styling System**

### **CSS Variables**

- **Colors**: Primary, secondary, success, error, warning
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl)
- **Typography**: Font families and sizes
- **Shadows**: Elevation system
- **Transitions**: Smooth animations

### **Component Classes**

- **Buttons**: `.btn`, `.btn--primary`, `.btn--secondary`
- **Cards**: `.card`, `.card__header`, `.card__body`
- **Inputs**: `.input`, `.input--error`
- **Alerts**: `.alert`, `.alert--success`, `.alert--error`
- **Utilities**: `.flex`, `.container`, `.spinner`

## 🔄 **Session Flow**

### **1. Initial Load**

```
User visits app → SessionGuard checks localStorage → No session → Show CreateSessionForm
```

### **2. Session Creation**

```
User clicks "Start New Chat" → API call to create session → Store in localStorage → Redirect to Dashboard
```

### **3. Protected Routes**

```
User with session → SessionGuard validates → Show protected content
```

### **4. Session Persistence**

```
Page reload → SessionGuard reads localStorage → Restore session → Continue where left off
```

## 📊 **TanStack Query Setup**

### **Query Client Configuration**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### **Query Keys Structure**

```typescript
export const queryKeys = {
  sessions: {
    all: ["sessions"],
    detail: (sessionId: string) => ["sessions", sessionId],
    list: () => ["sessions", "list"],
  },
  chatHistory: {
    all: ["chatHistory"],
    detail: (sessionId: string) => ["chatHistory", sessionId],
  },
  health: ["health"],
};
```

## 🎯 **Current Implementation**

### **✅ Completed Features**

1. **Project Setup**: Clean Next.js 15 with App Router
2. **TanStack Query**: Full integration with proper folder structure
3. **SCSS Styling**: Modern, responsive design system
4. **Session Management**: Complete session lifecycle
5. **Session Guard**: Route protection without valid session
6. **localStorage**: Session persistence across reloads
7. **Type Safety**: Full TypeScript implementation
8. **Error Handling**: Proper error states and loading indicators

### **🔄 Next Steps**

1. **Chat Interface**: Implement chat UI with message history
2. **Streaming Support**: Real-time message streaming
3. **Message History**: Display conversation history
4. **Session Management**: Clear session functionality
5. **Responsive Design**: Mobile optimization
6. **Error Boundaries**: Advanced error handling

## 🚀 **Getting Started**

1. **Start the backend** (Node.js Express server on port 8001)
2. **Start the frontend**:
   ```bash
   cd frontend
   pnpm dev
   ```
3. **Visit** `http://localhost:3000`
4. **Create a session** by clicking "Start New Chat"
5. **Explore** the dashboard and session management

## 🎉 **Benefits**

- **⚡ Fast**: Optimized builds with Turbopack
- **🔒 Secure**: Session-based authentication
- **📱 Responsive**: Mobile-first design
- **🎨 Modern**: Clean, professional UI
- **🛡️ Type-Safe**: Full TypeScript coverage
- **🔄 Reactive**: Real-time state management
- **📦 Modular**: Well-organized codebase
- **🚀 Scalable**: Production-ready architecture

The frontend is now ready for the next phase of development! 🎉
