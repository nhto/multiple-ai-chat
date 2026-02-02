import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      appName: 'Multi-AI Chat',
      chatHeader: 'Chat with multiple AI models simultaneously and compare their responses',
      emptyState: 'Start a conversation with multiple AI models',
      userLabel: 'You',
      aiResponsesLabel: 'AI Responses',
      loadingState: 'Getting responses from AI models...',
      inputPlaceholder: 'Type your message here...',
      sendButton: 'Send',
      inputCaption: 'Press Enter to send, Shift+Enter for new line',
      clearHistory: 'Clear history',
      conversationRestored: 'Conversation restored',
      copyChat: 'Copy chat',
      exportChat: 'Export chat',
      copyResponse: 'Copy response',
      copyMessage: 'Copy message',
      retryButton: 'Retry',
      retryingLabel: 'Retrying...',
      modelsCountLabel: 'Number of models',
      compareModels: 'Compare {{count}} models',
      selectModelsLabel: 'Select models (choose {{count}})',
      modelGrok: 'xAI: Grok 4.1 Fast',
      modelKimi: 'MoonshotAI: Kimi K2.5',
      modelQwen: 'Qwen: Qwen3 VL 8B Instruct',
      uploadImage: 'Upload image',
      errorFailed: 'Failed to get responses. Please try again.',
      errorInvalidImageType: 'Please select valid image files only.',
      errorImageTooLarge: 'Image size must be less than {{maxSize}}.',
      errorImageConversion: 'Failed to process images. Please try again.',
      language: 'Language',
      en: 'English',
      zhHK: 'Traditional Chinese',
      zhCN: 'Simplified Chinese'
    }
  },
  zhHK: {
    translation: {
      appName: '多 AI 聊天',
      chatHeader: '同時與多個 AI 模型聊天並比較它們的回答',
      emptyState: '與多個 AI 模型開始對話',
      userLabel: '您',
      aiResponsesLabel: 'AI 回答',
      loadingState: '正在獲取 AI 模型的回答...',
      inputPlaceholder: '在此輸入您的訊息...',
      sendButton: '發送',
      inputCaption: '按 Enter 發送，Shift+Enter 換行',
      clearHistory: '清除記錄',
      conversationRestored: '對話已恢復',
      copyChat: '複製聊天',
      exportChat: '匯出聊天',
      copyMessage: '複製訊息',
      copyResponse: '複製回答',
      retryButton: '重試',
      retryingLabel: '重試中...',
      modelsCountLabel: '模型數量',
      compareModels: '比較 {{count}} 個模型',
      selectModelsLabel: '選擇模型（選 {{count}} 個）',
      modelGrok: 'xAI: Grok 4.1 Fast',
      modelKimi: 'MoonshotAI: Kimi K2.5',
      modelQwen: 'Qwen: Qwen3 VL 8B Instruct',
      uploadImage: '上傳圖片',
      errorFailed: '獲取回答失敗。請再試一次。',
      errorInvalidImageType: '請只選擇有效的圖片檔案。',
      errorImageTooLarge: '圖片大小必須小於 {{maxSize}}。',
      errorImageConversion: '處理圖片失敗。請再試一次。',
      language: '語言',
      en: '英文',
      zhHK: '繁體中文',
      zhCN: '簡體中文'
    }
  },
  zhCN: {
    translation: {
      appName: '多 AI 聊天',
      chatHeader: '同时与多个 AI 模型聊天并比较它们的回答',
      emptyState: '與多个 AI 模型开始对话',
      userLabel: '您',
      aiResponsesLabel: 'AI 回答',
      loadingState: '正在获取 AI 模型的回答...',
      inputPlaceholder: '在此輸入您的消息...',
      sendButton: '发送',
      inputCaption: '按 Enter 发送，Shift+Enter 换行',
      clearHistory: '清除记录',
      conversationRestored: '对话已恢复',
      copyChat: '复制聊天',
      exportChat: '导出聊天',
      copyMessage: '复制消息',
      copyResponse: '复制回答',
      retryButton: '重试',
      retryingLabel: '重试中...',
      modelsCountLabel: '模型数量',
      compareModels: '比较 {{count}} 个模型',
      selectModelsLabel: '选择模型（选 {{count}} 个）',
      modelGrok: 'xAI: Grok 4.1 Fast',
      modelKimi: 'MoonshotAI: Kimi K2.5',
      modelQwen: 'Qwen: Qwen3 VL 8B Instruct',
      uploadImage: '上传图片',
      errorFailed: '获取回答失败。请再试一次。',
      errorInvalidImageType: '请只选择有效的图片文件。',
      errorImageTooLarge: '图片大小必须小于 {{maxSize}}。',
      errorImageConversion: '处理图片失败。请再试一次。',
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
    lng: 'zhHK', // Set default language to Traditional Chinese
    fallbackLng: 'zhHK',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
