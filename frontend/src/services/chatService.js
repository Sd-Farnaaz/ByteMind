import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true
});

// IMPORTANT: Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Sending request to:', config.url, 'Token exists:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Send message to AI
export const sendMessage = async (message, conversationId = null) => {
  try {
    const response = await api.post('/chat/message', {
      message,
      conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    if (error.response?.status === 401) {
      return { success: false, error: 'Please login again' };
    }
    return { success: false, error: error.response?.data?.message || 'Failed to send message' };
  }
};

// Get all conversations for the user
export const getConversations = async () => {
  try {
    const response = await api.get('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('Failed to get conversations:', error);
    if (error.response?.status === 401) {
      return { success: false, error: 'Please login again' };
    }
    return { success: false, conversations: [] };
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/chat/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get messages:', error);
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
    console.error('Failed to clear conversation:', error);
    return { success: false, error: 'Failed to clear conversation' };
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
    console.error('Failed to delete conversation:', error);
    return { success: false, error: 'Failed to delete conversation' };
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
    console.error('Failed to rename conversation:', error);
    return { success: false, error: 'Failed to rename conversation' };
  }
};

// Get single conversation (legacy support)
export const getConversation = async (conversationId) => {
  return getConversationMessages(conversationId);
};