
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface Props {
  message: ChatMessageType;
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic markdown code block detection and styling
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        const language = match?.[1] || 'code';
        const code = match?.[2] || '';
        
        return (
          <div key={index} className="my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#0d0d0d]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-gray-700">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{language}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <i className="fas fa-copy"></i> Copiar
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-blue-300">
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      }
      return <div key={index} className="whitespace-pre-wrap">{part}</div>;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-xl ${
        isUser 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-[#1e1e1e] text-gray-200 border border-gray-800 rounded-tl-none'
      }`}>
        <div className="text-xs opacity-50 mb-1 font-bold uppercase tracking-wider">
          {isUser ? 'Você' : 'Manus-X'}
        </div>

        <div className="leading-relaxed">
          {renderContent(message.content)}
        </div>

        {message.metadata?.imageUrl && (
          <div className="mt-4 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
            <img src={message.metadata.imageUrl} alt="Generated content" className="w-full h-auto object-cover" />
          </div>
        )}

        {message.metadata?.videoUrl && (
          <div className="mt-4 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
            <video src={message.metadata.videoUrl} controls className="w-full h-auto" />
          </div>
        )}

        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <p className="text-xs font-semibold mb-2 text-blue-400">Fontes:</p>
            <div className="flex flex-wrap gap-2">
              {message.metadata.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                >
                  <i className="fas fa-link mr-1"></i> {source.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {message.metadata?.isPending && (
          <div className="mt-4 flex items-center space-x-3 text-sm text-blue-400 font-medium">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
            <span>Tecendo fios de código e realidade...</span>
          </div>
        )}

        <div className="text-[10px] mt-2 opacity-30 text-right">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
