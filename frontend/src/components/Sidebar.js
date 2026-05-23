import React, { useState, useEffect, useRef } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiMessageSquare,
  FiCheck,
  FiMoreHorizontal,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSettings
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
  user,
  isCollapsed,
  onToggleCollapse
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startEditing = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.conversationId);
    setEditTitle(conv.title || 'New Chat');
  };

  const saveEdit = (conversationId, e) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
  };

  // Group conversations by date
  const groupConversations = () => {
    const groups = {
      today: [],
      yesterday: [],
      last7Days: [],
      older: []
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    conversations.forEach((conv) => {
      const convDate = conv.updatedAt ? new Date(conv.updatedAt) : new Date(conv.createdAt || Date.now());
      if (convDate >= startOfToday) {
        groups.today.push(conv);
      } else if (convDate >= startOfYesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= startOf7DaysAgo) {
        groups.last7Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const groups = groupConversations();

  const renderCategory = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1 mb-6">
        <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          {title}
        </h3>
        {items.map((conv) => {
          const isActive = currentConversationId === conv.conversationId;
          const isEditing = editingId === conv.conversationId;
          return (
            <div
              key={conv.conversationId || conv._id}
              className={`group relative flex items-center justify-between rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-100 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-2 p-2 w-full border border-indigo-400 bg-white rounded-xl z-10">
                  <FiMessageSquare className="text-indigo-500 shrink-0" size={16} />
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(conv.conversationId);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 bg-transparent text-slate-800 outline-none text-sm font-medium w-full"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => saveEdit(conv.conversationId, e)}
                    className="text-emerald-600 hover:text-emerald-700 p-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    <FiCheck size={14} />
                  </button>
                  <button
                    onClick={(e) => cancelEdit(e)}
                    className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => {
                      onSelectConversation(conv);
                      onClose();
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 flex-1 overflow-hidden"
                  >
                    <FiMessageSquare className={`shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} size={16} />
                    <span className="truncate text-sm">{conv.title || 'New Chat'}</span>
                  </div>

                  {/* Actions on hover */}
                  <div className={`absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gradient-to-l ${isActive ? 'from-indigo-50 via-indigo-50' : 'from-slate-50 via-slate-50'} to-transparent pl-4 pr-1 h-full rounded-r-xl transition-opacity duration-200`}>
                    <button
                      onClick={(e) => startEditing(conv, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/50 transition-colors"
                      title="Rename Chat"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this conversation? This cannot be undone.')) {
                          onDeleteConversation(conv.conversationId);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200/50 transition-colors"
                      title="Delete Chat"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div
        className={`
          fixed md:relative
          top-0 left-0
          z-50
          h-screen
          bg-slate-50/95
          border-r border-slate-200
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isCollapsed ? 'md:w-0 md:opacity-0 md:pointer-events-none' : 'w-[300px] md:w-[300px]'}
        `}
      >
        {/* HEADER */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-sm">BM</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-wide">
              ByteMind AI
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {/* Collapse button for desktop */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 items-center justify-center transition-colors"
              title="Collapse Sidebar"
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* NEW CHAT */}
        <div className="p-4 shrink-0">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="
              w-full
              h-11
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              font-semibold
              text-sm
              flex items-center justify-center gap-2
              transition-all duration-200
              shadow-sm shadow-indigo-500/10 hover:shadow-indigo-500/20
            "
          >
            <FiPlus size={16} />
            New Conversation
          </button>
        </div>

        {/* CONVERSATION LIST */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="text-center text-slate-400 mt-10 py-6 px-4 bg-white rounded-2xl border border-slate-200 mx-1">
              <FiMessageSquare className="mx-auto text-slate-300 mb-3" size={24} />
              <p className="text-sm font-medium text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <>
              {renderCategory('Today', groups.today)}
              {renderCategory('Yesterday', groups.yesterday)}
              {renderCategory('Previous 7 Days', groups.last7Days)}
              {renderCategory('Older', groups.older)}
            </>
          )}
        </div>

        {/* FOOTER & PROFILE MENU */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0 relative">
          <div ref={menuRef} className="w-full">
            {/* POPUP MENU */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute bottom-20 left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                >
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all conversations? This cannot be undone.')) {
                        onClearConversation();
                        setMenuOpen(false);
                      }
                    }}
                    className="w-full h-10 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-3 px-3 transition-colors text-sm font-medium"
                  >
                    <FiTrash2 size={16} />
                    Clear conversations
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      alert("Settings functionality is simulated. You can view or change profile details here.");
                    }}
                    className="w-full h-10 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-3 px-3 transition-colors text-sm font-medium"
                  >
                    <FiSettings size={16} />
                    Settings
                  </button>

                  <div className="h-[1px] bg-slate-200 my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onClose();
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    }}
                    className="w-full h-10 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-3 px-3 transition-colors text-sm font-medium"
                  >
                    <FiLogOut size={16} />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PROFILE CARD */}
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-slate-700 truncate leading-5">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate leading-4">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>
              <FiMoreHorizontal className="text-slate-400 shrink-0" size={18} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;