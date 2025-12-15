import React, { useState } from 'react';
import { X, Send, Lightbulb, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface SuggestionsModalProps {
  onClose: () => void;
}

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ onClose }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSending(true);

    try {
      // Usando FormSubmit com AJAX para não redirecionar a página
      const response = await fetch("https://formsubmit.co/ajax/tec.andrejan@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: "Nova Sugestão - App Zé do Elevador",
          _template: "table", // Formato mais limpo
          mensagem: suggestion,
          data: new Date().toLocaleString('pt-BR')
        })
      });

      if (response.ok) {
        setStatus('success');
        setSuggestion('');
        // Fecha automaticamente após 3 segundos
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Caixa de Sugestões
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Sugestão Enviada!</h4>
              <p className="text-slate-400 text-sm">
                Obrigado por contribuir com o Zé do Elevador. Sua opinião é muito importante para nós.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Como podemos melhorar o app para você?
                </label>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Descreva sua ideia, relate um problema ou sugira uma nova funcionalidade..."
                  className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none resize-none transition-all"
                  disabled={isSending}
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Houve um erro ao enviar. Tente novamente mais tarde.</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
                  disabled={isSending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!suggestion.trim() || isSending}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg text-sm font-medium shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Sugestão
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};