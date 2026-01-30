# Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 3000)                    │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │  ChatPage   │  │  NavBarOnTop │  │  LoadingBackdrop│  │  │
│  │  │  Component  │  │  Component   │  │  Component      │  │  │
│  │  └──────┬──────┘  └──────────────┘  └─────────────────┘  │  │
│  │         │                                                  │  │
│  │         │ sendChatMessage()                                │  │
│  │         ▼                                                  │  │
│  │  ┌─────────────┐                                          │  │
│  │  │  chatApi.js │                                          │  │
│  │  └──────┬──────┘                                          │  │
│  └─────────┼─────────────────────────────────────────────────┘  │
└────────────┼────────────────────────────────────────────────────┘
             │
             │ HTTP POST /api/chat
             │ { "message": "..." }
             │
┌────────────▼────────────────────────────────────────────────────┐
│              Node.js Backend (Port 3001)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Express.js App                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware Stack                                    │  │  │
│  │  │  • Helmet (Security Headers)                         │  │  │
│  │  │  • Morgan (Logging)                                  │  │  │
│  │  │  • CORS (Cross-Origin)                               │  │  │
│  │  │  • express.json() (Body Parser)                      │  │  │
│  │  └────────────────────┬────────────────────────────────┘  │  │
│  │                       │                                    │  │
│  │                       ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  POST /api/chat Controller                           │  │  │
│  │  │  • Validate input                                    │  │  │
│  │  │  • Call OpenRouter service                           │  │  │
│  │  │  • Return aggregated responses                       │  │  │
│  │  └────────────────────┬────────────────────────────────┘  │  │
│  └───────────────────────┼─────────────────────────────────────┘
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ queryMultipleModels()
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                  OpenRouter Service                               │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  Promise.allSettled([                                     │   │
│  │    querySingleModel(claude),    ─────┐                    │   │
│  │    querySingleModel(gpt4),      ─────┼────────┐           │   │
│  │    querySingleModel(llama)      ─────┼────────┼───┐       │   │
│  │  ])                                   │        │   │       │   │
│  └───────────────────────────────────────┼────────┼───┼───────┘   │
└────────────────────────────────────────┼────────┼───┼───────────┘
                                         │        │   │
                    ┌────────────────────┘        │   │
                    │        ┌────────────────────┘   │
                    │        │        ┌───────────────┘
                    │        │        │
       ┌────────────▼────────▼────────▼──────────────────────┐
       │          OpenRouter API (https://openrouter.ai)      │
       │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
       │  │   Claude     │  │    GPT-4     │  │   Llama   │ │
       │  │ 3.5 Sonnet   │  │    Turbo     │  │  3.1 8B   │ │
       │  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
       └─────────┼──────────────────┼────────────────┼───────┘
                 │                  │                │
                 └──────────────────┴────────────────┘
                            │
                    Response Aggregation
                            │
                            ▼
       ┌────────────────────────────────────────────────────┐
       │  JSON Response with 3 model responses              │
       │  {                                                 │
       │    "success": true,                                │
       │    "responses": [                                  │
       │      { "modelLabel": "Claude", "response": "..." },│
       │      { "modelLabel": "GPT-4", "response": "..." }, │
       │      { "modelLabel": "Llama", "response": "..." }  │
       │    ]                                               │
       │  }                                                 │
       └────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Components

#### 1. ChatPage Component
**Location**: `frontend/src/pages/ChatPage/ChatPage.js`

**Responsibilities**:
- Manage chat state (messages, loading, errors)
- Handle user input
- Display messages and responses
- Call backend API

**State**:
```javascript
{
  messages: [],        // Array of user and AI messages
  inputMessage: "",    // Current input text
  isLoading: false,    // Loading state
  error: null          // Error message if any
}
```

**Key Functions**:
- `handleSendMessage()` - Send message to backend
- `scrollToBottom()` - Auto-scroll to latest message

#### 2. NavBarOnTop Component
**Location**: `frontend/src/components/base/NavBarOnTop/NavBarOnTop.js`

**Responsibilities**:
- Display application title
- Navigation links
- Branding

#### 3. chatApi Module
**Location**: `frontend/src/api/chatApi.js`

**Responsibilities**:
- Abstract API calls
- Handle HTTP communication
- Error handling

**Functions**:
- `sendChatMessage(message)` - POST to /api/chat

### Backend Components

#### 1. Express App
**Location**: `backend/src/userapp/framework/app.ts`

**Responsibilities**:
- Initialize Express application
- Configure middleware
- Setup routes
- Error handling

**Middleware Stack**:
1. Helmet - Security headers
2. Morgan - Request logging
3. CORS - Cross-origin requests
4. express.json() - JSON body parsing

#### 2. Chat Controller
**Location**: `backend/src/userapp/routes/controllers/api/chat.ts`

**Responsibilities**:
- Handle POST /api/chat endpoint
- Validate request body
- Call OpenRouter service
- Format response

**Validation Rules**:
- Message is required
- Message must be non-empty string
- Message max length: 4000 characters

#### 3. OpenRouter Service
**Location**: `backend/src/services/openrouter.ts`

**Responsibilities**:
- Manage OpenRouter API integration
- Parallel API calls to multiple models
- Error handling per model
- Response time tracking

**Key Functions**:
- `queryMultipleModels(message)` - Query all models
- `querySingleModel(modelId, label, message)` - Query one model

**Configuration**:
```typescript
const MODELS = {
  creative: 'anthropic/claude-3.5-sonnet',
  accurate: 'openai/gpt-4-turbo',
  fast: 'meta-llama/llama-3.1-8b-instruct'
};
```

## Data Flow

### Request Flow

```
1. User types message in ChatPage
   ↓
2. User presses Enter or clicks Send
   ↓
3. ChatPage.handleSendMessage() called
   ↓
4. Add user message to local state
   ↓
5. Call chatApi.sendChatMessage(message)
   ↓
6. Axios POST to http://localhost:3001/api/chat
   ↓
7. Backend receives request
   ↓
8. Chat controller validates input
   ↓
9. Controller calls openrouter.queryMultipleModels()
   ↓
10. Service creates 3 parallel API calls
   ↓
11. Promise.allSettled waits for all responses
   ↓
12. Service aggregates responses
   ↓
13. Controller formats and returns JSON
   ↓
14. Frontend receives response
   ↓
15. ChatPage adds AI responses to state
   ↓
16. React re-renders with new messages
   ↓
17. User sees responses in grid layout
```

### Error Flow

```
Error occurs at any step
   ↓
Backend catches error
   ↓
Returns appropriate HTTP status code
   • 400 - Bad Request (validation error)
   • 500 - Internal Server Error
   ↓
Frontend catches error in try-catch
   ↓
Sets error state
   ↓
Displays error Alert to user
   ↓
User can dismiss and retry
```

## State Management

### Frontend State (React Hooks)

```javascript
// ChatPage component state
const [messages, setMessages] = useState([]);
const [inputMessage, setInputMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
```

**Message Structure**:
```javascript
// User message
{
  type: 'user',
  content: 'Hello',
  timestamp: '2026-01-30T12:34:56.789Z'
}

// AI response
{
  type: 'ai',
  responses: [
    {
      modelName: 'anthropic/claude-3.5-sonnet',
      modelLabel: 'Creative Model (Claude)',
      response: 'Hello! How can I help?',
      responseTime: 1234
    },
    // ... 2 more responses
  ],
  timestamp: '2026-01-30T12:34:58.789Z'
}
```

### Backend State

**Stateless Design**: No state persistence
- Each request is independent
- No session management
- No database
- No conversation history

## Security Architecture

### Frontend Security
- Environment variables for API URL
- HTTPS in production (recommended)
- Input sanitization before display

### Backend Security

```
Request
   ↓
Helmet Middleware
   • X-DNS-Prefetch-Control
   • X-Frame-Options
   • Strict-Transport-Security
   • X-Content-Type-Options
   • Referrer-Policy
   ↓
CORS Middleware
   • Origin validation
   • Credentials handling
   ↓
Input Validation
   • Type checking
   • Length limits
   • Content sanitization
   ↓
API Key Protection
   • Environment variables
   • Never exposed to frontend
   ↓
Timeout Protection
   • 30 second request timeout
   • Prevents hanging requests
   ↓
Error Handling
   • Generic error messages
   • Detailed logging
   • No sensitive data in responses
```

## Scalability Considerations

### Current Architecture (Single User)
```
Frontend (1 instance) → Backend (1 instance) → OpenRouter API
```

### Horizontal Scaling (Multiple Users)
```
                    ┌→ Backend Instance 1 ┐
Frontend (CDN) ────┼→ Backend Instance 2 ├→ OpenRouter API
                    └→ Backend Instance 3 ┘
                           ↑
                    Load Balancer
```

**Scaling Strategy**:
1. Deploy frontend to CDN (Vercel, Netlify)
2. Deploy backend to container service (Docker)
3. Add load balancer (nginx, AWS ALB)
4. Scale backend horizontally
5. Add rate limiting per IP
6. Implement caching for common queries

### Performance Optimization

**Current**:
- Parallel API calls (3 simultaneous)
- 30 second timeout
- No caching

**Optimizations**:
1. **Response Caching**:
   ```
   Cache Layer (Redis)
      ↓
   Check cache before API call
      ↓
   Return cached response if exists
   ```

2. **Request Queuing**:
   ```
   Multiple requests → Queue → Process sequentially
   ```

3. **Streaming Responses**:
   ```
   API call → Stream chunks → Display incrementally
   ```

## Deployment Architecture

### Development
```
localhost:3000 (Frontend) → localhost:3001 (Backend) → OpenRouter
```

### Production
```
CDN (Frontend)
   ↓ HTTPS
Load Balancer
   ↓
Backend Instances (HTTPS)
   ↓
OpenRouter API (HTTPS)
```

**Infrastructure**:
- Frontend: Vercel/Netlify (Static hosting + CDN)
- Backend: Heroku/Railway/AWS (Container hosting)
- Monitoring: Winston logs → CloudWatch/Datadog
- Secrets: Environment variables in hosting platform

## Error Handling Strategy

### Three-Layer Error Handling

```
1. Frontend Layer
   • User input validation
   • Network error handling
   • Display user-friendly messages

2. Backend Layer
   • Request validation
   • Business logic errors
   • API integration errors
   • Structured error responses

3. Service Layer
   • OpenRouter API errors
   • Timeout handling
   • Partial failure handling
   • Detailed error logging
```

### Error Types

| Error Type | HTTP Code | Handled By | User Message |
|------------|-----------|------------|--------------|
| Empty message | 400 | Backend | "Message is required" |
| Message too long | 400 | Backend | "Message is too long" |
| Invalid API key | 500 | Backend | "Configuration error" |
| Model timeout | 200* | Service | "Model X timed out" |
| Network error | - | Frontend | "Connection failed" |

*Note: Model timeouts return 200 with error in response object

## Monitoring and Logging

### Backend Logging
```
Winston Logger
   ↓
Console (Development)
   ↓
File/Service (Production)
```

**Log Levels**:
- `info`: Request received, model responded
- `error`: API errors, validation failures
- `debug`: Detailed request/response data

### Frontend Logging
```
console.log (Development)
   ↓
Error tracking service (Production)
   • Sentry
   • LogRocket
   • Datadog RUM
```

## API Integration Details

### OpenRouter API

**Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

**Request Format**:
```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ]
}
```

**Headers**:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
HTTP-Referer: <APP_URL>
X-Title: Multi-AI Chat
```

**Response Format**:
```json
{
  "choices": [
    {
      "message": {
        "content": "Hello! How can I help?"
      }
    }
  ]
}
```

## Testing Strategy

### Manual Testing
- Unit tests for individual functions
- Integration tests for API endpoints
- E2E tests for user flows

### Test Scenarios
1. Send valid message → Verify 3 responses
2. Send empty message → Verify error
3. Send long message → Verify error
4. Invalid API key → Verify error handling
5. Network failure → Verify error display
6. Partial model failure → Verify other models succeed

## Conclusion

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable design
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Performance optimization opportunities
- ✅ Easy maintenance and updates
