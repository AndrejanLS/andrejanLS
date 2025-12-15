import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Wrench, Menu, Sparkles, Image as ImageIcon, X, Camera } from 'lucide-react';
import { Message, Role } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, image?: { data: string; mimeType: string }) => void;
  onMobileMenuToggle: () => void;
  hasFiles: boolean;
  userRole: 'admin' | 'tech' | null;
  isSidebarOpen: boolean;
}

const QUICK_SUGGESTIONS = [
  "Porta de cabine não fecha",
  "Elevador desnivelado no andar",
  "Ruído na casa de máquinas",
  "Segurança geral aberta",
  "Falha de inversor de frequência"
];

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
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, selectedImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputText.trim() || selectedImage) && !isLoading) {
      onSendMessage(
        inputText, 
        selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined
      );
      setInputText('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Split data URL to get base64
        const [meta, data] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        
        setSelectedImage({
          data,
          mimeType,
          preview: result
        });
      };
      
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
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
          <div className="flex flex-col items-center justify-center min-h-full text-center pb-10">
             <img 
               src="logo.png" 
               alt="Zé do Elevador" 
               className="w-64 h-auto object-contain mb-6 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 const icon = document.createElement('div');
                 icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench mb-4 opacity-50"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
                 e.currentTarget.parentElement?.insertBefore(icon.firstChild!, e.currentTarget);
               }}
             />
            
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Pronto para Diagnosticar</h2>
            
            {!hasFiles ? (
               <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg max-w-md mt-4">
                 <p className="text-red-300 font-medium mb-1">Atenção: Base de Dados Vazia</p>
                 <p className="text-xs text-red-200/70">
                   Não há manuais técnicos carregados no sistema. As respostas da IA serão limitadas ou indisponíveis. Contate o administrador.
                 </p>
               </div>
            ) : (
              <>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-8">
                   Olá! Eu sou o <strong>Zé do Elevador</strong>. Tire uma foto do código de erro ou selecione uma falha comum abaixo.
                </p>
                
                <div className="w-full max-w-lg">
                  <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    Sugestões Rápidas
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => onSendMessage(suggestion)}
                        disabled={isLoading}
                        className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-4 py-2.5 rounded-full border border-slate-700 hover:border-orange-500/50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
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
                          ? "Analisando a falha com base nos manuais e imagens..."
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
      <div className="p-4 bg-slate-900 border-t border-slate-800 relative">
        {/* Image Preview Overlay */}
        {selectedImage && (
          <div className="absolute bottom-full left-4 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-300 z-20">
            <div className="relative group">
              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-orange-500 shadow-lg bg-black">
                <img src={selectedImage.preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                title="Remover imagem"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex gap-2 items-end">
          
          {/* File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !hasFiles}
            className={`p-3 rounded-xl border border-slate-700 transition-all ${
              selectedImage 
                ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
            title="Anexar foto do problema"
          >
            {selectedImage ? <ImageIcon className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasFiles ? "Descreva o problema ou envie uma foto..." : "Sistema sem manuais."}
              className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"
              disabled={isLoading || !hasFiles}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isLoading || !hasFiles}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-700 transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-slate-600 mt-2">
          As respostas são baseadas estritamente nos manuais do banco de dados.
        </p>
      </div>
    </div>
  );
};