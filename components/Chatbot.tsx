import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, generateCoachingTips } from '../services/geminiService';
import { ChatMessage, AnalysisReport } from '../types';

interface ChatbotProps {
  analysisContext: AnalysisReport | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ analysisContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I\'m ConvoIQ AI. Ask me anything about your relationships or the analysis.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipsFetched, setTipsFetched] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevContextRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle context changes and auto-fetch tips
  useEffect(() => {
    const currentContextId = analysisContext ? analysisContext.contactName : null;

    // If context has changed (e.g. new upload)
    if (currentContextId !== prevContextRef.current) {
        setTipsFetched(false);
        setMessages([
            { role: 'model', text: analysisContext 
                ? `Hi! I've analyzed your conversation with ${analysisContext.contactName}. Ask me about the data or how to improve things.` 
                : 'Hi! I\'m ConvoIQ AI. Ask me anything about your relationships or the analysis.' 
            }
        ]);
        prevContextRef.current = currentContextId;
    }

    // Auto-fetch tips if open, has context, and not fetched yet
    if (isOpen && analysisContext && !tipsFetched) {
        setTipsFetched(true);
        setLoading(true);
        generateCoachingTips(analysisContext).then(tips => {
            if (tips) {
                setMessages(prev => [...prev, { role: 'model', text: tips }]);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }
  }, [isOpen, analysisContext, tipsFetched]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = analysisContext 
        ? `Current analysis for ${analysisContext.contactName}. 
           Psych Profile: ${JSON.stringify(analysisContext.psychologicalProfile)}. 
           Conflicts: ${JSON.stringify(analysisContext.conflicts)}.
           Summary: ${analysisContext.summary}`
        : "No active analysis loaded.";

      const responseText = await sendChatMessage(messages, input, context);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-print">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105 z-50 flex items-center justify-center group"
        >
          <MessageCircle size={28} />
          {analysisContext && !tipsFetched && (
             <span className="absolute -top-1 -right-1 flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">1</span>
             </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-300" />
              <h3 className="font-semibold">ConvoIQ Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-brand-700 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                      em: ({node, ...props}) => <span className="italic" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about relationship advice..."
                className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};