import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * Send a message to multiple AI models
 * @param {string} message - The user's message
 * @param {string} language - The selected language (e.g., 'en', 'zhHK', 'zhCN')
 * @returns {Promise} - Promise resolving to the API response
 */
export const sendChatMessage = async (message, language) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat`, {
      message,
      language
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
