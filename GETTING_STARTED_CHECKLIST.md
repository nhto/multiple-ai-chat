# Getting Started Checklist

Use this checklist to ensure your Multi-AI Chat application is properly set up and running.

## Pre-Installation

- [ ] Node.js v14+ installed
  ```bash
  node --version
  ```
- [ ] npm installed
  ```bash
  npm --version
  ```
- [ ] OpenRouter account created at https://openrouter.ai
- [ ] OpenRouter API key obtained from https://openrouter.ai/keys
- [ ] OpenRouter account has credits (check at https://openrouter.ai/credits)

## Backend Setup

- [ ] Navigate to backend directory
  ```bash
  cd backend
  ```
- [ ] Install dependencies
  ```bash
  npm install
  ```
- [ ] Create `.env` file from template
  ```bash
  copy .env.example .env
  ```
- [ ] Edit `.env` file and add your OpenRouter API key
  ```
  OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
  ```
- [ ] Verify other environment variables in `.env`:
  - [ ] `HTTP_LISTEN_PORT=3001`
  - [ ] `FRONTEND_URL=http://localhost:3000`
  - [ ] `NODE_ENV=development`
  - [ ] `LOGGING_LEVEL=info`
- [ ] Build TypeScript (optional, but recommended to check for errors)
  ```bash
  npm run build
  ```
- [ ] Start backend server
  ```bash
  npm run userapp
  ```
- [ ] Verify backend is running
  - [ ] Terminal shows "Server listening on port 3001" or similar
  - [ ] No error messages in terminal

## Frontend Setup

- [ ] Open a new terminal window
- [ ] Navigate to frontend directory
  ```bash
  cd frontend
  ```
- [ ] Install dependencies
  ```bash
  npm install
  ```
- [ ] Create `.env` file from template (optional, defaults work)
  ```bash
  copy .env.example .env
  ```
- [ ] Verify `.env` file (if created):
  - [ ] `REACT_APP_API_URL=http://localhost:3001`
- [ ] Start frontend development server
  ```bash
  npm start
  ```
- [ ] Verify frontend is running
  - [ ] Browser opens automatically to http://localhost:3000
  - [ ] Or manually open http://localhost:3000
  - [ ] Chat interface loads without errors

## Initial Testing

- [ ] Chat interface is visible
- [ ] Navigation bar shows "Multi-AI Chat"
- [ ] Input field is present at the bottom
- [ ] No errors in browser console (press F12 → Console tab)
- [ ] Send a test message:
  - [ ] Type "Hello" in the input field
  - [ ] Press Enter or click Send button
  - [ ] Loading indicator appears
  - [ ] Three response cards appear after a few seconds
  - [ ] Each card shows:
    - [ ] Model label (Claude, GPT-4, Llama)
    - [ ] Response text
    - [ ] Response time
  - [ ] No error messages displayed

## Troubleshooting Checks

If something isn't working, verify:

### Backend Issues
- [ ] Backend terminal shows no errors
- [ ] Port 3001 is not used by another application
- [ ] `.env` file exists in backend directory
- [ ] `OPENROUTER_API_KEY` is set correctly in `.env`
- [ ] OpenRouter API key is valid (check at https://openrouter.ai/keys)
- [ ] OpenRouter account has available credits

### Frontend Issues
- [ ] Frontend terminal shows no errors
- [ ] Port 3000 is not used by another application
- [ ] Browser console (F12) shows no errors
- [ ] Backend is running and accessible

### API Issues
- [ ] Test backend directly with curl:
  ```bash
  curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d "{\"message\":\"Hello\"}"
  ```
- [ ] Should return JSON with three responses
- [ ] If error, check backend terminal for details

## Advanced Configuration (Optional)

- [ ] Change AI models (edit `backend/src/services/openrouter.ts`)
- [ ] Adjust timeout (edit `backend/src/services/openrouter.ts`)
- [ ] Customize UI colors (edit `frontend/src/pages/ChatPage/ChatPage.js`)
- [ ] Change ports (edit `.env` files)

## Production Deployment (Optional)

### Backend
- [ ] Choose hosting platform (Heroku, Railway, Render, AWS)
- [ ] Set environment variables on hosting platform
- [ ] Deploy backend code
- [ ] Update `FRONTEND_URL` to production frontend URL
- [ ] Test production backend endpoint

### Frontend
- [ ] Choose hosting platform (Vercel, Netlify, AWS S3)
- [ ] Update `REACT_APP_API_URL` to production backend URL
- [ ] Build production bundle: `npm run build`
- [ ] Deploy build directory
- [ ] Test production frontend

## Documentation Review

- [ ] Read [README.md](README.md) for overview
- [ ] Review [QUICK_START.md](QUICK_START.md) for quick reference
- [ ] Check [SETUP.md](SETUP.md) for detailed setup
- [ ] Bookmark [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for issues
- [ ] Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- [ ] Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for technical details

## Usage Tips

- [ ] Each message is independent (no conversation history)
- [ ] Press Enter to send, Shift+Enter for new line
- [ ] Maximum message length is 4000 characters
- [ ] Response times vary by model (1-4 seconds typically)
- [ ] If one model fails, others will still respond
- [ ] Refresh page to clear chat history

## Cost Management

- [ ] Monitor OpenRouter usage at https://openrouter.ai/activity
- [ ] Set up budget alerts in OpenRouter dashboard
- [ ] Estimated cost: ~$0.013 per message
- [ ] Consider using cheaper models for testing
- [ ] Implement rate limiting if deploying publicly

## Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] Never commit API keys to version control
- [ ] Use HTTPS in production
- [ ] Configure CORS properly for production
- [ ] Keep dependencies updated
- [ ] Monitor for security vulnerabilities

## Next Steps

After successful setup:

1. **Experiment with different messages**
   - Try creative writing prompts
   - Ask technical questions
   - Test with different languages
   - Compare model responses

2. **Customize the application**
   - Change AI models
   - Adjust UI styling
   - Add new features
   - Modify response display

3. **Learn from the code**
   - Review backend service architecture
   - Study React component structure
   - Understand API integration patterns
   - Explore error handling strategies

4. **Share feedback**
   - What works well?
   - What could be improved?
   - What features would you like?

## Success Criteria

You've successfully set up the application when:

✅ Backend runs without errors on port 3001
✅ Frontend runs without errors on port 3000
✅ Chat interface loads in browser
✅ Test message returns three AI responses
✅ No errors in browser console
✅ No errors in backend terminal
✅ Response times are reasonable (1-5 seconds)
✅ UI is responsive and functional

## Need Help?

If you're stuck:

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review error messages carefully
3. Check both backend and frontend terminals
4. Verify all environment variables
5. Test with curl to isolate issues
6. Review OpenRouter documentation

## Congratulations! 🎉

If all items are checked, you're ready to start chatting with multiple AI models!

**Pro Tip**: Start with simple messages to verify everything works, then try more complex queries to see how different models respond.

---

**Happy Chatting!** 🤖💬
