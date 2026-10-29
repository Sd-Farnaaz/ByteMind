import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi';

const ChatInput = ({ onSendMessage, disabled, placeholder = 'Ask ByteMind anything...' }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 160)}px`;
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setMessage('');

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

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-input rounded-3xl p-2 sm:p-3 transition-all duration-200"
    >
      <div className="flex items-end gap-2">
        {/* Multiline Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-slate-800 placeholder-slate-400 text-sm sm:text-base outline-none min-h-[44px] max-h-[160px] leading-relaxed scrollbar-glass"
          aria-label="Type your message"
        />

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 pb-1 pr-1">
          {/* Microphone button (visible only if browser supports it) */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={disabled}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
              title={isRecording ? 'Listening...' : 'Voice input'}
            >
              {isRecording ? <FiMicOff size={17} /> : <FiMic size={17} />}
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-10 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-medium text-sm flex items-center gap-2 shadow-md shadow-indigo-500/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Send message"
          >
            <FiSend size={15} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pt-1 text-[11px] text-slate-400">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">Enter</kbd> to send</span>
        <span><kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">Shift + Enter</kbd> for newline</span>
      </div>
    </form>
  );
};

export default ChatInput;
