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
  FiSearch,
  FiSettings,
  FiAlertTriangle,
  FiCpu
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ByteMindMascot from './ByteMindMascot';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
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
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = (e) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    return (c.title || 'New Chat')
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
  });

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

    filteredConversations.forEach((conv) => {
      const convDate = conv.updatedAt
        ? new Date(conv.updatedAt)
        : new Date(conv.createdAt || Date.now());
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
      <div className="space-y-1 mb-5">
        <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          {title} ({items.length})
        </h3>
        {items.map((conv) => {
          const isActive = currentConversationId === conv.conversationId;
          const isEditing = editingId === conv.conversationId;

          return (
            <div
              key={conv.conversationId || conv._id}
              className={`group relative flex items-center justify-between rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-violet-100/90 to-indigo-100/70 text-violet-900 font-semibold border border-violet-200/90 shadow-sm'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 border border-transparent'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-2 p-2 w-full border border-violet-400 bg-white rounded-2xl z-10 shadow-sm">
                  <FiMessageSquare className="text-violet-600 shrink-0" size={15} />
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(conv.conversationId);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 bg-transparent text-slate-800 outline-none text-xs sm:text-sm font-medium w-full"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => saveEdit(conv.conversationId, e)}
                    className="text-emerald-600 hover:text-emerald-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Save"
                  >
                    <FiCheck size={14} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Cancel"
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
                    className="flex items-center gap-2.5 py-2.5 px-3 flex-1 overflow-hidden"
                  >
                    <FiMessageSquare
                      className={`shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-violet-500'} transition-colors`}
                      size={15}
                    />
                    <span className="truncate text-xs sm:text-sm">{conv.title || 'New Chat'}</span>
                  </div>

                  {/* Hover Actions */}
                  <div
                    className={`absolute right-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gradient-to-l ${
                      isActive ? 'from-violet-100 via-violet-100' : 'from-white via-white'
                    } to-transparent pl-3 pr-1 h-full rounded-r-2xl transition-opacity duration-150`}
                  >
                    <button
                      onClick={(e) => startEditing(conv, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
                      title="Rename"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(conv.conversationId);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete"
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
          className="fixed inset-0 bg-slate-900/30 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
        />
      )}

      {/* SIDEBAR MAIN CONTAINER */}
      <aside
        className={`
          fixed md:relative
          top-0 left-0
          z-50
          h-screen
          glass-panel
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isCollapsed ? 'md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0' : 'w-[290px] sm:w-[310px]'}
        `}
      >
        {/* HEADER BRANDING */}
        <div className="h-16 px-4 border-b border-white/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <ByteMindMascot size="xs" />
            </div>
            <div>
              <h2 className="text-base font-bold bg-gradient-to-r from-violet-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                ByteMind AI
              </h2>
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex w-8 h-8 rounded-xl hover:bg-white/80 text-slate-500 hover:text-slate-800 items-center justify-center transition-colors"
              title="Collapse sidebar"
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Mobile Close Drawer Button */}
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-xl hover:bg-white/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              title="Close drawer"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* NEW CHAT ACTION */}
        <div className="p-3.5 pb-2 shrink-0">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <FiPlus size={17} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* SEARCH CONVERSATIONS */}
        <div className="px-3.5 py-1.5 shrink-0">
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full h-9 pl-8 pr-7 rounded-xl bg-white/70 border border-white/80 text-xs sm:text-sm text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-violet-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <FiX size={13} />
              </button>
            )}
          </div>
        </div>

        {/* CONVERSATION LIST */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 scrollbar-glass">
          {conversations.length === 0 ? (
            <div className="text-center text-slate-400 mt-12 py-6 px-4 glass-card rounded-2xl border border-white/80">
              <FiMessageSquare className="mx-auto text-violet-300 mb-2.5" size={24} />
              <p className="text-xs sm:text-sm font-semibold text-slate-600">No chats yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Start a conversation above</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center text-slate-400 mt-8 py-4 px-2">
              <p className="text-xs text-slate-500">No chats match "{searchQuery}"</p>
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

        {/* USER PROFILE & POPUP MENU */}
        <div className="p-3 border-t border-white/60 shrink-0 relative bg-white/40">
          <div ref={menuRef} className="w-full">
            {/* POPUP MENU */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute bottom-16 left-3 right-3 glass-card rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 border border-white/90"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowSettingsModal(true);
                    }}
                    className="w-full h-9 rounded-xl text-slate-700 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-2.5 px-3 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <FiSettings size={15} />
                    <span>System Settings & Info</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmClearOpen(true);
                    }}
                    className="w-full h-9 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 px-3 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <FiTrash2 size={15} />
                    <span>Clear Active Chat</span>
                  </button>

                  <div className="h-[1px] bg-slate-200/80 my-0.5" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onClose();
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    }}
                    className="w-full h-9 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-2.5 px-3 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <FiLogOut size={15} />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PROFILE CARD */}
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/80 cursor-pointer transition-all border border-transparent hover:border-white/80"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-indigo-500/20">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate leading-4">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate leading-3 mt-0.5">
                    {user?.email || 'Authenticated'}
                  </p>
                </div>
              </div>
              <FiMoreHorizontal className="text-slate-400 shrink-0" size={17} />
            </div>
          </div>
        </div>
      </aside>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl p-6 max-w-sm w-full border border-white/90 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <FiTrash2 size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Delete Conversation?</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                This will permanently delete this conversation and its message history. This action cannot be undone.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteConversation(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-md shadow-rose-600/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM CLEAR ACTIVE CONVERSATION MODAL */}
      <AnimatePresence>
        {confirmClearOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl p-6 max-w-sm w-full border border-white/90 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <FiAlertTriangle size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Clear Active Chat?</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Are you sure you want to clear all messages in this conversation?
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setConfirmClearOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearConversation();
                    setConfirmClearOpen(false);
                  }}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-md shadow-amber-600/20 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl p-6 max-w-md w-full border border-white/90 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                    <FiCpu size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">System Information</h3>
                    <p className="text-xs text-slate-400">ByteMind AI Platform Status</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Current User</span>
                  <span className="font-semibold text-slate-800">{user?.name} ({user?.email})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Configured Model</span>
                  <span className="font-mono font-medium text-violet-700">Groq Cloud AI (High Speed)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">AI Provider</span>
                  <span className="font-semibold text-slate-800">Groq Cloud (via Server SDK)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Database Engine</span>
                  <span className="font-semibold text-slate-800">MongoDB Atlas</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">UI Architecture</span>
                  <span className="font-semibold text-emerald-600">Glassmorphism 2.0</span>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full mt-6 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-500/20"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
