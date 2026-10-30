import React, { useState, useRef, useEffect } from 'react';
import {
  FiSend,
  FiMic,
  FiMicOff,
  FiImage,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ChatInput = ({ onSendMessage, disabled, placeholder = 'Ask ByteMind anything...' }) => {
  const [message, setMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isImageMode, setIsImageMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 40), 140)}px`;
    }
  }, [message]);

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setMessage((prev) => `${prev}${prev ? ' ' : ''}${transcript}`);
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      setSpeechSupported(true);
    } catch (e) {
      console.warn('Speech recognition not available:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Handle Clipboard Paste (Ctrl+V) for screenshots
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          toast.success('Screenshot pasted from clipboard!');
          break;
        }
      }
    }
  };

  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please attach an image or screenshot file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
      toast.success('Screenshot attached!');
    }
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = message.trim();
    if ((!trimmed && !attachedImage) || disabled) return;

    onSendMessage(trimmed, { attachedImage, isImageMode });

    setMessage('');
    setAttachedImage(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsRecording(false);
      }
    }
  };

  const handleFocus = () => {
    // When virtual keyboard opens on mobile, ensure input stays in view
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);
  };

  const dynamicPlaceholder = isImageMode
    ? 'Describe the image you want ByteMind to generate (e.g. A futuristic neon city in rain)...'
    : attachedImage
    ? 'Add an optional note with your screenshot, or press Send...'
    : placeholder;

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-input rounded-2xl sm:rounded-3xl p-2 sm:p-3 transition-all duration-200 ${
        isImageMode ? 'ring-2 ring-pink-400/50 border-pink-300/40' : ''
      }`}
    >
      {/* Attached Image Preview Pill */}
      {attachedImage && (
        <div className="relative inline-flex items-center gap-2 mb-2 p-1.5 pl-2 pr-3 bg-violet-100/80 border border-violet-200/90 rounded-2xl shadow-xs">
          <img
            src={attachedImage}
            alt="Attachment preview"
            className="w-10 h-10 object-cover rounded-xl border border-violet-200 bg-white"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-violet-900 flex items-center gap-1">
              <FiImage size={12} className="text-violet-600" />
              Screenshot attached
            </span>
            <span className="text-[10px] text-slate-500">Ready to send with your prompt</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="ml-2 p-1 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
            title="Remove screenshot"
          >
            <FiX size={15} />
          </button>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-end gap-1.5 sm:gap-2">
        {/* Multiline Textarea with Ctrl+V screenshot paste */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          placeholder={dynamicPlaceholder}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-800 placeholder-slate-400 text-xs sm:text-base outline-none min-h-[38px] sm:min-h-[44px] max-h-[140px] leading-relaxed scrollbar-glass"
          aria-label="Type your message"
        />

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pb-0.5 sm:pb-1 pr-0.5 sm:pr-1">
          {/* Attach Screenshot / Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
              attachedImage
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Attach screenshot or image (or paste with Ctrl+V)"
            aria-label="Attach screenshot"
          >
            <FiImage size={15} />
          </button>

          {/* AI Image Generation Toggle */}
          <button
            type="button"
            onClick={() => setIsImageMode(!isImageMode)}
            disabled={disabled}
            className={`h-8 sm:h-10 px-2 sm:px-3 rounded-xl sm:rounded-2xl flex items-center gap-1 sm:gap-1.5 text-xs font-medium transition-all ${
              isImageMode
                ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-pink-500/25 ring-2 ring-pink-400/40'
                : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isImageMode ? 'Switch back to Chat Mode' : 'Switch to Image Generation Mode (/image)'}
          >
            <span className="text-sm">🎨</span>
            <span className="hidden md:inline font-semibold">
              {isImageMode ? 'Image' : 'Image Gen'}
            </span>
          </button>

          {/* Microphone button (visible only if browser supports it) */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={disabled}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
              title={isRecording ? 'Listening...' : 'Voice input'}
            >
              {isRecording ? <FiMicOff size={15} /> : <FiMic size={15} />}
            </button>
          )}

          {/* Submit / Generate Button */}
          <button
            type="submit"
            disabled={(!message.trim() && !attachedImage) || disabled}
            className={`h-8 sm:h-10 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] text-white ${
              isImageMode
                ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 shadow-pink-500/25 hover:from-fuchsia-500 hover:to-rose-500'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 shadow-indigo-500/25'
            }`}
            aria-label={isImageMode ? 'Generate image' : 'Send message'}
          >
            {isImageMode ? (
              <>
                <span>🎨</span>
                <span className="hidden sm:inline">Generate</span>
              </>
            ) : (
              <>
                <FiSend size={14} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard info bar: Only shown on desktop screens */}
      <div className="hidden sm:flex items-center justify-between px-3 pt-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">Enter</kbd> to send</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">Ctrl + V</kbd> to paste screenshot</span>
        </div>
        <span>Use <span className="text-violet-600 font-mono font-medium">/image prompt</span> for instant art</span>
      </div>
    </form>
  );
};

export default ChatInput;
