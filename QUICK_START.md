# Quick Start Guide

## 1. Get OpenRouter API Key
Visit https://openrouter.ai/keys and create an account to get your API key.

## 2. Configure Backend
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and add your API key:
```
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

## 3. Configure Frontend
```bash
cd frontend
copy .env.example .env
```

The default configuration should work. Edit only if you change backend port.

## 4. Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

## 5. Start the Application

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

## 6. Use the App
- Open http://localhost:3000
- Type a message and press Enter
- Watch as three AI models respond simultaneously!

## Model Information

The app queries these three models in parallel:

1. **Claude 3.5 Sonnet** - Anthropic's creative and nuanced model
2. **GPT-4 Turbo** - OpenAI's accurate and reliable model  
3. **Llama 3.1 8B** - Meta's fast and efficient open-source model

## Tips

- Each message is independent (no conversation history)
- Press Enter to send, Shift+Enter for new line
- Maximum message length: 4000 characters
- Response times are displayed for each model
- If a model fails, an error message will be shown for that model only

## Troubleshooting

**Backend Error: "OPENROUTER_API_KEY not configured"**
- Make sure you created `.env` file in backend folder
- Verify the API key is correctly set

**Frontend can't connect**
- Check that backend is running (should see logs in terminal)
- Verify backend is on port 3001

**API Rate Limits**
- OpenRouter has rate limits based on your account tier
- Free tier: Limited requests per minute
- Check your OpenRouter dashboard for usage

## Cost Considerations

OpenRouter charges based on tokens used. Approximate costs per message:
- Claude 3.5 Sonnet: ~$0.003 per message
- GPT-4 Turbo: ~$0.01 per message
- Llama 3.1 8B: ~$0.0001 per message

Total per message: ~$0.013 (varies by response length)

For testing, start with short messages to minimize costs!
