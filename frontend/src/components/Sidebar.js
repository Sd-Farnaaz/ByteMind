import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiX, FiMessageSquare } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose, onNewChat, onClearChat, conversationId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 md:relative md:translate-x-0 md:shadow-none flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg md:hidden"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={onNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200"
              >
                <FiPlus size={18} />
                New Conversation
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center gap-2">
                    <FiMessageSquare className="text-primary-600" size={16} />
                    <span className="text-sm font-medium text-gray-800">Current Chat</span>
                  </div>
                  <span className="text-xs text-gray-500">{conversationId}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onClearChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <FiTrash2 size={18} />
                Clear Current Chat
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;