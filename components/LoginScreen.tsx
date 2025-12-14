import React, { useState } from 'react';
import { Lock, User, Wrench } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, role: 'admin' | 'tech') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Authentication logic
    if (username === 'admin' && password === 'admin') {
      onLogin(username, 'admin');
    } else if (username === 'tecnico' && password === '123') {
      onLogin(username, 'tech');
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 text-center mb-8">
          <div className="flex justify-center mb-6 min-h-[160px] items-center">
            {!imgError ? (
              <img 
                src="logo.png" 
                alt="Zé do Elevador" 
                className="w-full max-w-[280px] h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-slate-800 border border-slate-700 shadow-inner">
                 <Wrench className="w-12 h-12 text-orange-500" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sistema de Diagnóstico</h1>
          <p className="text-slate-400 text-sm">
            Inteligência Artificial para Manutenção de Elevadores
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Identificação
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500">
                <User className="h-5 w-5 text-slate-600 group-focus-within:text-orange-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-lg py-3 text-slate-200 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder-slate-600"
                placeholder="Usuário"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Chave de Acesso
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-600 group-focus-within:text-orange-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-lg py-3 text-slate-200 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder-slate-600"
                placeholder="Senha"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-orange-900/20 active:scale-[0.98]"
          >
            Acessar Sistema
          </button>
        </form>
      </div>
    </div>
  );
};