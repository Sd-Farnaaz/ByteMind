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
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onClearConversation,
  onRenameConversation
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative
          top-0 left-0 z-50
          h-screen
          w-[280px]
          bg-white
          border-r border-slate-200
          flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            Conversations
          </h2>

          <button
            onClick={onClose}
            className="md:hidden"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            <FiPlus />
            New Conversation
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">

          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`
                rounded-2xl border p-3 transition cursor-pointer
                ${
                  currentConversationId === conv._id
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <div
                onClick={() => {
                  onSelectConversation(conv);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FiMessageSquare className="text-indigo-500" />

                  <p className="font-semibold text-slate-700 truncate">
                    {conv.title || 'New Chat'}
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">

                <button
                  onClick={() =>
                    onRenameConversation(conv)
                  }
                  className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm flex items-center justify-center gap-1"
                >
                  <FiEdit2 size={14} />
                  Rename
                </button>

                <button
                  onClick={() =>
                    onDeleteConversation(conv._id)
                  }
                  className="flex-1 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-sm flex items-center justify-center gap-1"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClearConversation}
            className="w-full h-11 rounded-2xl text-red-500 hover:bg-red-50 flex items-center justify-center gap-2"
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