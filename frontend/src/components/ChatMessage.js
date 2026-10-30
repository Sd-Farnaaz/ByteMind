import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';
import { formatDistanceToNow } from 'date-fns';
import {
  FiCopy,
  FiCheck,
  FiRotateCw,
  FiUser,
  FiAlertCircle,
  FiCamera,
  FiDownload,
  FiMaximize2,
  FiX,
  FiImage
} from 'react-icons/fi';
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

// Normalize markdown tables if linebreaks were omitted between rows or delimiters
const normalizeMarkdown = (content) => {
  if (!content || typeof content !== 'string') return '';
  // Ensure newlines around markdown table delimiter rows (|---|---|)
  let formatted = content.replace(/(\|[^\n]+\|)\s*(\|(?:\s*[-:]+[-| :]*)\|)/g, '$1\n$2');
  formatted = formatted.replace(/(\|(?:\s*[-:]+[-| :]*)\|)\s*(\|[^\n]+\|)/g, '$1\n$2');
  return formatted;
};

const ChatMessage = ({ message, onRetry, isLast = false }) => {
  const { role, content, text, timestamp, isError, type, imageUrl, attachedImage } = message;
  const isUser = role === 'user';
  const isImageMsg = type === 'image' || Boolean(imageUrl);
  const messageBody = content || text || '';

  const [copied, setCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const bubbleRef = useRef(null);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleDownloadScreenshot = async () => {
    if (!bubbleRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(bubbleRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `bytemind-${isUser ? 'user' : 'ai'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export message screenshot:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `bytemind-ai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: direct window open if CORS restricts direct blob fetch
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start gap-3 max-w-[94%] sm:max-w-[85%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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

          {/* Message Bubble + Actions */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div
              ref={bubbleRef}
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
              {/* User Attached Screenshot Thumbnail */}
              {isUser && attachedImage && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-white/30 shadow-inner max-w-sm">
                  <img
                    src={attachedImage}
                    alt="User attached screenshot"
                    className="w-full max-h-60 object-contain bg-black/10 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setLightboxUrl(attachedImage)}
                  />
                  <div className="px-2 py-1 bg-black/20 text-[11px] text-white/80 flex items-center gap-1.5">
                    <FiImage size={12} />
                    <span>Attached screenshot</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {isError ? (
                <div className="flex items-start gap-2.5">
                  <FiAlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <div className="text-sm leading-relaxed">
                    <p className="font-semibold text-rose-700 mb-1">Response generation failed</p>
                    <p className="text-rose-600/90">{messageBody}</p>
                  </div>
                </div>
              ) : isImageMsg ? (
                /* AI Generated Image Card */
                <div className="flex flex-col gap-2.5 max-w-md">
                  <div className="flex items-center justify-between text-xs font-medium text-violet-700 pb-1 border-b border-violet-100/70">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm">🎨</span> AI Generated Image
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(imageUrl)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-100/80 hover:bg-violet-200 text-violet-800 transition-colors font-semibold"
                    >
                      <FiDownload size={13} />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-violet-200/60 shadow-md bg-slate-900 group">
                    {!imageLoaded && (
                      <div className="w-full h-64 flex flex-col items-center justify-center bg-violet-50/50 text-violet-600 animate-pulse gap-2">
                        <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Generating high-res visual...</span>
                      </div>
                    )}
                    <img
                      src={imageUrl}
                      alt={messageBody}
                      className={`w-full max-h-96 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02] ${imageLoaded ? 'block' : 'hidden'}`}
                      onLoad={() => setImageLoaded(true)}
                      onClick={() => setLightboxUrl(imageUrl)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
                      <span className="text-xs text-white/90 truncate mr-2 font-medium">
                        Click to expand
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxUrl(imageUrl);
                        }}
                        className="pointer-events-auto p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-colors"
                        title="View full size"
                      >
                        <FiMaximize2 size={14} />
                      </button>
                    </div>
                  </div>

                  {messageBody && (
                    <p className="text-xs text-slate-600 italic px-1">
                      {messageBody}
                    </p>
                  )}
                </div>
              ) : isUser ? (
                /* Regular User Text Message */
                <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                  {messageBody}
                </p>
              ) : (
                /* Assistant Markdown with GFM Tables */
                <div className="markdown-content text-sm sm:text-[15px] text-slate-800 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                      table: ({ node, ...props }) => (
                        <div className="my-4 overflow-x-auto rounded-2xl border border-violet-200/80 bg-white/80 backdrop-blur-md shadow-sm">
                          <table className="w-full text-left border-collapse text-xs sm:text-sm" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-gradient-to-r from-violet-100/90 via-indigo-100/80 to-violet-100/90 text-violet-950 font-semibold border-b border-violet-200/90" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="px-4 py-3 font-semibold text-slate-800 text-xs sm:text-sm uppercase tracking-wider" {...props} />
                      ),
                      tbody: ({ node, ...props }) => (
                        <tbody className="divide-y divide-violet-100/70 text-slate-700 bg-white/40" {...props} />
                      ),
                      tr: ({ node, ...props }) => (
                        <tr className="hover:bg-violet-50/60 transition-colors" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="px-4 py-2.5 text-xs sm:text-sm leading-relaxed" {...props} />
                      ),
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
                    {normalizeMarkdown(messageBody)}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Action Footer (Timestamp, Screenshot, Copy, Retry) */}
            <div className="flex items-center gap-2 mt-1.5 px-1.5 text-xs text-slate-400">
              {timestamp && (
                <span>
                  {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                </span>
              )}

              {/* Message Screenshot Button */}
              {!isError && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleDownloadScreenshot}
                    disabled={isCapturing}
                    className="inline-flex items-center gap-1 hover:text-violet-600 transition-colors"
                    title="Export message as screenshot"
                  >
                    <FiCamera size={12} className={isCapturing ? 'animate-pulse text-violet-600' : ''} />
                    <span>{isCapturing ? 'Exporting...' : 'Screenshot'}</span>
                  </button>
                </>
              )}

              {!isUser && !isError && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
                    title="Copy response text"
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

      {/* Lightbox Modal for Full-Size Image Preview */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700/60 text-white">
              <span className="text-sm font-semibold flex items-center gap-2">
                <FiImage className="text-violet-400" />
                Image Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadImage(lightboxUrl)}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FiDownload size={13} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxUrl(null)}
                  className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-600 text-slate-300 transition-colors"
                  title="Close preview"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Modal Image */}
            <div className="p-2 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={lightboxUrl}
                alt="Full size view"
                className="max-h-[78vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessage;
