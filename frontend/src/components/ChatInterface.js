import React, { useEffect, useRef, useState } from 'react';
import {
  FiMenu,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiZap,
  FiCamera
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import Sidebar from './Sidebar';
import WelcomeScreen from './WelcomeScreen';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ByteMindMascot from './ByteMindMascot';

import {
  sendMessage,
  generateImage,
  getConversations,
  getConversationMessages,
  deleteConversation,
  clearConversation,
  renameConversation
} from '../services/chatService';

const ChatInterface = ({ user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isExportingChat, setIsExportingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadConversations = async () => {
    const data = await getConversations();
    if (data.success) {
      setConversations(data.conversations || []);
    }
  };

  const loadMessages = async (conversation) => {
    setConversationId(conversation.conversationId);
    const data = await getConversationMessages(conversation.conversationId);
    if (data.success) {
      setMessages(data.messages || []);
    } else {
      toast.error('Failed to load conversation messages');
    }
  };

  const handleSendMessage = async (textToSend, options = {}) => {
    const trimmed = (textToSend || '').trim();
    const { attachedImage, isImageMode } = options;

    if (!trimmed && !attachedImage) return;
    if (loading) return;

    const isImageRequest = isImageMode || /^\/(image|imagine)\s+/i.test(trimmed);

    if (isImageRequest) {
      const prompt = trimmed.replace(/^\/(image|imagine)\s+/i, '').trim();
      if (!prompt) {
        toast.error('Please provide a description for the image.');
        return;
      }

      // Optimistically add user prompt message
      const userMsg = {
        role: 'user',
        content: `/image ${prompt}`,
        attachedImage: attachedImage || null,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const response = await generateImage(prompt, conversationId);

        if (response.success) {
          const assistantMsg = {
            role: 'assistant',
            content: response.message,
            type: 'image',
            imageUrl: response.imageUrl,
            timestamp: response.timestamp || new Date().toISOString()
          };

          setMessages((prev) => [...prev, assistantMsg]);

          if (response.conversationId) {
            setConversationId(response.conversationId);
          }

          loadConversations();
        } else {
          const errorText = response.error || response.message || 'Failed to generate image.';
          const errorMsg = {
            role: 'assistant',
            content: errorText,
            isError: true,
            timestamp: new Date().toISOString()
          };
          setMessages((prev) => [...prev, errorMsg]);
          toast.error(errorText);
        }
      } catch (err) {
        console.error('Image gen error:', err);
        const errorMsg = {
          role: 'assistant',
          content: err.message || 'Network error while generating image.',
          isError: true,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, errorMsg]);
        toast.error('Failed to generate image');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Standard Chat Message (with optional attached screenshot)
    const userMsg = {
      role: 'user',
      content: trimmed || 'Shared an image',
      attachedImage: attachedImage || null,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendMessage(trimmed, conversationId, attachedImage);

      if (response.success) {
        const assistantMsg = {
          role: 'assistant',
          content: response.message || response.reply,
          type: response.type || 'text',
          imageUrl: response.imageUrl || null,
          timestamp: response.timestamp || new Date().toISOString()
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (response.conversationId) {
          setConversationId(response.conversationId);
        }

        loadConversations();
      } else {
        const errorText = response.error || response.message || 'An error occurred with the AI provider.';
        const errorMsg = {
          role: 'assistant',
          content: errorText,
          isError: true,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, errorMsg]);
        toast.error(errorText);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        role: 'assistant',
        content: err.message || 'Network error communicating with ByteMind AI service.',
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error('Failed to get a response');
    } finally {
      setLoading(false);
    }
  };

  // Retry the last user prompt
  const handleRetry = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        const lastUserPrompt = messages[i].content;
        const lastAttached = messages[i].attachedImage;
        // Strip trailing error assistant messages
        setMessages((prev) => prev.slice(0, i + 1));
        // Resend
        handleSendMessage(lastUserPrompt, { attachedImage: lastAttached });
        return;
      }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const handleDeleteConversation = async (id) => {
    try {
      const res = await deleteConversation(id);
      if (res.success) {
        toast.success('Conversation deleted');
        if (conversationId === id) {
          setMessages([]);
          setConversationId(null);
        }
        loadConversations();
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleClearConversation = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      const res = await clearConversation(conversationId);
      if (res.success) {
        setMessages([]);
        toast.success('Conversation cleared');
      } else {
        toast.error(res.error || 'Failed to clear');
      }
    } catch (err) {
      toast.error('Failed to clear conversation');
    }
  };

  const handleRenameConversation = async (convId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;

    try {
      const res = await renameConversation(convId, newTitle.trim());
      if (res.success) {
        toast.success('Conversation renamed');
        loadConversations();
      } else {
        toast.error(res.error || 'Failed to rename');
      }
    } catch (err) {
      toast.error('Failed to rename conversation');
    }
  };

  // Capture full chat thread viewport as PNG screenshot
  const handleExportChatScreenshot = async () => {
    if (!chatScrollContainerRef.current || isExportingChat) return;
    if (messages.length === 0) {
      toast.error('Start a conversation first to capture a screenshot!');
      return;
    }

    setIsExportingChat(true);
    const toastId = toast.loading('Capturing chat screenshot...');
    try {
      const canvas = await html2canvas(chatScrollContainerRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `bytemind-chat-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Chat screenshot exported!', { id: toastId });
    } catch (err) {
      console.error('Failed to export chat screenshot:', err);
      toast.error('Failed to capture screenshot', { id: toastId });
    } finally {
      setIsExportingChat(false);
    }
  };

  // Get current active conversation title if any
  const currentConv = conversations.find((c) => c.conversationId === conversationId);
  const activeTitle = currentConv ? currentConv.title : (messages.length > 0 ? 'Current Chat' : 'New Chat');

  return (
    <div className="flex h-full h-[100dvh] overflow-hidden dreamscape-bg relative">
      {/* Dreamy Ambient Depth Glows in Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-300/20 filter blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[420px] h-[420px] rounded-full bg-sky-300/20 filter blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 rounded-full bg-indigo-300/15 filter blur-[80px] pointer-events-none" />

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        conversations={conversations}
        currentConversationId={conversationId}
        onSelectConversation={loadMessages}
        onDeleteConversation={handleDeleteConversation}
        onClearConversation={handleClearConversation}
        onRenameConversation={handleRenameConversation}
        user={user}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full h-[100dvh] overflow-hidden relative z-10">
        {/* HEADER BAR */}
        <header className="h-14 sm:h-16 glass-panel border-b border-white/60 px-3 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Sidebar toggle for mobile & desktop */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setSidebarOpen(true);
                } else {
                  setSidebarCollapsed(false);
                }
              }}
              className={`${
                sidebarCollapsed ? 'md:flex' : 'md:hidden'
              } w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-card hover:bg-white text-slate-600 flex items-center justify-center transition-all shadow-xs`}
              aria-label="Open sidebar"
            >
              <FiMenu size={17} />
            </button>

            {/* Conversation Title & Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-bold text-slate-800 truncate max-w-[130px] sm:max-w-none">
                  {activeTitle}
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-100/70 text-violet-700 text-[9px] sm:text-[10px] font-semibold border border-violet-200/60">
                  <FiZap size={9} />
                  ByteMind 2.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                AI Assistant with Instant Image Generation
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Full Chat Screenshot Export Button */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleExportChatScreenshot}
                disabled={isExportingChat}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl glass-card hover:bg-white text-slate-700 text-xs font-medium transition-all shadow-xs border border-white/80"
                title="Export entire chat as PNG screenshot"
              >
                <FiCamera size={14} className={isExportingChat ? 'animate-pulse text-violet-600' : 'text-violet-600'} />
                <span className="hidden sm:inline">{isExportingChat ? 'Capturing...' : 'Screenshot'}</span>
              </button>
            )}

            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl glass-card hover:bg-white text-slate-700 text-xs font-medium transition-all shadow-xs border border-white/80"
              title="Start a new chat"
            >
              <FiPlus size={14} className="text-violet-600" />
              <span className="hidden sm:inline">New</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleClearConversation}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-card hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shadow-xs border border-white/80"
                title="Clear current messages"
              >
                <FiTrash2 size={14} />
              </button>
            )}

            <button
              onClick={setUser}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-card hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shadow-xs border border-white/80"
              title="Log Out"
            >
              <FiLogOut size={15} />
            </button>
          </div>
        </header>

        {/* MESSAGES SCROLL VIEW */}
        <div
          ref={chatScrollContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6 scrollbar-glass flex flex-col overscroll-contain"
        >
          {messages.length === 0 ? (
            <WelcomeScreen
              userName={user?.name}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            />
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-2 flex-1">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  onRetry={handleRetry}
                  isLast={index === messages.length - 1}
                />
              ))}

              {/* Typing / Generating Glass State */}
              {loading && (
                <div className="flex items-start gap-3 mb-6 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-white/90 border border-violet-200/80 flex items-center justify-center shadow-sm shrink-0">
                    <ByteMindMascot size="xs" isThinking={true} />
                  </div>
                  <div className="glass-card rounded-3xl rounded-tl-sm px-5 py-3.5 border border-white/80 shadow-bubble-ai flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">ByteMind is crafting your response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* FLOATING CHAT COMPOSER */}
        <div className="p-2 sm:p-5 pb-3 sm:pb-5 shrink-0 relative z-20">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={loading}
              placeholder="Ask ByteMind anything, paste a screenshot (Ctrl+V), or generate art..."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
