import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

const ChatMessage = ({ message }) => {
  const { text, isUser, timestamp } = message;

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isUser 
            ? 'bg-primary-600 text-white rounded-tr-none' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
        }`}>
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
            <ReactMarkdown>
              {text}
            </ReactMarkdown>
          </div>
        </div>
        {timestamp && (
          <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </div>
        )}
      </div>
      <div className={`flex-shrink-0 ${isUser ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary-700' 
            : 'bg-gradient-to-br from-primary-500 to-primary-700'
        }`}>
          {isUser ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;