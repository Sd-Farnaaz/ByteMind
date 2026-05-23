import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { logout } from "../services/authService";
import {
  sendMessage,
  getConversations,
  getConversationMessages,
  clearConversation,
  deleteConversation,
  renameConversation,
} from "../services/chatService";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import toast from "react-hot-toast";

const ChatInterface = ({ user, setUser }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const loadConversations = async () => {
    try {
      const response = await getConversations();

      if (response.success && response.conversations) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await getConversationMessages(conversationId);

      if (response.success && response.messages) {
        const formattedMessages = response.messages.map((msg, idx) => ({
          id: idx,
          text: msg.content,
          isUser: msg.role === "user",
          timestamp: msg.timestamp,
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(message, currentConversation);

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.message,
          isUser: false,
          timestamp: new Date(response.timestamp),
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (!currentConversation && response.conversationId) {
          setCurrentConversation(response.conversationId);
          await loadConversations();
        }
      } else {
        toast.error(response.error || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversation(null);
    toast.success("New conversation started");

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const deleteConversationItem = async (conversationId) => {
    try {
      const response = await deleteConversation(conversationId);

      if (response.success) {
        setConversations((prev) =>
          prev.filter((conv) => conv.conversationId !== conversationId),
        );

        if (currentConversation === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }

        toast.success("Conversation deleted");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const clearConversationMessages = async (conversationId) => {
    try {
      const response = await clearConversation(conversationId);

      if (response.success) {
        setMessages([]);
        toast.success("Conversation cleared");
      }
    } catch (error) {
      toast.error("Clear failed");
    }
  };

  const renameConversationItem = async (conversationId, currentTitle) => {
    const newTitle = prompt("Enter new conversation title", currentTitle || "");

    if (!newTitle) return;

    try {
      const response = await renameConversation(conversationId, newTitle);

      if (response.success) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === conversationId
              ? {
                  ...conv,
                  title: newTitle,
                }
              : conv,
          ),
        );

        toast.success("Conversation renamed");
      }
    } catch (error) {
      toast.error("Rename failed");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
    fixed lg:static top-0 left-0
    z-[60] h-full
    bg-white border-r border-gray-200
    flex flex-col
    transition-transform duration-300 ease-in-out
    overflow-y-auto

    w-[280px] sm:w-[320px]

    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

    lg:translate-x-0
    lg:flex
    lg:w-80
    shrink-0
  `}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                B
              </div>

              <div>
                <h1 className="font-semibold text-gray-800">ByteMind</h1>

                <p className="text-xs text-gray-500">AI Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* NEW CHAT */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 font-medium transition"
          >
            + New Conversation
          </button>
        </div>

        {/* CONVERSATIONS */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.conversationId}
                className={`
                  p-3 rounded-2xl border transition
                  ${
                    currentConversation === conv.conversationId
                      ? "bg-primary-50 border-primary-200"
                      : "hover:bg-slate-50 border-transparent"
                  }
                `}
              >
                <button
                  onClick={() => {
                    setCurrentConversation(conv.conversationId);

                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className="w-full text-left"
                >
                  <div className="font-medium text-sm truncate">
                    {conv.title || "Chat"}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() =>
                      renameConversationItem(conv.conversationId, conv.title)
                    }
                    className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Rename
                  </button>

                  <button
                    onClick={() => deleteConversationItem(conv.conversationId)}
                    className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() =>
                      clearConversationMessages(conv.conversationId)
                    }
                    className="text-xs px-2 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>

              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0 w-full">
        {/* MOBILE HEADER */}
        {/* MOBILE HEADER */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center active:scale-95 transition"
          >
            ☰
          </button>

          <div>
            <h2 className="font-semibold text-slate-800 text-lg">ByteMind</h2>

            <p className="text-xs text-emerald-500">● Online</p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:px-8">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 text-3xl">
                  🤖
                </div>

                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Welcome, {user?.name?.split(" ")[0]}!
                </h2>

                <p className="text-gray-500">
                  Ask me anything and start chatting with AI.
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
            <div className="max-w-3xl mx-auto mt-4">
              <div className="bg-white px-4 py-3 rounded-3xl w-fit shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />

            <p className="text-xs text-center text-slate-500 mt-4">
              AI responses may be inaccurate. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
