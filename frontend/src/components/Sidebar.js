import React from 'react';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiMessageSquare
} from 'react-icons/fi';

const Sidebar = ({
  isOpen,
  onClose,
  onNewChat,
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onClearConversation,
  onRenameConversation,
  user
}) => {

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:relative
          top-0 left-0
          z-50
          h-screen
          w-[290px]
          bg-white
          border-r border-slate-200
          flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >

        {/* HEADER */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Conversations
            </h2>
          </div>

          <button
            onClick={onClose}
            className="md:hidden w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* NEW CHAT */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="
              w-full
              h-12
              rounded-2xl
              bg-indigo-500
              hover:bg-indigo-600
              text-white
              font-semibold
              flex items-center justify-center gap-2
              transition
            "
          >
            <FiPlus size={18} />
            New Conversation
          </button>
        </div>

        {/* CONVERSATION LIST */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 scrollbar-thin">

          {conversations.length === 0 && (
            <div className="text-center text-slate-400 mt-10">
              No conversations yet
            </div>
          )}

          {conversations.map((conv) => (

            <div
              key={conv._id}
              className={`
                rounded-2xl
                border
                p-3
                transition-all
                ${
                  currentConversationId === conv._id
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }
              `}
            >

              {/* CLICKABLE AREA */}
              <div
                onClick={() => {
                  onSelectConversation(conv);
                  onClose();
                }}
                className="cursor-pointer"
              >

                <div className="flex items-center gap-2 mb-2">

                  <FiMessageSquare
                    className="text-indigo-500 shrink-0"
                  />

                  <p className="font-semibold text-slate-700 truncate">
                    {conv.title || 'New Chat'}
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  {conv.createdAt
                    ? new Date(conv.createdAt).toLocaleDateString()
                    : 'Recent Chat'}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-3">

                {/* RENAME */}
                <button
                  onClick={() =>
                    onRenameConversation(conv)
                  }
                  className="
                    flex-1
                    h-9
                    rounded-xl
                    bg-slate-100
                    hover:bg-slate-200
                    text-slate-700
                    text-sm
                    flex items-center justify-center gap-1
                    transition
                  "
                >
                  <FiEdit2 size={14} />
                  Rename
                </button>

                {/* DELETE */}
                <button
                  onClick={() =>
                    onDeleteConversation(conv._id)
                  }
                  className="
                    flex-1
                    h-9
                    rounded-xl
                    bg-red-50
                    hover:bg-red-100
                    text-red-500
                    text-sm
                    flex items-center justify-center gap-1
                    transition
                  "
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 space-y-3 shrink-0">

          {/* USER CARD */}
          <div className="bg-slate-100 rounded-2xl p-3">

            <p className="font-semibold text-slate-700 truncate">
              {user?.name || 'User'}
            </p>

            <p className="text-sm text-slate-500 truncate">
              {user?.email || 'No Email'}
            </p>
          </div>

          {/* CLEAR CHAT */}
          <button
            onClick={onClearConversation}
            className="
              w-full
              h-11
              rounded-2xl
              text-red-500
              hover:bg-red-50
              flex items-center justify-center gap-2
              transition
            "
          >
            <FiTrash2 />
            Clear Chat
          </button>

        </div>
      </div>
    </>
  );
};

export default Sidebar;