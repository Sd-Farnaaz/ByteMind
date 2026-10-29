import React from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiZap, FiBookOpen, FiCompass } from 'react-icons/fi';
import ByteMindMascot from './ByteMindMascot';

const PROMPT_SUGGESTIONS = [
  {
    icon: FiCode,
    category: 'Coding & Architecture',
    title: 'Explain Async JavaScript',
    prompt: 'Explain asynchronous JavaScript, Promises, and async/await with clean real-world code examples.',
    color: 'from-violet-500 to-indigo-500'
  },
  {
    icon: FiZap,
    category: 'Concept Deep Dive',
    title: 'Quantum Computing 101',
    prompt: 'Explain quantum computing and qubits in simple intuitive terms for software engineers.',
    color: 'from-indigo-500 to-sky-500'
  },
  {
    icon: FiCompass,
    category: 'Creativity & Brainstorming',
    title: '5 Modern AI Startup Ideas',
    prompt: 'Brainstorm 5 innovative, practical SaaS product ideas that leverage modern AI agents.',
    color: 'from-sky-500 to-teal-500'
  },
  {
    icon: FiBookOpen,
    category: 'Productivity & Writing',
    title: 'Polish Professional Email',
    prompt: 'Help me draft a concise, persuasive status update email for executive stakeholders.',
    color: 'from-purple-500 to-pink-500'
  }
];

const WelcomeScreen = ({ userName, onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center">
      {/* Mascot Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-4"
      >
        <ByteMindMascot size="lg" interactive={true} />
      </motion.div>

      {/* Greeting & Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="max-w-xl mx-auto mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/70 border border-violet-200/80 text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
          ByteMind AI 2.0
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
          How can I help you today{userName ? `, ${userName}` : ''}?
        </h2>
        <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
          Ask me anything, debug code, brainstorm ideas, or learn complex topics.
        </p>
      </motion.div>

      {/* Suggestion Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left mb-6"
      >
        {PROMPT_SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex items-start gap-4 text-left group focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0 shadow-md shadow-violet-500/15 group-hover:scale-105 transition-transform duration-200`}>
                <Icon size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  {item.category}
                </span>
                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
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

