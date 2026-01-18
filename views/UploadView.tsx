import React, { useState } from 'react';
import { Upload, FileText, Zap, Shield, ChevronRight, Activity, MessageSquare, Brain } from 'lucide-react';
import { DEMO_CHAT_LOG } from '../constants';

interface UploadViewProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export const UploadView: React.FC<UploadViewProps> = ({ onAnalyze, isAnalyzing }) => {
  const [inputText, setInputText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Mock file reading
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setInputText(ev.target.result as string);
      };
      reader.readAsText(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setInputText(ev.target.result as string);
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-brand-600" size={24} />
            <span className="text-xl font-bold text-gray-900 tracking-tight">ConvoIQ</span>
          </div>
          {/* Login removed */}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Decode Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-600">Relationships</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The first AI platform that reveals psychological profiles, attachment styles, and hidden needs from your chat logs.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => onAnalyze(DEMO_CHAT_LOG)}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Zap size={18} className="text-yellow-500" /> 
              Try Demo Chat
            </button>
          </div>
        </div>

        {/* Upload Card */}
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-brand-400 to-blue-500"></div>
          <div className="p-8">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
                dragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`mb-4 ${dragActive ? 'text-brand-600' : 'text-gray-400'}`} size={48} />
              <p className="text-gray-900 font-medium mb-2">Upload chat export</p>
              <p className="text-gray-500 text-sm mb-4">WhatsApp .txt or Copy/Paste below</p>
              <div className="relative">
                 <input 
                  type="file" 
                  accept=".txt,.csv" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="px-4 py-2 bg-brand-50 text-brand-700 font-medium rounded-lg text-sm hover:bg-brand-100 transition-colors">
                  Select File
                </button>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Or paste conversation</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your chat logs here..."
                className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            <button
              onClick={() => onAnalyze(inputText)}
              disabled={!inputText.trim() || isAnalyzing}
              className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="animate-spin" /> Analyzing Patterns...
                </>
              ) : (
                <>
                  Analyze Relationship <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 px-8 py-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield size={12} />
            <span>Your data is processed privately and encrypted.</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl w-full">
            {[
                {
                    icon: <Brain className="text-brand-500" />, 
                    title: "Psychological Profiling", 
                    desc: "Determine attachment styles (Anxious, Secure, Avoidant) from conversation."
                },
                {
                    icon: <MessageSquare className="text-blue-500" />, 
                    title: "Argument Rewind", 
                    desc: "Identify exactly where things went wrong and how to fix it."
                },
                {
                    icon: <Zap className="text-purple-500" />, 
                    title: "Momentum Prediction", 
                    desc: "Forecasts if your relationship is deepening or drifting apart."
                }
            ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4">
                    <div className="mb-4 p-3 bg-white rounded-full shadow-md border border-gray-100">
                        {f.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

// Simple skeleton icon component
const RefreshCw = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </svg>
);
