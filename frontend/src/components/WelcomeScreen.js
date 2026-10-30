import React from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiZap, FiBookOpen, FiCompass } from 'react-icons/fi';
import ByteMindMascot from './ByteMindMascot';

const PROMPT_SUGGESTIONS = [
  {
    icon: FiCode,
    category: 'Coding',
    title: 'Explain Async JavaScript',
    prompt: 'Explain asynchronous JavaScript, Promises, and async/await with clean real-world code examples.',
    color: 'from-violet-500 to-indigo-500'
  },
  {
    icon: FiZap,
    category: 'Concepts',
    title: 'Quantum Computing 101',
    prompt: 'Explain quantum computing and qubits in simple intuitive terms for software engineers.',
    color: 'from-indigo-500 to-sky-500'
  },
  {
    icon: FiCompass,
    category: 'Ideas',
    title: '5 Modern AI Startup Ideas',
    prompt: 'Brainstorm 5 innovative, practical SaaS product ideas that leverage modern AI agents.',
    color: 'from-sky-500 to-teal-500'
  },
  {
    icon: FiBookOpen,
    category: 'Writing',
    title: 'Polish Professional Email',
    prompt: 'Help me draft a concise, persuasive status update email for executive stakeholders.',
    color: 'from-purple-500 to-pink-500'
  }
];

const WelcomeScreen = ({ userName, onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start sm:justify-center px-3 sm:px-4 py-2 sm:py-6 max-w-4xl mx-auto w-full text-center my-auto">
      {/* Mascot Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-2 sm:mb-4 shrink-0"
      >
        <ByteMindMascot size="responsive" interactive={true} />
      </motion.div>

      {/* Greeting & Headline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className="max-w-xl mx-auto mb-3 sm:mb-6 shrink-0"
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100/70 border border-violet-200/80 text-violet-700 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
          ByteMind AI 2.0
        </div>
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
          How can I help you today{userName ? `, ${userName}` : ''}?
        </h2>
        <p className="mt-1.5 text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          Ask me anything, debug code, brainstorm ideas, or learn complex topics.
        </p>
      </motion.div>

      {/* Suggestion Cards Grid - Compact on mobile screens */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3.5 text-left mb-2 sm:mb-4"
      >
        {PROMPT_SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="glass-card glass-card-hover rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center sm:items-start gap-3 sm:gap-4 text-left group focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0 shadow-md shadow-violet-500/15 group-hover:scale-105 transition-transform duration-200`}>
                <Icon size={16} className="sm:hidden" />
                <Icon size={19} className="hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                  {item.category}
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors truncate sm:whitespace-normal">
                  {item.title}
                </h4>
                <p className="hidden sm:block text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
