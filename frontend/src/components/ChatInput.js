import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic } from 'react-icons/fi';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [message]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => `${prev}${prev ? ' ' : ''}${transcript}`);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      return;
    }

    setIsRecording(true);
    recognitionRef.current.start();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[30px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_45px_-22px_rgba(15,23,42,0.18)] transition-all duration-200">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Send a message</div>
            <div className="text-xs text-slate-500">Type your prompt and press Send.</div>
          </div>
          <div className="text-xs text-slate-500">Shift + Enter for a new line</div>
        </div>

        <div className="relative flex items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or tell me what you need help with..."
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none rounded-[26px] border border-slate-300 bg-slate-50 px-5 py-4 pr-36 text-slate-900 placeholder-slate-400 outline-none transition duration-200 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/15"
            style={{ minHeight: '64px', maxHeight: '180px' }}
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={!speechSupported}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={isRecording ? 'Stop voice input' : 'Voice input'}
            >
              <FiMic size={18} className={isRecording ? 'text-primary-600' : ''} />
            </button>
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary-700 px-5 text-sm font-semibold text-white shadow-xl shadow-primary-600/20 transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send message"
            >
              <FiSend size={18} />
              <span>Send</span>
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap text-sm text-slate-600">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 font-medium transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setMessage('What is the best way to learn React?')}
          >
            Best way to learn React
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 font-medium transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setMessage('Can you explain asynchronous JavaScript?')}
          >
            Asynchronous JavaScript
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 font-medium transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setMessage('Give me a quick coding tip.')}
          >
            Quick coding tip
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;