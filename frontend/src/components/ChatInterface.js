import React, { useState } from 'react';
import {
  FiMenu,
  FiSend,
  FiLogOut,
  FiMic
} from 'react-icons/fi';

import Sidebar from './Sidebar';

const ChatInterface = ({ user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 relative">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:relative z-50 md:z-0
          top-0 left-0 h-full
          w-[280px]
          bg-white border-r border-slate-200
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col
        `}
      >
        <Sidebar
          isOpen={true}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">

        {/* HEADER */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">

          {/* MENU BUTTON */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <FiMenu size={22} />
          </button>

          {/* TITLE */}
          <div className="flex-1">
            <h1 className="font-bold text-slate-800 text-lg">
              ByteMind
            </h1>
            <p className="text-sm text-slate-500">
              Online
            </p>
          </div>

          {/* LOGOUT */}
          <button
            onClick={setUser}
            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"
          >
            <FiLogOut />
          </button>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          <div className="max-w-3xl mx-auto">

            {/* WELCOME */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 min-h-[300px] flex flex-col items-center justify-center text-center px-6 py-10">

              <div className="text-5xl mb-6">🤖</div>

              <h2 className="text-3xl font-bold text-slate-700 mb-4">
                Welcome, {user?.name || 'User'}!
              </h2>

              <p className="text-slate-500 text-lg max-w-md">
                Ask me anything and start chatting with AI.
              </p>
            </div>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="border-t border-slate-200 bg-white p-4">

          <div className="max-w-3xl mx-auto">

            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4">

              <h3 className="font-semibold text-slate-800 mb-1">
                Send a message
              </h3>

              <p className="text-slate-500 text-sm mb-5">
                Type your prompt and press Send.
              </p>

              {/* INPUT */}
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-3xl p-3">

                <textarea
                  rows="1"
                  placeholder="Ask a question or tell me what you need help with..."
                  className="flex-1 resize-none outline-none bg-transparent text-slate-700"
                />

                <button className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <FiMic size={22} />
                </button>

                <button className="px-6 h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2 font-semibold">
                  <FiSend />
                  Send
                </button>
              </div>

              {/* SUGGESTIONS */}
              <div className="mt-5 space-y-3">

                {[
                  'Best way to learn React',
                  'Asynchronous JavaScript',
                  'Quick coding tip'
                ].map((item, index) => (
                  <button
                    key={index}
                    className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-medium"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-slate-400 mt-4">
              AI responses may be inaccurate. Verify important information.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;