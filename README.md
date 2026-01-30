# Multi-AI Chat Application

A web-based chat application that enables real-time interaction with three different AI models simultaneously through the OpenRouter API. Compare responses from Claude 3.5 Sonnet, GPT-4 Turbo, and Llama 3.1 8B side-by-side.

![Multi-AI Chat](https://img.shields.io/badge/React-17-blue) ![Node.js](https://img.shields.io/badge/Node.js-TypeScript-green) ![Material-UI](https://img.shields.io/badge/Material--UI-5-purple)

## ✨ Features

- 🤖 **Multi-Model Comparison**: Query three AI models in parallel with a single message
- ⚡ **Real-Time Responses**: See responses as they arrive with loading indicators
- 🎨 **Modern UI**: Clean, responsive Material-UI interface
- 🔒 **Privacy-Focused**: No data persistence - all conversations are ephemeral
- 📊 **Response Metrics**: View response times for each model
- 🛡️ **Error Handling**: Graceful handling of API failures with clear error messages
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd c:\Users\nhangto\Documents\multiple-ai-chat
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   copy .env.example .env
   # Edit .env and add your OPENROUTER_API_KEY
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   copy .env.example .env
   ```

4. **Start the Application**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run userapp
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

5. **Open your browser**
   
   Navigate to http://localhost:3000

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Setup Guide](SETUP.md)** - Detailed installation and configuration
- **[Project Summary](PROJECT_SUMMARY.md)** - Architecture and technical details
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

## 🏗️ Architecture

### Backend (Node.js/Express/TypeScript)
- RESTful API endpoint for chat
- Parallel API calls to OpenRouter
- CORS configuration for frontend
- Comprehensive error handling
- Request validation and timeouts

### Frontend (React/Material-UI)
- Modern chat interface
- Real-time message display
- Loading states and error handling
- Responsive grid layout for model responses
- Auto-scroll and keyboard shortcuts

## 🤖 AI Models

The application queries these three models simultaneously:

| Model | Provider | Strength | Avg Response Time |
|-------|----------|----------|-------------------|
| Claude 3.5 Sonnet | Anthropic | Creative, nuanced responses | ~2-3s |
| GPT-4 Turbo | OpenAI | Accurate, reliable responses | ~3-4s |
| Llama 3.1 8B | Meta | Fast, efficient responses | ~1-2s |

## 🔧 Configuration

### Backend Environment Variables
```env
OPENROUTER_API_KEY=your_key_here
HTTP_LISTEN_PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:3001
```

## 📡 API Endpoint

### POST /api/chat

Send a message to multiple AI models.

**Request:**
```json
{
  "message": "Your question here"
}
```

**Response:**
```json
{
  "success": true,
  "userMessage": "Your question here",
  "responses": [
    {
      "modelLabel": "Creative Model (Claude)",
      "response": "AI response...",
      "responseTime": 1234
    },
    // ... two more responses
  ],
  "timestamp": "2026-01-30T12:34:56.789Z"
}
```

## 🎯 Usage

1. Type your message in the input field
2. Press Enter or click Send
3. Watch as three AI models process your request in parallel
4. Compare responses side-by-side in the grid layout
5. Continue the conversation (each message is independent)

## 🔐 Security

- API keys stored in environment variables
- CORS configured for frontend origin only
- Input validation and sanitization
- Helmet security headers
- Request timeouts to prevent hanging

## 💰 Cost Considerations

OpenRouter charges based on token usage. Approximate costs:
- Claude 3.5 Sonnet: ~$0.003 per message
- GPT-4 Turbo: ~$0.01 per message
- Llama 3.1 8B: ~$0.0001 per message

**Total: ~$0.013 per message** (varies by response length)

## 🚧 Limitations

- No conversation history or context between messages
- Text-only input (no images or files)
- No user authentication
- No message persistence
- Designed for single-user or low-traffic scenarios

## 🔮 Future Enhancements

- [ ] Conversation history (session-based)
- [ ] Streaming responses
- [ ] Model selection dropdown
- [ ] Dark mode
- [ ] Export conversations
- [ ] Image input support
- [ ] User authentication
- [ ] Rate limiting

## 🛠️ Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- Axios
- Winston (logging)
- Helmet (security)

**Frontend:**
- React 17
- Material-UI 5
- React Router v6
- Axios

## 📦 Project Structure

```
multiple-ai-chat/
├── backend/
│   ├── src/
│   │   ├── services/openrouter.ts
│   │   ├── userapp/
│   │   │   ├── framework/app.ts
│   │   │   └── routes/controllers/api/chat.ts
│   │   └── utilities/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/chatApi.js
│   │   ├── pages/ChatPage/ChatPage.js
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

**Quick Checks:**
- ✅ Backend running on port 3001?
- ✅ Frontend running on port 3000?
- ✅ OpenRouter API key configured?
- ✅ OpenRouter account has credits?
- ✅ No errors in browser console?

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs!

## 📞 Support

- **OpenRouter API**: https://openrouter.ai/docs
- **React**: https://react.dev/
- **Material-UI**: https://mui.com/

## 🎓 Learning Resources

This project demonstrates:
- RESTful API design
- Parallel async operations in Node.js
- React hooks and state management
- Material-UI component composition
- TypeScript in Node.js
- Environment configuration
- Error handling patterns
- CORS configuration
- API integration best practices

---

**Built with ❤️ using React, Node.js, and OpenRouter API**

*Start chatting with multiple AI models today!* 🚀
