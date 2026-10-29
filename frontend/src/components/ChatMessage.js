import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { FiCopy, FiCheck, FiRotateCw, FiUser, FiAlertCircle } from 'react-icons/fi';
import ByteMindMascot from './ByteMindMascot';

// Custom Code Block component with Copy Code action
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!inline && (match || codeString.includes('\n'))) {
    return (
      <div className="relative my-3 rounded-2xl overflow-hidden border border-slate-700/40 bg-slate-900 text-slate-100 shadow-md">
        {/* Code Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 text-xs">
          <span className="font-mono text-violet-300 font-semibold uppercase tracking-wider text-[11px]">
            {language || 'code'}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/70 hover:bg-slate-600 text-slate-200 transition-colors text-xs font-medium"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <FiCheck className="text-emerald-400" size={13} />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <FiCopy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
          <pre {...props}>
            <code>{children}</code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <code
      className="px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 font-mono text-xs border border-violet-100 font-medium"
      {...props}
    >
      {children}
    </code>
  );
};

const ChatMessage = ({ message, onRetry, isLast = false }) => {
  const { role, content, text, timestamp, isError } = message;
  const isUser = role === 'user';
  const messageBody = content || text || '';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-3 max-w-[92%] sm:max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <FiUser size={15} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/90 border border-violet-200/80 flex items-center justify-center shadow-sm">
              <ByteMindMascot size="xs" />
            </div>
          )}
        </div>

        {/* Message Bubble + Meta */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`
              relative px-5 py-4 rounded-3xl transition-all duration-200
              ${
                isUser
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-bubble-user'
                  : isError
                  ? 'bg-rose-50/90 border border-rose-200 text-rose-800 rounded-tl-sm shadow-sm'
                  : 'glass-card text-slate-800 rounded-tl-sm shadow-bubble-ai border border-white/80'
              }
            `}
          >
            {isError ? (
              <div className="flex items-start gap-2.5">
                <FiAlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-rose-700 mb-1">Response generation failed</p>
                  <p className="text-rose-600/90">{messageBody}</p>
                </div>
              </div>
            ) : isUser ? (
              <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                {messageBody}
              </p>
            ) : (
              <div className="markdown-content text-sm sm:text-[15px] text-slate-800 leading-relaxed">
                <ReactMarkdown
                  components={{
                    code: CodeBlock,
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-violet-700 underline underline-offset-2 font-medium"
                      />
                    )
                  }}
                >
                  {messageBody}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action Footer (Timestamp, Copy, Retry) */}
          <div className="flex items-center gap-2 mt-1.5 px-1.5 text-xs text-slate-400">
            {timestamp && (
              <span>
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
              </span>
            )}

            {!isUser && !isError && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
                  title="Copy full response"
                >
                  {copied ? (
                    <>
                      <FiCheck className="text-emerald-500" size={12} />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* Retry button on error or last message */}
            {!isUser && onRetry && (isError || isLast) && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium transition-colors"
                  title="Retry generation"
                >
                  <FiRotateCw size={12} />
                  <span>Retry</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
