import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      appName: 'Multi-AI Chat',
      chatHeader: 'Chat with three AI models simultaneously and compare their responses',
      emptyState: 'Start a conversation with multiple AI models',
      userLabel: 'You',
      aiResponsesLabel: 'AI Responses',
      loadingState: 'Getting responses from AI models...',
      inputPlaceholder: 'Type your message here...',
      sendButton: 'Send',
      inputCaption: 'Press Enter to send, Shift+Enter for new line',
      clearHistory: 'Clear history',
      retryButton: 'Retry',
      retryingLabel: 'Retrying...',
      errorFailed: 'Failed to get responses. Please try again.',
      language: 'Language',
      en: 'English',
      zhHK: 'Traditional Chinese',
      zhCN: 'Simplified Chinese'
    }
  },
  zhHK: {
    translation: {
      appName: '多 AI 聊天',
      chatHeader: '同時與三個 AI 模型聊天並比較它們的回答',
      emptyState: '與多個 AI 模型開始對話',
      userLabel: '您',
      aiResponsesLabel: 'AI 回答',
      loadingState: '正在獲取 AI 模型的回答...',
      inputPlaceholder: '在此輸入您的訊息...',
      sendButton: '發送',
      inputCaption: '按 Enter 發送，Shift+Enter 換行',
      clearHistory: '清除記錄',
      retryButton: '重試',
      retryingLabel: '重試中...',
      errorFailed: '獲取回答失敗。請再試一次。',
      language: '語言',
      en: '英文',
      zhHK: '繁體中文',
      zhCN: '簡體中文'
    }
  },
  zhCN: {
    translation: {
      appName: '多 AI 聊天',
      chatHeader: '同時與三個 AI 模型聊天並比較它們的回答',
      emptyState: '與多个 AI 模型开始对话',
      userLabel: '您',
      aiResponsesLabel: 'AI 回答',
      loadingState: '正在获取 AI 模型的回答...',
      inputPlaceholder: '在此輸入您的消息...',
      sendButton: '发送',
      inputCaption: '按 Enter 发送，Shift+Enter 换行',
      clearHistory: '清除记录',
      retryButton: '重试',
      retryingLabel: '重试中...',
      errorFailed: '获取回答失败。请再试一次。',
      language: '语言',
      en: '英文',
      zhHK: '繁体中文',
      zhCN: '简体中文'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Set default language to English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
