
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, MessageType } from './types';
import ChatMessage from './components/ChatMessage';
import { generateAssistantResponse, generateImage, generateVideo } from './services/geminiService';

const QUICK_SUGGESTIONS: Record<string, string[]> = {
  text: ["Resuma os últimos avanços em fusão nuclear", "Crie um roteiro de viagem para o Japão", "Dicas para produtividade extrema"],
  app: ["Crie um App de Dashboard Financeiro em React", "Sistema de autenticação com Next.js", "App de clima usando API OpenWeather"],
  search: ["Últimas notícias sobre Gemini 3.0", "Preço do Bitcoin e análise de mercado", "Tendências de design UI/UX para 2025"],
  code: ["Script de automação em Python para Excel", "API RESTful em Node.js com Express", "Algoritmo de IA simples em Python"],
  image: ["Retrato hiper-realista de um ciborgue", "Cidade flutuante em estilo Ghibli", "Logo minimalista para startup de IA"],
  video: ["Câmera lenta de uma explosão de cores", "Voo cinematográfico sobre Marte", "Luzes de neon refletidas na chuva"]
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content: 'Eu sou o Manus-X, seu Agente de IA com inteligência de nível GPT-4. Estou configurado com raciocínio profundo para criar aplicações, mídias e soluções complexas.\n\nEscolha um modo abaixo ou utilize uma das sugestões rápidas para começar.',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [creationMode, setCreationMode] = useState<MessageType>('text');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const promptToSend = textOverride || inputValue;
    if (!promptToSend.trim() || isTyping) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      type: creationMode,
      content: promptToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (creationMode === 'image') {
        const pendingId = 'img-' + Date.now();
        setMessages(prev => [...prev, {
          id: pendingId,
          role: 'assistant',
          type: 'image',
          content: `Gerando visual de alta definição para: "${promptToSend}"...`,
          metadata: { isPending: true },
          timestamp: Date.now()
        }]);

        const imageUrl = await generateImage(promptToSend);
        setMessages(prev => prev.map(msg => 
          msg.id === pendingId 
            ? { ...msg, content: `Obra-prima concluída:`, metadata: { imageUrl, isPending: false } }
            : msg
        ));
      } else if (creationMode === 'video') {
        const pendingId = 'vid-' + Date.now();
        setMessages(prev => [...prev, {
          id: pendingId,
          role: 'assistant',
          type: 'video',
          content: `Renderizando vídeo 1080p para: "${promptToSend}"... Isso levará alguns instantes.`,
          metadata: { isPending: true },
          timestamp: Date.now()
        }]);

        const videoUrl = await generateVideo(promptToSend);
        setMessages(prev => prev.map(msg => 
          msg.id === pendingId 
            ? { ...msg, content: `Produção cinematográfica finalizada:`, metadata: { videoUrl, isPending: false } }
            : msg
        ));
      } else {
        const response = await generateAssistantResponse(promptToSend, [], creationMode);
        const assistantMessage: ChatMessageType = {
          id: Date.now().toString(),
          role: 'assistant',
          type: creationMode,
          content: response.text,
          metadata: { sources: response.sources },
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        type: 'text',
        content: `Erro Crítico de Agência: ${error.message || 'Falha na comunicação com os modelos de inteligência superior.'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModeStyles = (id: string) => {
    if (creationMode !== id) return 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] border-transparent opacity-70 hover:opacity-100';
    
    switch(id) {
      case 'app': return 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 border-orange-400/30';
      case 'search': return 'bg-green-600 text-white shadow-lg shadow-green-500/30 border-green-400/30';
      case 'code': return 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border-purple-400/30';
      default: return 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-400/30';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-gray-100 font-sans selection:bg-blue-500/30">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 group cursor-pointer">
            <i className="fas fa-microchip text-white text-xl group-hover:scale-110 transition-transform"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Manus-X <span className="text-blue-500 not-italic">Pro</span></h1>
            <div className="flex items-center space-x-1.5">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Inteligência GPT-Level Ativa</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setMessages([])} 
            className="p-2.5 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-red-400 transition-all"
            title="Limpar Conversa"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
          <button 
            className="hidden md:flex items-center space-x-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-bold transition-all border border-gray-700"
            onClick={() => (window as any).aistudio?.openSelectKey()}
          >
            <i className="fas fa-shield-halved text-blue-400"></i>
            <span>Nível de Acesso</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#111] border border-gray-800/50 rounded-2xl rounded-tl-none p-5 flex items-center space-x-3 shadow-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Processando Pensamento...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="p-6 bg-[#0a0a0a] border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Sugestões Rápidas */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-[10px] font-black text-gray-500 uppercase whitespace-nowrap mr-2">Sugestões:</span>
            {QUICK_SUGGESTIONS[creationMode].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion)}
                className="px-4 py-1.5 rounded-lg bg-[#111] border border-gray-800 text-[11px] text-gray-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Seletor de Modos */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'text', icon: 'fa-brain', label: 'Raciocínio' },
              { id: 'app', icon: 'fa-layer-group', label: 'App Engine' },
              { id: 'search', icon: 'fa-globe-americas', label: 'Deep Search' },
              { id: 'code', icon: 'fa-terminal', label: 'Dev Agent' },
              { id: 'image', icon: 'fa-wand-magic-sparkles', label: 'Imagine' },
              { id: 'video', icon: 'fa-film', label: 'Cinema' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setCreationMode(mode.id as MessageType)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${getModeStyles(mode.id)}`}
              >
                <i className={`fas ${mode.icon}`}></i>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Input Principal */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                creationMode === 'image' ? "Visualize o impossível..." :
                creationMode === 'video' ? "Descreva a cena cinematográfica..." :
                creationMode === 'code' ? "Que sistema vamos programar hoje?" :
                creationMode === 'app' ? "Qual aplicação revolucionária vamos construir?" :
                "O que sua inteligência deseja criar agora?"
              }
              className={`relative w-full bg-[#111] border rounded-2xl px-6 py-5 pr-16 focus:outline-none transition-all min-h-[70px] max-h-[400px] resize-none text-gray-100 placeholder:text-gray-600 ${
                creationMode === 'app' ? 'border-orange-500/30' :
                creationMode === 'code' ? 'border-purple-500/30 font-mono' : 
                creationMode === 'search' ? 'border-green-500/30' :
                'border-gray-800 focus:border-blue-500/50 shadow-inner'
              }`}
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className={`absolute right-4 bottom-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                !inputValue.trim() || isTyping 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95'
              }`}
            >
              <i className={`fas ${isTyping ? 'fa-circle-notch fa-spin' : 'fa-arrow-up-long'} text-lg`}></i>
            </button>
          </div>
          <div className="flex justify-between items-center px-2">
             <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
               Autonomous Agent Core v4.0.2
             </p>
             <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
               Gemini 3 Pro + Search Grounding
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
