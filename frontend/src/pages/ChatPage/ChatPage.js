import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
// ... rest of imports
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { sendChatMessage } from '../../api/chatApi';

const MarkdownComponents = {
// ... MarkdownComponents content
  p: ({ children }) => (
    <Typography variant="body2" sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
      {children}
    </Typography>
  ),
  h1: ({ children }) => (
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 1.5 }}>
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ pl: 2, mb: 1.5 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Box component="li" sx={{ mb: 0.5 }}>
      <Typography variant="body2">{children}</Typography>
    </Box>
  ),
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={atomDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props} style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '4px' }}>
        {children}
      </code>
    );
  },
  hr: () => <Divider sx={{ my: 2 }} />,
  blockquote: ({ children }) => (
    <Box
      sx={{
        borderLeft: '4px solid #ccc',
        pl: 2,
        py: 0.5,
        mb: 2,
        fontStyle: 'italic',
        color: 'text.secondary',
        backgroundColor: 'rgba(0,0,0,0.02)'
      }}
    >
      {children}
    </Box>
  ),
};

const ChatPage = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Send to backend with current language
      const response = await sendChatMessage(userMessage, i18n.language);

      // Add AI responses to chat
      const aiMessage = {
        type: 'ai',
        responses: response.responses,
        timestamp: response.timestamp
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || t('errorFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('chatHeader')}
        </Typography>
      </Box>

      {/* Chat Messages Area */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          mb: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        {messages.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column'
            }}
          >
            <SmartToyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t('emptyState')}
            </Typography>
          </Box>
        )}

        {messages.map((message, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            {message.type === 'user' ? (
              // User Message
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: '#e3f2fd',
                    color: 'text.primary',
                    borderRadius: '16px 16px 2px 16px',
                    border: '1px solid',
                    borderColor: '#bbdefb'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'primary.main' }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t('userLabel')}</Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      '& p': { m: 0, color: 'inherit' },
                      '& ul, & ol': { pl: 2, m: 0 },
                      '& li': { mb: 0.5 }
                    }}
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <Typography variant="body1">{children}</Typography>,
                        li: ({ children }) => (
                          <Box component="li">
                            <Typography variant="body1">{children}</Typography>
                          </Box>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </Box>
                </Paper>
              </Box>
            ) : (
              // AI Responses
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 1 }}>
                  <SmartToyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('aiResponsesLabel')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2
                  }}
                >
                  {message.responses.map((response, idx) => (
                    <Card key={idx} elevation={2}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={response.modelLabel}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                          {response.responseTime && (
                            <Typography variant="caption" color="text.secondary">
                              {(response.responseTime / 1000).toFixed(2)}s
                            </Typography>
                          )}
                        </Box>
                        {response.error ? (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {response.error}
                          </Alert>
                        ) : (
                          <Box
                            sx={{
                              maxHeight: '400px',
                              overflow: 'auto',
                              px: 2, // Add some padding for the scrollbar
                              '&::-webkit-scrollbar': {
                                width: '6px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: '3px',
                              },
                            }}
                          >
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]} 
                              components={MarkdownComponents}
                            >
                              {response.response}
                            </ReactMarkdown>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2, alignSelf: 'center' }}>
              {t('loadingState')}
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={t('inputPlaceholder')}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            endIcon={<SendIcon />}
            sx={{ minWidth: '100px' }}
          >
            {t('sendButton')}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {t('inputCaption')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatPage;
