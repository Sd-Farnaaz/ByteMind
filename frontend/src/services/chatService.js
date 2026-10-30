import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
  withCredentials: true
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: only log out on genuine auth token invalidation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = error.config?.url?.includes('/auth/');
    const isAuthTokenFailure = status === 401 && (
      error.response?.data?.message?.toLowerCase().includes('not authorized') ||
      error.response?.data?.message?.toLowerCase().includes('token')
    );

    if (isAuthTokenFailure || (status === 401 && isAuthRoute)) {
      console.warn('Authentication token expired or invalid - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Send message to AI (supports optional attached screenshot/image)
export const sendMessage = async (message, conversationId = null, attachedImage = null) => {
  try {
    const response = await api.post('/chat/message', {
      message,
      conversationId,
      attachedImage
    });
    return response.data;
  } catch (error) {
    console.error('Send message error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
    return {
      success: false,
      error: errorMessage,
      conversationId: error.response?.data?.conversationId || conversationId
    };
  }
};

// Generate image via AI
export const generateImage = async (prompt, conversationId = null) => {
  try {
    const response = await api.post('/chat/generate-image', {
      prompt,
      conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Generate image error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to generate image';
    return {
      success: false,
      error: errorMessage,
      conversationId: error.response?.data?.conversationId || conversationId
    };
  }
};

// Get all conversations for the user
export const getConversations = async () => {
  try {
    const response = await api.get('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('Failed to get conversations:', error.response?.data || error.message);
    return { success: false, conversations: [] };
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/chat/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get messages:', error.response?.data || error.message);
    return { success: false, messages: [] };
  }
};

// Clear a conversation
export const clearConversation = async (conversationId) => {
  try {
    const response = await api.patch('/chat/conversation/clear', {
      conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to clear conversation:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || 'Failed to clear conversation' };
  }
};

// Delete a conversation
export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete('/chat/conversation', {
      data: { conversationId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete conversation:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || 'Failed to delete conversation' };
  }
};

// Rename a conversation
export const renameConversation = async (conversationId, title) => {
  try {
    const response = await api.patch('/chat/conversation', {
      conversationId,
      title
    });
    return response.data;
  } catch (error) {
    console.error('Failed to rename conversation:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || 'Failed to rename conversation' };
  }
};

export const getConversation = async (conversationId) => {
  return getConversationMessages(conversationId);
};
