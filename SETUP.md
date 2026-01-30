# Multi-AI Chat Application - Setup Guide

This application allows users to chat with three different AI models simultaneously via the OpenRouter API, comparing responses side-by-side.

## Features

- **Multi-Model Querying**: Send one message and get responses from three AI models in parallel:
  - Claude 3.5 Sonnet (Creative responses)
  - GPT-4 Turbo (Accurate responses)
  - Llama 3.1 8B (Fast responses)
- **Real-time Chat Interface**: Clean, intuitive Material-UI based chat interface
- **No Data Persistence**: Stateless, ephemeral conversations with no storage
- **Response Comparison**: View responses side-by-side in a grid layout
- **Error Handling**: Graceful handling of API failures with clear error messages

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key (get one at https://openrouter.ai/keys)

## Installation

### 1. Clone the Repository

```bash
cd c:\Users\nhangto\Documents\multiple-ai-chat
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env and add your OpenRouter API key
# OPENROUTER_API_KEY=your_actual_api_key_here
```

Edit `backend/.env` and configure:
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `HTTP_LISTEN_PORT`: Backend port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env if needed (default backend URL is http://localhost:3001)
```

Edit `frontend/.env` if you need to change the backend URL:
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3001)

## Running the Application

### Start Backend Server

```bash
cd backend
npm run userapp
```

The backend will start on port 3001 (or your configured port).

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will start on http://localhost:3000 and automatically open in your browser.

## Usage

1. Open http://localhost:3000 in your browser
2. Type a message in the input field at the bottom
3. Press Enter or click "Send"
4. Wait for responses from all three AI models
5. View responses side-by-side in the grid layout
6. Continue the conversation (note: each message is independent, no conversation history is maintained)

## Architecture

### Backend (Node.js/Express/TypeScript)

- **Framework**: Express.js with TypeScript
- **API Route**: `POST /api/chat`
- **Service**: `openrouter.ts` - Handles parallel API calls to OpenRouter
- **Features**:
  - CORS enabled for frontend communication
  - Input validation (max 4000 characters)
  - Parallel API calls using Promise.allSettled
  - Error handling for individual model failures
  - Response time tracking

### Frontend (React)

- **Framework**: React 17 with Material-UI 5
- **Main Component**: `ChatPage.js`
- **Features**:
  - Real-time chat interface
  - Loading indicators during API calls
  - Error display with dismissible alerts
  - Responsive grid layout for model responses
  - Auto-scroll to latest messages
  - Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## API Endpoints

### POST /api/chat

Send a message to multiple AI models.

**Request Body:**
```json
{
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true,
  "userMessage": "Your message here",
  "responses": [
    {
      "modelName": "anthropic/claude-3.5-sonnet",
      "modelLabel": "Creative Model (Claude)",
      "response": "AI response text...",
      "responseTime": 1234
    },
    {
      "modelName": "openai/gpt-4-turbo",
      "modelLabel": "Accurate Model (GPT-4)",
      "response": "AI response text...",
      "responseTime": 2345
    },
    {
      "modelName": "meta-llama/llama-3.1-8b-instruct",
      "modelLabel": "Fast Model (Llama)",
      "response": "AI response text...",
      "responseTime": 567
    }
  ],
  "timestamp": "2026-01-30T12:34:56.789Z"
}
```

**Error Response:**
```json
{
  "error": "Message is required and must be a non-empty string"
}
```

## Customization

### Changing AI Models

Edit `backend/src/services/openrouter.ts` and modify the `MODELS` object:

```typescript
const MODELS = {
  creative: 'your-model-id-1',
  accurate: 'your-model-id-2',
  fast: 'your-model-id-3'
};
```

Available models can be found at: https://openrouter.ai/models

### Adjusting Timeouts

In `backend/src/services/openrouter.ts`, modify the timeout value:

```typescript
timeout: 30000 // milliseconds
```

### Styling

The chat interface uses Material-UI components. Customize colors and styles in `frontend/src/pages/ChatPage/ChatPage.js`.

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify `.env` file exists and has valid configuration
- Check Node.js version (should be v14+)

### Frontend can't connect to backend
- Verify backend is running on the correct port
- Check `REACT_APP_API_URL` in `frontend/.env`
- Check browser console for CORS errors

### API errors
- Verify your OpenRouter API key is valid
- Check if you have credits in your OpenRouter account
- Review backend logs for detailed error messages

### Models not responding
- Some models may be temporarily unavailable
- Check OpenRouter status page
- Try different models if one consistently fails

## Security Notes

- Never commit `.env` files to version control
- Keep your OpenRouter API key secure
- The application includes basic rate limiting via OpenRouter
- CORS is configured to only allow requests from the frontend URL

## Limitations

- No conversation history or context between messages
- No user authentication
- No message persistence
- Text-only input (no images or files)
- Designed for single-user or low-traffic scenarios

## Future Enhancements

Possible improvements:
- Add conversation history (with user opt-in)
- Support for image inputs
- Model selection by user
- Export conversation feature
- Streaming responses
- Rate limiting on backend
- User authentication

## License

This project is for educational purposes.

## Support

For issues related to:
- OpenRouter API: https://openrouter.ai/docs
- Material-UI: https://mui.com/
- React: https://react.dev/
