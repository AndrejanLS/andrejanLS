import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Wrench, Menu } from 'lucide-react';
import { Message, Role } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onMobileMenuToggle: () => void;
  hasFiles: boolean;
  userRole: 'admin' | 'tech' | null;
  isSidebarOpen: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage,
  onMobileMenuToggle,
  hasFiles,
  userRole,
  isSidebarOpen
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMobileMenuToggle} 
            className={`text-slate-400 hover:text-white transition-colors ${isSidebarOpen ? 'md:hidden' : ''}`}
            title={isSidebarOpen ? "Fechar menu" : "Abrir menu lateral"}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20 shrink-0">
             <img 
               src="logo.png" 
               alt="Logo" 
               className="h-8 w-auto object-contain"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement?.classList.remove('bg-orange-500/10', 'border-orange-500/20', 'border');
                 // Show fallback icon if image fails
                 const icon = document.createElement('div');
                 icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
                 e.currentTarget.parentElement?.appendChild(icon.firstChild!);
               }} 
             />
          </div>

          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white tracking-tight truncate">Diagnóstico Técnico</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
              Conectado à Base de Conhecimento
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
            {/* Using logo here as well instead of just Wrench */}
             <img 
               src="logo.png" 
               alt="Zé do Elevador" 
               className="h-20 w-auto object-contain mb-4 drop-shadow-lg"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 // Fallback to Wrench is handled by rendering logic below if needed, but here we just hide
                 // and maybe show the Wrench manually if we were using state, but simple JS fallback:
                 const icon = document.createElement('div');
                 icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench mb-4"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
                 e.currentTarget.parentElement?.insertBefore(icon.firstChild!, e.currentTarget);
               }}
             />
            
            <h2 className="text-xl font-semibold text-slate-300 mb-2">Pronto para Diagnosticar</h2>
            
            {!hasFiles ? (
               <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg max-w-md mt-4">
                 <p className="text-red-300 font-medium mb-1">Atenção: Base de Dados Vazia</p>
                 <p className="text-xs text-red-200/70">
                   Não há manuais técnicos carregados no sistema. As respostas da IA serão limitadas ou indisponíveis. Contate o administrador.
                 </p>
               </div>
            ) : (
              <p className="text-sm text-slate-500 max-w-md">
                Informe o código de erro ou sintoma. O sistema consultará automaticamente os manuais técnicos disponíveis na base de dados.
              </p>
            )}

            <div className="mt-8 grid gap-2 text-xs text-slate-500 text-left bg-slate-900/50 p-4 rounded border border-slate-800 w-full max-w-md">
              <span className="font-semibold text-slate-400 mb-1">Exemplo de comando:</span>
              <code className="block bg-slate-950 p-2 rounded text-orange-400">
                "Elevador Atlas Schindler, falha 1538, equipamento parado."
              </code>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6">
                 <div className="flex max-w-[75%] gap-3 flex-row">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-slate-800 border border-slate-700">
                      <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl rounded-tl-none px-5 py-4 shadow-sm flex items-center">
                      <span className="text-sm text-slate-400">
                        {userRole === 'tech' 
                          ? "Estou perguntando ao técnico sênior, já vamos colocar esse elevador para rodar!"
                          : "Consultando manuais técnicos na base de dados..."}
                      </span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasFiles ? "Digite o código da falha, marca e modelo..." : "Sistema sem manuais. Contate o admin."}
            className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 border border-slate-700 rounded-xl py-4 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !hasFiles}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || !hasFiles}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-700 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-600 mt-2">
          As respostas são baseadas estritamente nos manuais do banco de dados.
        </p>
      </div>
    </div>
  );
};