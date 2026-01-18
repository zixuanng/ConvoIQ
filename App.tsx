import React, { useState } from 'react';
import { UploadView } from './views/UploadView';
import { DashboardView } from './views/DashboardView';
import { Chatbot } from './components/Chatbot';
import { analyzeChatLog } from './services/geminiService';
import { AnalysisReport } from './types';

export default function App() {
  const [view, setView] = useState<'upload' | 'dashboard'>('upload');
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const report = await analyzeChatLog(text);
      setAnalysisReport(report);
      setView('dashboard');
    } catch (error) {
      alert("Failed to analyze chat. Please try again or check your API Key.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setAnalysisReport(null);
    setView('upload');
  };

  return (
    <div className="antialiased text-gray-900 bg-white">
      {view === 'upload' ? (
        <UploadView onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      ) : (
        analysisReport && <DashboardView report={analysisReport} onBack={handleBack} />
      )}
      
      {/* Global Chatbot Assistant */}
      <Chatbot analysisContext={analysisReport} />
    </div>
  );
}
