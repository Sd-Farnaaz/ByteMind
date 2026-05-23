import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiMessageSquare
} from 'react-icons/fi';

const Sidebar = ({
  isOpen,
  onClose,
  onNewChat,
  onClearChat,
  conversationId
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -320
        }}
        transition={{
          type: 'tween',
          duration: 0.3
        }}
        className="
          fixed md:relative
          left-0 top-0
          h-screen
          w-[85%] sm:w-72 md:w-80
          bg-white
          border-r border-gray-200
          shadow-xl md:shadow-none
          z-50
          flex flex-col
          md:translate-x-0
        "
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Conversations
          </h2>

          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="
              w-full
              flex items-center justify-center gap-2
              px-4 py-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-medium
              transition
            "
          >
            <FiPlus size={18} />
            New Conversation
          </button>
        </div>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3">
            <FiMessageSquare className="text-blue-600" />

            <div className="overflow-hidden">
              <p className="font-medium text-gray-800 truncate">
                Current Chat
              </p>

              <p className="text-xs text-gray-500 truncate">
                {conversationId}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClearChat}
            className="
              w-full
              flex items-center justify-center gap-2
              px-4 py-3
              rounded-xl
              text-red-600
              hover:bg-red-50
              transition
            "
          >
            <FiTrash2 size={18} />
            Clear Chat
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;