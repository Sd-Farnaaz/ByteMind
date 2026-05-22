import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { logout } from '../services/authService';
import { sendMessage, getConversations, getConversationMessages, clearConversation, deleteConversation, renameConversation } from '../services/chatService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import toast from 'react-hot-toast';

const ChatInterface = ({ user, setUser }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await getConversations();
      if (response.success && response.conversations) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await getConversationMessages(conversationId);
      if (response.success && response.messages) {
        const formattedMessages = response.messages.map((msg, idx) => ({
          id: idx,
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load conversation history');
    }
  };

  const deleteConversationItem = async (conversationId) => {
    if (!window.confirm('Delete this conversation permanently?')) return;

    try {
      const response = await deleteConversation(conversationId);
      if (response.success) {
        setConversations(prev => prev.filter(conv => conv.conversationId !== conversationId));
        if (currentConversation === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        await loadConversations();
        toast.success('Conversation deleted');
      } else {
        toast.error(response.error || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const clearConversationMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      toast.success('Chat cleared');
      return;
    }

    if (!window.confirm('Clear all messages from this conversation?')) return;

    try {
      const response = await clearConversation(conversationId);
      if (response.success) {
        if (currentConversation === conversationId) {
          setMessages([]);
        }
        await loadConversations();
        toast.success('Conversation cleared');
      } else {
        toast.error(response.error || 'Failed to clear conversation');
      }
    } catch (error) {
      console.error('Clear conversation error:', error);
      toast.error('Failed to clear conversation');
    }
  };

  const renameConversationItem = async (conversationId, currentTitle) => {
    const newTitle = window.prompt('Enter a new title for this conversation', currentTitle || '');
    if (!newTitle || !newTitle.trim()) return;

    try {
      const response = await renameConversation(conversationId, newTitle.trim());
      if (response.success) {
        setConversations(prev => prev.map(conv => conv.conversationId === conversationId ? { ...conv, title: response.title || newTitle.trim() } : conv));
        toast.success('Conversation renamed');
      } else {
        toast.error(response.error || 'Failed to rename conversation');
      }
    } catch (error) {
      console.error('Rename conversation error:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(message, currentConversation);
      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.message,
          isUser: false,
          timestamp: new Date(response.timestamp)
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // If new conversation, update current conversation ID and reload list
        if (!currentConversation && response.conversationId) {
          setCurrentConversation(response.conversationId);
          await loadConversations();
        }
      } else {
        toast.error(response.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Send message error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversation(null);
    toast.success('New conversation started');
  };

  const handleClearChat = async () => {
    if (!currentConversation) {
      setMessages([]);
      toast.success('Chat cleared');
      return;
    }
    
    await clearConversationMessages(currentConversation);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">ByteMind</h1>
                <p className="text-xs text-gray-500">Modern AI chat for sharp thinking</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            {conversations.map(conv => (
              <div
                key={conv.conversationId}
                className={`w-full rounded-2xl border p-3 transition-all duration-200 ${
                  currentConversation === conv.conversationId 
                    ? 'bg-primary-50 border-primary-200 shadow-sm' 
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <button
                  onClick={() => setCurrentConversation(conv.conversationId)}
                  className="w-full text-left"
                >
                  <div className="text-sm font-medium text-gray-800 truncate">{conv.title || 'Chat'}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => renameConversationItem(conv.conversationId, conv.title)}
                    className="px-2 py-1 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteConversationItem(conv.conversationId)}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => clearConversationMessages(conv.conversationId)}
                    className="px-2 py-1 text-xs text-slate-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear chat"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">ByteMind</h2>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 xl:px-8">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Welcome, {user?.name?.split(' ')[0]}!
                </h2>
                <p className="text-gray-500">
                  Ask me anything! I'm here to help with coding, questions, brainstorming, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChatMessage message={message} />
                </motion.div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex justify-start mb-4 max-w-3xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-none px-4 py-3 shadow-sm shadow-slate-200/80">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white shadow-[0_-10px_30px_-22px_rgba(15,23,42,0.08)]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            <p className="text-xs text-center text-slate-500 mt-4">
              AI responses are generated. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;