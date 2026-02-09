import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
// ... rest of imports
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ReplayIcon from '@mui/icons-material/Replay';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TurndownService from 'turndown';
import { sendChatMessageStream, buildChatHistory, retryFailedModel } from '../../api/chatApi';
import { loadChatState, saveChatState, clearChatState } from '../../utils/chatStorage';

// Singleton turndown instance for HTML → Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  strongDelimiter: '**',
  emDelimiter: '*',
});

const AVAILABLE_MODELS = [
  { id: 'x-ai/grok-4.1-fast', labelKey: 'modelGrok' },
  { id: 'moonshotai/kimi-k2.5', labelKey: 'modelKimi' },
  { id: 'qwen/qwen3-vl-8b-instruct', labelKey: 'modelQwen' }
];
const VALID_MODEL_IDS = AVAILABLE_MODELS.map((m) => m.id);

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

function messageId(msg, index) {
  return msg.id != null ? msg.id : `msg-${index}`;
}

// Throttle ms for streaming updates to avoid excessive re-renders
const STREAM_UPDATE_THROTTLE_MS = 80;

const ChatMessageRow = React.memo(function ChatMessageRow({ message, index, retryingKey, onRetry, onCopyResponse, t }) {
  const key = messageId(message, index);
  return (
    <Box key={key} sx={{ mb: { xs: 2, sm: 3 } }}>
      {message.type === 'user' ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Paper
            elevation={1}
            sx={{
              p: { xs: 1.5, sm: 2 },
              maxWidth: { xs: '95%', sm: '90%', md: '80%' },
              backgroundColor: '#e3f2fd',
              color: 'text.primary',
              borderRadius: '16px 16px 2px 16px',
              border: '1px solid',
              borderColor: '#bbdefb'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, color: 'primary.main', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t('userLabel')}</Typography>
              </Box>
              <Tooltip title={t('copyMessage')}>
                <IconButton
                  size="small"
                  onClick={() => onCopyResponse(message.content)}
                  aria-label={t('copyMessage')}
                  sx={{ p: 0.25 }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            {message.images && message.images.length > 0 && (
              <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {message.images.map((imgUrl, imgIdx) => (
                  <Box
                    key={imgIdx}
                    sx={{
                      maxWidth: 200,
                      maxHeight: 200,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Uploaded ${imgIdx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
            <Box
              sx={{
                '& p': { m: 0, color: 'inherit' },
                '& ul, & ol': { pl: 2, m: 0 },
                '& li': { mb: 0.5 }
              }}
            >
              {message.content && (
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
              )}
            </Box>
          </Paper>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 }, ml: { xs: 0.5, sm: 1 } }}>
            <SmartToyIcon sx={{ mr: 1, color: 'text.secondary', fontSize: { xs: 18, sm: 24 } }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: 'inherit' } }}>
              {t('aiResponsesLabel')}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: `repeat(${Math.min(message.responses?.length || 3, 3)}, 1fr)`
              },
              gap: { xs: 1.5, sm: 2 }
            }}
          >
            {[...(message.responses || [])]
              .sort((a, b) => {
                const orderA = AVAILABLE_MODELS.findIndex((m) => m.id === a.modelName);
                const orderB = AVAILABLE_MODELS.findIndex((m) => m.id === b.modelName);
                const ia = orderA === -1 ? 999 : orderA;
                const ib = orderB === -1 ? 999 : orderB;
                return ia - ib;
              })
              .map((response, idx) => {
                const responseIdx = message.responses.findIndex((r) => r.modelName === response.modelName);
                const retryKey = `${index}-${responseIdx}`;
                const isRetrying = retryingKey === retryKey;
                return (
                  <Card key={idx} elevation={2} sx={{ minWidth: 0 }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 }, gap: 1, minWidth: 0 }}>
                        <Chip
                          label={response.modelLabel}
                          color="primary"
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            maxWidth: '100%',
                            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' }
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {response.responseTime != null && (
                            <Typography variant="caption" color="text.secondary">
                              {(response.responseTime / 1000).toFixed(2)}s
                            </Typography>
                          )}
                          <Tooltip title={t('copyResponse')}>
                            <IconButton
                              size="small"
                              onClick={() => onCopyResponse(response.error ? response.error : response.response)}
                              aria-label={t('copyResponse')}
                              sx={{ p: 0.25 }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      {response.error ? (
                        <Box sx={{ mt: 1 }}>
                          <Alert severity="error" sx={{ mb: 1 }}>
                            {response.error}
                          </Alert>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={isRetrying ? <CircularProgress size={16} /> : <ReplayIcon />}
                            onClick={() => onRetry(index, responseIdx)}
                            disabled={isRetrying}
                          >
                            {isRetrying ? t('retryingLabel') : t('retryButton')}
                          </Button>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            maxHeight: { xs: '300px', sm: '400px' },
                            overflow: 'auto',
                            overflowX: 'auto',
                            px: { xs: 1, sm: 2 },
                            '& pre': { overflow: 'auto', maxWidth: '100%' },
                            '&::-webkit-scrollbar': { width: '6px' },
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
                );
              })}
          </Box>
        </Box>
      )}
    </Box>
  );
}, (prevProps, nextProps) => {
  return prevProps.index === nextProps.index
    && prevProps.message === nextProps.message
    && prevProps.retryingKey === nextProps.retryingKey;
});

const ChatPage = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryingKey, setRetryingKey] = useState(null);
  const [modelCount, setModelCount] = useState(3);
  const [selectedModelIds, setSelectedModelIds] = useState(AVAILABLE_MODELS.map((m) => m.id));
  const [selectedImages, setSelectedImages] = useState([]);
  const [isRestored, setIsRestored] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Load persisted state on mount
  useEffect(() => {
    let cancelled = false;
    loadChatState(VALID_MODEL_IDS).then((state) => {
      if (cancelled) return;
      setIsLoadingState(false);
      if (state && state.messages.length > 0) {
        const withIds = state.messages.map((m, i) => ({ ...m, id: m.id || `msg-${i}-${Date.now()}` }));
        setMessages(withIds);
        setModelCount(state.modelCount);
        setSelectedModelIds(state.selectedModelIds.length >= 2 ? state.selectedModelIds : VALID_MODEL_IDS.slice(0, state.modelCount));
        setIsRestored(true);
      }
    }).catch(() => {
      if (!cancelled) setIsLoadingState(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Debounced save when messages, modelCount, or selectedModelIds change
  const persistState = useCallback((msgs, mCount, mIds) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveChatState({
        messages: msgs,
        modelCount: mCount,
        selectedModelIds: mIds
      });
      saveTimeoutRef.current = null;
    }, 500);
  }, []);

  useEffect(() => {
    if (!isLoadingState) {
      if (messages.length > 0) {
        persistState(messages, modelCount, selectedModelIds);
      }
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [messages, modelCount, selectedModelIds, isLoadingState, persistState]);

  // Dismiss "restored" snackbar after a few seconds
  useEffect(() => {
    if (isRestored) {
      const timer = setTimeout(() => setIsRestored(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isRestored]);

  const handleModelCountChange = (_, newCount) => {
    if (newCount == null) return;
    setModelCount(newCount);
    setSelectedModelIds((prev) => {
      if (newCount === 2 && prev.length === 3) return prev.slice(0, 2);
      if (newCount === 3 && prev.length === 2) {
        const missing = AVAILABLE_MODELS.find((m) => !prev.includes(m.id));
        return missing ? [...prev, missing.id] : prev;
      }
      return prev;
    });
  };

  const handleModelToggle = (modelId) => {
    setSelectedModelIds((prev) => {
      const isSelected = prev.includes(modelId);
      if (isSelected) {
        if (prev.length <= 2) return prev;
        return prev.filter((id) => id !== modelId);
      }
      if (prev.length >= modelCount) {
        return [...prev.slice(1), modelId];
      }
      return [...prev, modelId];
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedImages.length === 0) return;
    if (selectedModelIds.length < 2) return;

    const userMessage = inputMessage.trim();
    const imagesToSend = [...selectedImages];
    setInputMessage('');
    setSelectedImages([]);
    setError(null);

    // Convert images to base64
    let imageDataUrls = [];
    try {
      imageDataUrls = await Promise.all(imagesToSend.map(img => convertImageToBase64(img)));
    } catch (err) {
      console.error('Error converting images:', err);
      setError(t('errorImageConversion'));
      return;
    }

    // Add user message to chat
    const ts = Date.now();
    const newUserMessage = {
      id: `user-${ts}`,
      type: 'user',
      content: userMessage,
      images: imageDataUrls,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Placeholder AI message; responses will be updated as stream chunks arrive
    const placeholderAiMessage = {
      id: `ai-${ts}`,
      type: 'ai',
      responses: [],
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, placeholderAiMessage]);
    setIsLoading(true);

    const history = buildChatHistory(messages);
    const doneCountRef = { current: 0 };
    const expectedModels = selectedModelIds.length;
    const pendingRef = { current: null };
    let throttleTimer = null;

    const applyChunkTo = (prev, payload) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.type !== 'ai' || !last.responses) return prev;
      const responses = [...last.responses];
      let idx = responses.findIndex((r) => r.modelName === payload.modelId);
      if (idx < 0) {
        responses.push({
          modelName: payload.modelId,
          modelLabel: payload.modelLabel,
          response: '',
          responseTime: undefined
        });
        idx = responses.length - 1;
      }
      const cur = responses[idx];
      if (payload.chunk) {
        responses[idx] = { ...cur, response: (cur.response || '') + payload.chunk };
      }
      if (payload.error) {
        responses[idx] = { ...cur, error: payload.error };
      }
      if (payload.done) {
        responses[idx] = { ...cur, responseTime: payload.responseTime };
      }
      next[next.length - 1] = { ...last, responses };
      return next;
    };

    const flushPending = () => {
      if (pendingRef.current == null) return;
      const next = pendingRef.current;
      pendingRef.current = null;
      setMessages(next);
    };

    const onChunk = (payload) => {
      if (payload.done) {
        if (throttleTimer) clearTimeout(throttleTimer);
        throttleTimer = null;
        flushPending();
        setMessages((prev) => applyChunkTo(prev, payload));
        doneCountRef.current += 1;
        if (doneCountRef.current >= expectedModels) setIsLoading(false);
        return;
      }

      setMessages((prev) => {
        const base = pendingRef.current !== null ? pendingRef.current : prev;
        const next = applyChunkTo(base, payload);
        pendingRef.current = next;
        if (!throttleTimer) {
          throttleTimer = setTimeout(() => {
            throttleTimer = null;
            flushPending();
          }, STREAM_UPDATE_THROTTLE_MS);
        }
        return prev;
      });
    };

    try {
      await sendChatMessageStream(userMessage, i18n.language, history, onChunk, {
        modelIds: selectedModelIds,
        images: imageDataUrls.length > 0 ? imageDataUrls : undefined
      });
      // Ensure loading is turned off if stream ends without all "done" events
      setIsLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || t('errorFailed'));
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setError(null);
    clearChatState();
  };

  const handleRetry = async (messageIndex, responseIdx) => {
    const aiMsg = messages[messageIndex];
    const userMsg = messages[messageIndex - 1];
    if (!userMsg?.content || !aiMsg?.responses?.[responseIdx]) return;
    const userMessage = userMsg.content;
    const history = buildChatHistory(messages.slice(0, messageIndex - 1));
    const modelId = aiMsg.responses[responseIdx].modelName;
    const key = `${messageIndex}-${responseIdx}`;
    setRetryingKey(key);
    setError(null);
    try {
      const data = await retryFailedModel(userMessage, i18n.language, history, modelId);
      setMessages((prev) => {
        const next = [...prev];
        const msg = next[messageIndex];
        const responses = [...(msg.responses || [])];
        responses[responseIdx] = data.response;
        next[messageIndex] = { ...msg, responses };
        return next;
      });
    } catch (err) {
      console.error('Retry failed:', err);
      setError(err.response?.data?.error || err.message || t('errorFailed'));
    } finally {
      setRetryingKey(null);
    }
  };

  const formatChatAsMarkdown = () => {
    return messages
      .map((msg) => {
        if (msg.type === 'user') {
          return `## ${t('userLabel')}\n\n${msg.content || ''}\n`;
        }
        if (msg.type === 'ai' && msg.responses?.length) {
          return msg.responses
            .map(
              (r) =>
                `### ${r.modelLabel}\n${r.error ? `*Error: ${r.error}*` : (r.response || '')}\n`
            )
            .join('\n---\n');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  };

  const formatChatAsText = () => {
    return messages
      .map((msg) => {
        if (msg.type === 'user') {
          return `${t('userLabel')}:\n${msg.content || ''}\n`;
        }
        if (msg.type === 'ai' && msg.responses?.length) {
          return msg.responses
            .map((r) =>
              `${r.modelLabel}:\n${r.error ? `Error: ${r.error}` : (r.response || '')}\n`
            )
            .join('\n');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n---\n\n');
  };

  const handleCopyChat = async () => {
    try {
      const text = formatChatAsText();
      await navigator.clipboard.writeText(text);
      // Could add a snackbar for "Copied!" feedback
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleExportChat = () => {
    const md = formatChatAsMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyResponse = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const validImages = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(t('errorInvalidImageType'));
        continue;
      }
      if (file.size > maxSize) {
        setError(t('errorImageTooLarge', { maxSize: '10 MB' }));
        continue;
      }
      validImages.push(file);
    }
    
    if (validImages.length > 0) {
      setSelectedImages(prev => [...prev, ...validImages].slice(0, 5)); // Max 5 images
      setError(null);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) return;

    // 1. Handle pasted images
    const items = clipboard.items;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const validImages = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== 'file' || !item.type.startsWith('image/')) continue;
      const file = item.getAsFile();
      if (!file) continue;
      if (file.size > maxSize) {
        setError(t('errorImageTooLarge', { maxSize: '10 MB' }));
        continue;
      }
      validImages.push(file);
    }
    if (validImages.length > 0) {
      event.preventDefault();
      setSelectedImages(prev => [...prev, ...validImages].slice(0, 5));
      setError(null);
      return;
    }

    // 2. Handle rich text (HTML) paste – convert to Markdown to preserve formatting
    const html = clipboard.getData('text/html');
    if (html) {
      event.preventDefault();
      const markdown = turndownService.turndown(html).trim();
      // Insert at cursor position within the current input
      const target = event.target;
      const start = target.selectionStart ?? inputMessage.length;
      const end = target.selectionEnd ?? inputMessage.length;
      const before = inputMessage.slice(0, start);
      const after = inputMessage.slice(end);
      const newValue = before + markdown + after;
      setInputMessage(newValue);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Box
      sx={{
        height: { xs: 'calc(100dvh - 56px)', sm: 'calc(100vh - 100px)' },
        minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100vh - 100px)' },
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 1.5, sm: 3 },
        px: { xs: 1, sm: 2 },
        pb: { xs: 'calc(1.5rem + env(safe-area-inset-bottom))', sm: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}>
            {t('chatHeader')}
          </Typography>
          {messages.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={t('copyChat')}>
              <IconButton
                size="small"
                onClick={handleCopyChat}
                disabled={isLoading}
                aria-label={t('copyChat')}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('exportChat')}>
              <IconButton
                size="small"
                onClick={handleExportChat}
                disabled={isLoading}
                aria-label={t('exportChat')}
              >
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={handleClearHistory}
              disabled={isLoading}
              sx={{ minWidth: { xs: 'auto', sm: 'auto' } }}
            >
              {t('clearHistory')}
            </Button>
          </Box>
        )}
        </Box>
        {/* Model selection */}
        <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: 'background.paper' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t('modelsCountLabel')}
          </Typography>
          <ToggleButtonGroup
            value={modelCount}
            exclusive
            onChange={handleModelCountChange}
            size="small"
            sx={{ mb: 1.5 }}
          >
            <ToggleButton value={2}>{t('compareModels', { count: 2 })}</ToggleButton>
            <ToggleButton value={3}>{t('compareModels', { count: 3 })}</ToggleButton>
          </ToggleButtonGroup>
          {modelCount === 2 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {t('selectModelsLabel', { count: modelCount })}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {AVAILABLE_MODELS.map((model) => (
                  <FormControlLabel
                    key={model.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedModelIds.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                      />
                    }
                    label={t(model.labelKey)}
                    sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                  />
                ))}
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Chat Messages Area */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden',
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 1.5, sm: 2 },
          backgroundColor: '#f5f5f5',
          minHeight: 0
        }}
      >
        {messages.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column',
              px: { xs: 1, sm: 0 }
            }}
          >
            <SmartToyIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', fontSize: { xs: '1rem', sm: 'inherit' } }}>
              {t('emptyState')}
            </Typography>
          </Box>
        )}

        {messages.map((message, index) => (
          <ChatMessageRow
            key={messageId(message, index)}
            message={message}
            index={index}
            retryingKey={retryingKey}
            onRetry={handleRetry}
            onCopyResponse={handleCopyResponse}
            t={t}
          />
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2, flexWrap: 'wrap', gap: 1 }}>
            <CircularProgress size={32} sx={{ flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', fontSize: { xs: '0.8rem', sm: 'inherit' } }}>
              {t('loadingState')}
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: { xs: 1.5, sm: 2 } }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Restore notification */}
      <Snackbar
        open={isRestored}
        autoHideDuration={3000}
        onClose={() => setIsRestored(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setIsRestored(false)}>
          {t('conversationRestored')}
        </Alert>
      </Snackbar>

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 'calc(1.5rem + env(safe-area-inset-bottom))', sm: 2 } }}>
        {/* Image Preview */}
        {selectedImages.length > 0 && (
          <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedImages.map((image, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '2px',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <Tooltip title={t('uploadImage')}>
              <IconButton
                color="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || selectedImages.length >= 5}
                sx={{ alignSelf: 'flex-end' }}
              >
                <ImageIcon />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={t('inputPlaceholder')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              disabled={isLoading}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiInputBase-root': { alignItems: 'flex-end' },
                '& .MuiInputBase-input': { py: { xs: 1, sm: 1.5 } }
              }}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || (!inputMessage.trim() && selectedImages.length === 0) || selectedModelIds.length < 2}
            endIcon={<SendIcon />}
            sx={{
              minWidth: { xs: '100%', sm: '100px' },
              alignSelf: { sm: 'flex-end' }
            }}
          >
            {t('sendButton')}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: { xs: '0.7rem', sm: 'inherit' } }}>
          {t('inputCaption')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatPage;
