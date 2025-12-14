import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { LoginScreen } from './components/LoginScreen';
import { Message, Role, UploadedFile } from './types';
import { geminiService } from './services/geminiService';

// Simple UUID generator replacement
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Constants for file limits
// CRITICAL ADJUSTMENT:
// The Gemini 2.5 Flash model has a 1 Million Token Context Window.
// - 1 Token ~= 4 chars.
// - 1 Million Tokens ~= 4MB of pure raw text.
// - PDF files have overhead (images, formatting), but dense technical manuals are text-heavy.
// - 100MB of PDFs resulted in Token Limit Exceeded errors.
// - We are lowering the limit to 30MB. This is a conservative heuristic to keep the
//   extracted text payload under the ~1M token limit (approx 4MB pure text + overhead).
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB per file max
const MAX_TOTAL_SIZE = 30 * 1024 * 1024; // 30MB total storage limit for context safety

const App: React.FC = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'tech' | null>(null);

  // App Data State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // File Processing State
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0); // 0 to 100
  
  // Sidebar default open on Desktop (screen > 768px), closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  const handleLogin = (username: string, role: 'admin' | 'tech') => {
    setIsLoggedIn(true);
    setUserRole(role);
    // Ensure sidebar is open on login for desktop users
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setMessages([]); // Optional: clear chat on logout
    setIsSidebarOpen(false);
  };

  // Helper to read file as Base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle File Upload (Admin only) - Batched Processing
  const handleAddFiles = useCallback(async (fileList: FileList) => {
    if (userRole !== 'admin') return;
    
    setIsProcessingFiles(true);
    setProcessingProgress(0);

    const filesArray = Array.from(fileList);
    const totalFiles = filesArray.length;
    
    // Quick Pre-validation for limits
    // Calculate current size
    const currentTotalSize = files.reduce((acc, f) => acc + f.size, 0);
    let potentialNewSize = currentTotalSize;

    for (const file of filesArray) {
       potentialNewSize += file.size;
    }

    if (potentialNewSize > MAX_TOTAL_SIZE) {
      alert(`Erro: Limite de Capacidade da IA Excedido.\n\nPara garantir que a IA consiga ler todos os manuais (Limite de 1 Milhão de Tokens), o tamanho total dos arquivos não pode passar de 30MB.\n\nEspaço atual: ${(currentTotalSize/1024/1024).toFixed(1)}MB\nNecessário: ${(potentialNewSize/1024/1024).toFixed(1)}MB\n\nPor favor, selecione apenas os manuais essenciais para o diagnóstico atual.`);
      setIsProcessingFiles(false);
      return;
    }

    // Process in Chunks to prevent UI freeze
    const CHUNK_SIZE = 5; // Process 5 files at a time
    const newFiles: UploadedFile[] = [];

    try {
      for (let i = 0; i < totalFiles; i += CHUNK_SIZE) {
        const chunk = filesArray.slice(i, i + CHUNK_SIZE);
        
        await Promise.all(chunk.map(async (file) => {
          if (file.size > MAX_FILE_SIZE) {
            console.warn(`File skipped: ${file.name} is too large.`);
            return;
          }

          try {
            const base64Data = await readFileAsBase64(file);
            newFiles.push({
              id: generateId(),
              name: file.name,
              mimeType: file.type,
              data: base64Data,
              size: file.size
            });
          } catch (err) {
            console.error(`Error reading file ${file.name}`, err);
          }
        }));

        // Update progress
        const processedCount = Math.min(i + CHUNK_SIZE, totalFiles);
        setProcessingProgress(Math.round((processedCount / totalFiles) * 100));
        
        // Small delay to let React render the progress bar update
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      setFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error("Batch processing error:", error);
      alert("Houve um erro ao processar os arquivos.");
    } finally {
      setIsProcessingFiles(false);
      setProcessingProgress(0);
    }
  }, [userRole, files]); 

  const handleRemoveFile = (id: string) => {
    if (userRole === 'admin') {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleSendMessage = async (text: string) => {
    if (files.length === 0) {
      alert("A base de conhecimento está vazia. Contate o administrador.");
      return;
    }

    const newUserMessage: Message = {
      id: generateId(),
      role: Role.USER,
      text: text,
      timestamp: Date.now()
    };

    // Add user message immediately
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Create a placeholder bot message immediately
    const botMessageId = generateId();
    const newBotMessage: Message = {
      id: botMessageId,
      role: Role.MODEL,
      text: '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newBotMessage]);

    try {
      // Consume the stream
      const stream = geminiService.sendMessageStream(
        messages, // Pass current history (excluding the new user msg, as logic inside service handles construction)
        text,
        files
      );

      let accumulatedText = "";
      
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: accumulatedText } 
            : msg
        ));
      }

    } catch (error: any) {
      console.error(error);
      let errorMessage = "Erro de conexão com a IA. Verifique a chave de API.";
      const errString = error.toString();
      const errMessage = error.message || "";
      
      // Handle the explicit browser limit error thrown by service
      if (errMessage.includes("Limitação")) {
        errorMessage = errMessage;
      }
      // Catch specific "Invalid string length" error from V8 engine
      else if (error instanceof RangeError || errMessage.includes("Invalid string length")) {
        errorMessage = "Erro de Memória do Navegador: A quantidade de dados carregados é muito grande para o navegador processar. Por favor, remova alguns arquivos.";
      }
      // Catch Gemini API Token Limit Error (400 INVALID_ARGUMENT)
      else if (
          errString.includes("400") || 
          errString.includes("token count exceeds") || 
          errMessage.includes("token count exceeds") ||
          errMessage.includes("INVALID_ARGUMENT")
      ) {
        errorMessage = "⛔ ERRO DE CAPACIDADE (TOKENS): Os manuais enviados contêm mais texto do que a IA consegue ler de uma vez (Limite de 1 Milhão de Tokens).\n\nSOLUÇÃO: Remova arquivos da lista lateral até ficar abaixo de 30MB e tente novamente. Envie apenas os manuais da marca/modelo que você está consertando agora.";
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: errorMessage, isError: true } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar - Controlled by isSidebarOpen for both Mobile and Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-20 w-80 
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative
        ${!isSidebarOpen ? 'md:!w-0 md:!border-0 md:overflow-hidden' : ''} 
      `}>
        <Sidebar 
          files={files} 
          onAddFiles={handleAddFiles} 
          onRemoveFile={handleRemoveFile}
          readOnly={userRole !== 'admin'}
          userRole={userRole === 'admin' ? 'Administrador' : 'Técnico'}
          onLogout={handleLogout}
          onClose={() => setIsSidebarOpen(false)}
          isProcessing={isProcessingFiles}
          progress={processingProgress}
        />
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[-1] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <ChatInterface 
        messages={messages} 
        isLoading={isLoading} 
        onSendMessage={handleSendMessage}
        onMobileMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        hasFiles={files.length > 0}
        userRole={userRole}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
};

export default App;