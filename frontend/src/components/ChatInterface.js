import React, { useEffect, useRef, useState } from 'react';
import {
  FiMenu,
  FiSend,
  FiLogOut,
  FiMic,
  FiUser
} from 'react-icons/fi';

import {
  sendMessage,
  getConversations
} from '../services/chatService';

import Sidebar from './Sidebar';

const ChatInterface = ({ user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

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
    try {
      const data = await getConversations();

      if (
        data.success &&
        data.conversations.length > 0
      ) {
        setConversationId(data.conversations[0]._id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const response = await sendMessage(
        currentMessage,
        conversationId
      );

      if (response.success) {
        const aiMessage = {
          role: 'assistant',
          content:
            response.message ||
            response.reply ||
            'No response'
        };

        setMessages((prev) => [
          ...prev,
          aiMessage
        ]);

        if (response.conversationId) {
          setConversationId(
            response.conversationId
          );
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              response.error ||
              'Failed to send message'
          }
        ]);
      }
    } catch (err) {
      console.log(err);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Server error occurred'
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:relative top-0 left-0 z-50
          h-full w-[280px]
          bg-white border-r border-slate-200
          transform transition-transform duration-300
          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
          md:translate-x-0
          shrink-0
        `}
      >
        <Sidebar
          isOpen={true}
          onClose={() => setSidebarOpen(false)}
          onNewChat={() => {
            setMessages([]);
            setConversationId(null);
          }}
          onClearChat={() => {
            setMessages([]);
          }}
          conversationId={conversationId}
        />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">

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
              <h1 className="font-bold text-slate-800 text-lg">
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

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          <div className="max-w-4xl mx-auto">

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
                    Ask me anything and start
                    chatting with AI.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">

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
                        max-w-[85%] rounded-3xl px-5 py-4
                        ${
                          msg.role === 'user'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">

                        <div className="mt-1">
                          {msg.role === 'user' ? (
                            <FiUser />
                          ) : (
                            '🤖'
                          )}
                        </div>

                        <p className="whitespace-pre-wrap leading-7">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">

                    <div className="bg-white border border-slate-200 rounded-3xl px-5 py-4">
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT */}
        <div className="border-t border-slate-200 bg-white p-4">

          <div className="max-w-4xl mx-auto">

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-3xl p-3">

              <textarea
                rows="1"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Ask anything..."
                className="flex-1 resize-none bg-transparent outline-none text-slate-700"
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