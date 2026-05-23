import React, { useEffect, useRef, useState } from 'react';

import {
  FiMenu,
  FiSend,
  FiLogOut,
  FiMic,
  FiUser
} from 'react-icons/fi';

import Sidebar from './Sidebar';

import {
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation,
  clearConversation,
  renameConversation
} from '../services/chatService';

const ChatInterface = ({ user, setUser }) => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [conversationId, setConversationId] = useState(null);

  const [conversations, setConversations] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const loadConversations = async () => {

    const data = await getConversations();

    if (data.success) {
      setConversations(data.conversations || []);
    }
  };

  const loadMessages = async (conversation) => {

    setConversationId(conversation._id);

    const data = await getConversationMessages(
      conversation._id
    );

    if (data.success) {
      setMessages(data.messages || []);
    }
  };

  const handleSend = async () => {

    if (!message.trim()) return;

    const tempMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: tempMessage
      }
    ]);

    setMessage('');

    setLoading(true);

    try {

      const response = await sendMessage(
        tempMessage,
        conversationId
      );

      if (response.success) {

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              response.message ||
              response.reply
          }
        ]);

        if (response.conversationId) {
          setConversationId(
            response.conversationId
          );
        }

        loadConversations();
      }

    } catch (err) {

      console.log(err);

    }

    setLoading(false);
  };

  const handleDeleteConversation = async (id) => {

    await deleteConversation(id);

    setMessages([]);

    setConversationId(null);

    loadConversations();
  };

  const handleClearConversation = async () => {

    if (!conversationId) return;

    await clearConversation(conversationId);

    setMessages([]);
  };

  const handleRenameConversation = async (
    conversation
  ) => {

    const title = prompt(
      'Enter new conversation name:',
      conversation.title
    );

    if (!title) return;

    await renameConversation(
      conversation._id,
      title
    );

    loadConversations();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          setMessages([]);
          setConversationId(null);
          setSidebarOpen(false);
        }}
        conversations={conversations}
        currentConversationId={conversationId}
        onSelectConversation={loadMessages}
        onDeleteConversation={handleDeleteConversation}
        onClearConversation={handleClearConversation}
        onRenameConversation={handleRenameConversation}
      />

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
            >
              <FiMenu size={22} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-800">
                ByteMind
              </h1>

              <p className="text-sm text-green-500">
                Online
              </p>
            </div>
          </div>

          <button
            onClick={setUser}
            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"
          >
            <FiLogOut />
          </button>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          {messages.length === 0 ? (

            <div className="h-full flex items-center justify-center">

              <div className="text-center">

                <div className="text-6xl mb-6">
                  🤖
                </div>

                <h2 className="text-4xl font-bold text-slate-700 mb-4">
                  Welcome, {user?.name}!
                </h2>

                <p className="text-slate-500 text-lg">
                  Ask me anything and start chatting with AI.
                </p>
              </div>
            </div>

          ) : (

            <div className="max-w-4xl mx-auto space-y-6">

              {messages.map((msg, index) => (

                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >

                  <div
                    className={`
                      max-w-[85%]
                      rounded-3xl
                      px-5 py-4
                      ${
                        msg.role === 'user'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }
                    `}
                  >

                    <div className="flex gap-3">

                      <div>
                        {msg.role === 'user'
                          ? <FiUser />
                          : '🤖'}
                      </div>

                      <p className="leading-7 whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="bg-white border border-slate-200 rounded-3xl px-5 py-4 inline-block">
                  Thinking...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="border-t border-slate-200 bg-white p-4 shrink-0">

          <div className="max-w-4xl mx-auto">

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-3xl p-3">

              <textarea
                rows="1"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Ask anything..."
                className="flex-1 resize-none bg-transparent outline-none"
              />

              <button className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center">
                <FiMic />
              </button>

              <button
                onClick={handleSend}
                disabled={loading}
                className="px-6 h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2 font-semibold"
              >
                <FiSend />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;