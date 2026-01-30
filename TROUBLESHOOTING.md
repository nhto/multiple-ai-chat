# Troubleshooting Guide

## Common Issues and Solutions

### Backend Issues

#### 1. "Cannot find module" errors

**Problem**: Missing dependencies

**Solution**:
```bash
cd backend
npm install
```

#### 2. "OPENROUTER_API_KEY not configured"

**Problem**: Missing or incorrect environment configuration

**Solution**:
1. Verify `.env` file exists in `backend/` directory
2. Check that it contains: `OPENROUTER_API_KEY=your_actual_key`
3. Restart the backend server after adding the key

#### 3. Port 3001 already in use

**Problem**: Another process is using port 3001

**Solution**:
```bash
# Option 1: Kill the process using the port (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Option 2: Change the port in backend/.env
HTTP_LISTEN_PORT=3002
```

#### 4. TypeScript compilation errors

**Problem**: TypeScript configuration or syntax issues

**Solution**:
```bash
cd backend
npm run build
# Fix any errors shown
```

#### 5. CORS errors in browser console

**Problem**: Frontend URL not whitelisted

**Solution**:
1. Check `FRONTEND_URL` in `backend/.env`
2. Should match your frontend URL (default: http://localhost:3000)
3. Restart backend after changes

### Frontend Issues

#### 1. "Cannot connect to backend"

**Problem**: Backend not running or wrong URL

**Solution**:
1. Verify backend is running (check terminal for logs)
2. Check `REACT_APP_API_URL` in `frontend/.env`
3. Default should be: `http://localhost:3001`
4. Restart frontend after changes: `npm start`

#### 2. Blank page or white screen

**Problem**: JavaScript error or missing dependencies

**Solution**:
```bash
cd frontend
npm install
npm start
# Check browser console for errors
```

#### 3. "Module not found" errors

**Problem**: Missing dependencies or incorrect imports

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 4. Changes not reflecting

**Problem**: Browser cache or build cache

**Solution**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Restart development server

### API Issues

#### 1. "Invalid API key" or 401 errors

**Problem**: OpenRouter API key is invalid or expired

**Solution**:
1. Visit https://openrouter.ai/keys
2. Verify your API key is active
3. Generate a new key if needed
4. Update `OPENROUTER_API_KEY` in `backend/.env`
5. Restart backend

#### 2. "Insufficient credits" or 402 errors

**Problem**: No credits in OpenRouter account

**Solution**:
1. Visit https://openrouter.ai/credits
2. Add credits to your account
3. Check current balance and usage

#### 3. Timeout errors (30+ seconds)

**Problem**: Model is slow or unavailable

**Solution**:
1. Try again (temporary issue)
2. Check OpenRouter status page
3. Consider switching to faster models in `backend/src/services/openrouter.ts`

#### 4. Rate limit errors (429)

**Problem**: Too many requests

**Solution**:
1. Wait a few minutes before retrying
2. Check your OpenRouter account tier limits
3. Upgrade account if needed
4. Implement request throttling

#### 5. Model not available errors

**Problem**: Specific model is down or deprecated

**Solution**:
1. Check OpenRouter model status
2. Replace with alternative model in `backend/src/services/openrouter.ts`:
```typescript
const MODELS = {
  creative: 'anthropic/claude-3-opus',  // Alternative
  accurate: 'openai/gpt-4',              // Alternative
  fast: 'meta-llama/llama-3-70b'         // Alternative
};
```

### UI/UX Issues

#### 1. Responses not displaying properly

**Problem**: CSS or layout issue

**Solution**:
1. Check browser console for errors
2. Try different browser
3. Check responsive design settings
4. Clear browser cache

#### 2. Send button not working

**Problem**: JavaScript error or validation issue

**Solution**:
1. Check browser console for errors
2. Verify message is not empty
3. Check message length (max 4000 chars)
4. Try refreshing the page

#### 3. Loading indicator stuck

**Problem**: API request failed or timed out

**Solution**:
1. Check browser console for errors
2. Check backend logs
3. Verify backend is running
4. Refresh the page

### Development Issues

#### 1. Hot reload not working

**Problem**: Development server not detecting changes

**Solution**:
```bash
# Frontend
cd frontend
npm start

# Backend (restart manually after changes)
cd backend
npm run userapp
```

#### 2. Environment variables not loading

**Problem**: .env file not being read

**Solution**:
1. Verify `.env` file is in correct directory
   - Backend: `backend/.env`
   - Frontend: `frontend/.env`
2. Restart development servers
3. Check file name is exactly `.env` (not `.env.txt`)

#### 3. Build fails

**Problem**: TypeScript or build configuration issue

**Solution**:
```bash
# Backend
cd backend
npm run build
# Fix errors shown

# Frontend
cd frontend
npm run build
# Fix errors shown
```

## Debugging Tips

### Enable Verbose Logging

Backend (`backend/.env`):
```
LOGGING_LEVEL=debug
```

### Check Backend Logs

Look for these patterns:
- `Received chat request with message length: X` - Request received
- `Model X responded in Xms` - Successful response
- `Error querying model X:` - Model error

### Check Browser Console

Press F12 and look for:
- Network tab: Check API request/response
- Console tab: Check for JavaScript errors
- Application tab: Check environment variables

### Test API Directly

Use curl or Postman:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Verify OpenRouter API

Test directly:
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Performance Issues

### Slow Response Times

**Possible Causes**:
1. Model is inherently slow
2. Network latency
3. High OpenRouter load

**Solutions**:
1. Use faster models (e.g., smaller Llama variants)
2. Implement caching for common queries
3. Add loading indicators (already implemented)

### High Memory Usage

**Possible Causes**:
1. Memory leak in React components
2. Too many messages in state

**Solutions**:
1. Implement message limit (e.g., keep only last 50 messages)
2. Add clear chat button
3. Monitor with React DevTools

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review SETUP.md and QUICK_START.md
3. Check browser console for errors
4. Check backend terminal for errors
5. Verify all environment variables are set

### Information to Provide

When reporting issues, include:
- Operating system
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Error messages (full text)
- Steps to reproduce
- Screenshots if applicable
- Browser and version (for frontend issues)

### Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if backend is running
curl http://localhost:3001/api/chat

# Check environment variables (backend)
cd backend
node -e "require('dotenv').config(); console.log(process.env.OPENROUTER_API_KEY)"

# View backend logs in real-time
cd backend
npm run userapp | tee backend.log

# Clear all caches and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## Still Having Issues?

1. **OpenRouter Documentation**: https://openrouter.ai/docs
2. **React Documentation**: https://react.dev/
3. **Material-UI Documentation**: https://mui.com/
4. **Express.js Documentation**: https://expressjs.com/

## Quick Diagnostic Checklist

- [ ] Node.js installed and version 14+
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend `.env` file exists with valid `OPENROUTER_API_KEY`
- [ ] Frontend `.env` file exists (or using defaults)
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] No errors in backend terminal
- [ ] No errors in browser console
- [ ] OpenRouter account has credits
- [ ] Internet connection is stable
- [ ] Firewall not blocking connections
- [ ] CORS configured correctly

If all items are checked and issue persists, review the specific error message in the relevant section above.
