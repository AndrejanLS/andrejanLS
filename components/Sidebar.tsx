import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Database, LogOut, Info, X, Loader2 } from 'lucide-react';
import { UploadedFile } from '../types';

interface SidebarProps {
  files: UploadedFile[];
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
  readOnly: boolean;
  userRole: string;
  onLogout: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  progress?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  onAddFiles, 
  onRemoveFile, 
  readOnly, 
  userRole,
  onLogout,
  onClose,
  isProcessing = false,
  progress = 0
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isProcessing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Calculate storage usage
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB Safe Limit
  const currentTotalSize = files.reduce((acc, f) => acc + f.size, 0);
  const usagePercentage = Math.min((currentTotalSize / MAX_TOTAL_SIZE) * 100, 100);
  const isNearLimit = usagePercentage > 90;

  // Renderização Personalizada para o Técnico (Texto Zé do Elevador)
  if (readOnly) {
    return (
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-full shrink-0">
         
         <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" />
              Sobre Nós
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-md transition-colors"
              title="Fechar aba lateral"
            >
              <X className="w-5 h-5" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {/* Logo added here */}
            <div className="mb-6 flex justify-center">
              <img 
                src="logo.png" 
                alt="Zé do Elevador" 
                className="max-w-full h-auto max-h-24 object-contain drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <h3 className="text-orange-400 font-bold text-sm leading-relaxed mb-4">
              Zé do Elevador: Sua Solução Inteligente no Mercado de Elevadores!
            </h3>
            
            <div className="text-xs text-slate-400 space-y-4 leading-relaxed text-justify">
               <p>
                 Com quase 20 anos atuando no setor de elevadores, o <strong>Zé do Elevador</strong> surge como o parceiro ideal para transformar a forma como você lida com os reparos de elevadores. Sabemos que, para as empresas, a contratação esporádica de técnicos pode ser uma tarefa cara e desafiadora, causando perdas financeiras significativas e chamadas repetidas devido à não resolução de problemas.
               </p>
               <p>
                 É por isso que estamos aqui! A <strong>Zé do Elevador</strong> foi criada para fornecer soluções rápidas e eficazes, garantindo que seu elevador esteja sempre em funcionamento. Nossa plataforma conecta você a técnicos especializados que entendem suas necessidades e oferecem uma solução completa — tudo isso com um preço acessível.
               </p>
               <p>
                 Com o Zé do Elevador, você reduz os custos com manutenção, aumenta a eficiência do seu negócio e minimiza o tempo de inatividade. Não deixe que problemas de elevador afetem sua operação e a satisfação de seus clientes.
               </p>
               <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 mt-2">
                 <p className="text-slate-300 font-medium italic">
                   "Junte-se à revolução que está mudando o setor! Com o Zé do Elevador, você tem um aliado confiável para cuidar da manutenção e reparos dos seus elevadores."
                 </p>
               </div>
            </div>
         </div>
         
         {/* Área de Logout */}
         <div className="p-4 border-t border-slate-700 bg-slate-900">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-3 transition-colors text-xs uppercase tracking-wider font-medium hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              Sair / Trocar Usuário
            </button>
         </div>
      </div>
    );
  }

  // Renderização Completa para Admin
  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-orange-500" />
          Base de Dados
        </h2>
        <button 
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="px-4 mt-3">
         <div className="flex items-center justify-between bg-slate-800 rounded-lg p-2 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300 capitalize">{userRole}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Arquivos (PDF)
            </span>
            <span className="text-xs text-slate-600">{files.length}</span>
          </div>
          
          {/* Storage Usage Indicator */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-2">
             <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5">
                <span className="font-medium">Armazenamento</span>
                <span>{formatSize(currentTotalSize)} / 100 MB</span>
             </div>
             <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div 
                   className={`h-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : 'bg-blue-500'}`} 
                   style={{ width: `${usagePercentage}%` }}
                ></div>
             </div>
             {isNearLimit && (
               <p className="text-[10px] text-red-400 mt-1.5">Espaço cheio. Remova arquivos antigos.</p>
             )}
          </div>

          {files.length === 0 && !isProcessing ? (
            <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg p-4">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum dado carregado.</p>
              <p className="text-xs mt-1 text-orange-400">
                Arraste arquivos ou clique para carregar.
              </p>
            </div>
          ) : (
            <>
              {files.map((file) => (
                <div key={file.id} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between border border-slate-700 group hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-blue-500/10 p-2 rounded text-blue-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                    title="Remover arquivo"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </>
          )}
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900 space-y-3">
          
          {isProcessing ? (
             <div className="w-full border border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-slate-800/50">
               <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
               <div className="w-full space-y-1">
                 <div className="flex justify-between text-[10px] text-slate-400">
                   <span>Processando arquivos...</span>
                   <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-1 overflow-hidden">
                    <div 
                       className="bg-orange-500 h-full transition-all duration-300"
                       style={{ width: `${progress}%` }}
                    ></div>
                 </div>
               </div>
               <span className="text-[10px] text-slate-500 text-center">Isso pode levar alguns minutos.</span>
             </div>
          ) : (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                ${isDragging 
                  ? 'border-orange-500 bg-orange-500/10 text-orange-400 scale-[1.02]' 
                  : 'border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/50 text-slate-400'
                }
              `}
            >
              <Upload className={`w-6 h-6 ${isDragging ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-medium text-center">
                {isDragging ? 'Solte os arquivos aqui' : 'Arraste ou clique para carregar'}
              </span>
              <span className="text-[10px] opacity-60">Suporta múltiplos PDFs</span>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            multiple
            className="hidden"
            disabled={isProcessing}
          />

        <button 
          onClick={onLogout}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2.5 transition-colors text-xs uppercase tracking-wider font-medium hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" />
          Sair / Trocar Usuário
        </button>
      </div>
    </div>
  );
};