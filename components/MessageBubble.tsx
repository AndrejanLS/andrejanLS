import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, AlertTriangle } from 'lucide-react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
          isUser 
            ? 'bg-slate-700 border-slate-600' 
            : message.isError 
              ? 'bg-red-900/20 border-red-800'
              : 'bg-orange-600 border-orange-500'
        }`}>
          {isUser ? (
            <User className="w-6 h-6 text-slate-300" />
          ) : message.isError ? (
            <AlertTriangle className="w-6 h-6 text-red-500" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Content */}
        <div className={`rounded-xl px-5 py-4 shadow-sm text-sm leading-relaxed overflow-hidden flex flex-col gap-2 ${
          isUser 
            ? 'bg-slate-700 text-slate-100 rounded-tr-none' 
            : message.isError
              ? 'bg-red-950/30 border border-red-900/50 text-red-200 rounded-tl-none'
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
        }`}>
          
          {/* Render Image Attachment if exists */}
          {message.image && (
            <div className="mb-2 rounded-lg overflow-hidden border border-slate-600/50 bg-black/20">
              <img 
                src={`data:${message.imageMimeType || 'image/jpeg'};base64,${message.image}`} 
                alt="Anexo do técnico" 
                className="max-w-full h-auto max-h-64 object-contain mx-auto"
              />
            </div>
          )}

          {isUser ? (
             <div className="whitespace-pre-wrap">{message.text}</div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-orange-400 prose-headings:font-semibold prose-strong:text-orange-300 prose-ul:marker:text-slate-500">
               <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
          <div className={`text-[10px] mt-1 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};