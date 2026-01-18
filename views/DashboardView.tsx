import React, { useState } from 'react';
import { AnalysisReport, Conflict } from '../types';
import { MomentumChart, EmotionalSpectrum } from '../components/Charts';
import { RewindModal } from '../components/RewindModal';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, MessageCircle, Heart, Zap, Brain, Fingerprint, Eye, Download, FileJson, ChevronDown } from 'lucide-react';

interface DashboardViewProps {
  report: AnalysisReport;
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'conflicts'>('overview');
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Derive emotional counts for the spectrum
  const emotions = report.messages.reduce((acc, msg) => {
    if (msg.emotion) {
      const existing = acc.find(e => e.label === msg.emotion?.label);
      if (existing) existing.count++;
      else acc.push({ label: msg.emotion.label, count: 1, color: msg.emotion.color });
    }
    return acc;
  }, [] as { label: string; count: number; color: string }[]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleDownloadJSON = () => {
    setShowExportMenu(false);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `convoiq_report_${report.contactName.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium text-sm">
              &larr; Upload New
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs">
                {report.contactName.slice(0, 2).toUpperCase()}
              </div>
              {report.contactName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Export Button */}
             <div className="relative">
               <button 
                 onClick={() => setShowExportMenu(!showExportMenu)}
                 className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
               >
                 <Download size={16} />
                 <span className="hidden sm:inline">Export</span>
                 <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
               </button>
               
               {showExportMenu && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                     <button 
                       onClick={handleDownloadJSON}
                       className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                     >
                       <FileJson size={16} className="text-gray-400" /> Download JSON
                     </button>
                   </div>
                 </>
               )}
             </div>

             <div className="text-right hidden sm:block">
               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Relationship Health</p>
               <p className={`text-xl font-bold ${getHealthColor(report.metrics.healthScore)}`}>
                 {report.metrics.healthScore}/100
               </p>
             </div>
             <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
                <span className={`absolute inset-0 rounded-full border-4 ${getHealthColor(report.metrics.healthScore).replace('text', 'border')} opacity-20`}></span>
                <span className={`font-bold text-sm ${getHealthColor(report.metrics.healthScore)}`}>{report.metrics.healthScore}</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {report.metrics.healthScore < 70 && (
           <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
             <AlertTriangle className="text-red-600 shrink-0" />
             <div>
               <h3 className="text-red-800 font-bold">Relationship at Risk</h3>
               <p className="text-red-700 text-sm mt-1">ConvoIQ detected declining momentum and unresolved conflicts. Immediate action recommended.</p>
             </div>
           </div>
        )}

        {/* Prediction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {report.predictions.map((pred, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{pred.timeframe} Prediction</span>
                {pred.trend === 'up' ? <TrendingUp size={16} className="text-green-500" /> : 
                 pred.trend === 'down' ? <TrendingDown size={16} className="text-red-500" /> : 
                 <div className="w-4 h-0.5 bg-gray-400 my-2"></div>}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{pred.label}</h3>
              <p className="text-sm text-gray-500 mb-3">{pred.description}</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${pred.probability > 70 ? 'bg-green-500' : 'bg-brand-500'}`} 
                    style={{ width: `${pred.probability}%` }}
                ></div>
              </div>
              <p className="text-xs text-right text-gray-400 mt-1">{pred.probability}% Probability</p>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
          <div className="border-b border-gray-100 flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview & Momentum
            </button>
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'timeline' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Emotional Timeline
            </button>
            <button 
              onClick={() => setActiveTab('conflicts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'conflicts' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Conflict Rewind
              {report.conflicts.length > 0 && (
                <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs font-bold">{report.conflicts.length}</span>
              )}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Avg Response', value: `${report.metrics.avgResponseTime} min`, icon: <Clock size={16} /> },
                    { label: 'Velocity', value: `${report.metrics.velocity} msg/day`, icon: <Zap size={16} /> },
                    { label: 'Initiation', value: `${report.metrics.initiationBalance}% You`, icon: <MessageCircle size={16} /> },
                    { label: 'Conflicts', value: report.conflicts.length, icon: <AlertTriangle size={16} /> },
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                        {stat.icon} {stat.label}
                      </div>
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ActivityIcon /> Relationship Momentum
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-w-0">
                        <MomentumChart data={report.momentumHistory} />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Tracks conversation velocity and emotional reciprocity over the last 7 days.</p>
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart size={18} className="text-pink-500" /> Emotional Spectrum
                      </h3>
                      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative overflow-hidden min-w-0">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Zap size={100} className="text-white" />
                        </div>
                        <EmotionalSpectrum emotions={emotions} />
                      </div>
                   </div>
                </div>

                {/* Deep Insights / Psychological Profile Section */}
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Brain className="text-purple-600" /> Psychological Profile
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">Beta</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Attachment Style */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Fingerprint className="text-purple-500" size={20} />
                          <h4 className="font-semibold text-gray-900">Attachment Style</h4>
                        </div>
                        <p className="text-2xl font-bold text-purple-700 mb-1">{report.psychologicalProfile?.attachmentStyle || "Analyzing..."}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{report.psychologicalProfile?.attachmentDescription || "AI is determining emotional security patterns."}</p>
                      </div>
                    </div>

                    {/* Love Language */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-50 rounded-full group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="text-pink-500" size={20} />
                          <h4 className="font-semibold text-gray-900">Love Language</h4>
                        </div>
                        <p className="text-2xl font-bold text-pink-700 mb-1">{report.psychologicalProfile?.loveLanguage || "Analyzing..."}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">The primary way this contact expresses and expects affection.</p>
                      </div>
                    </div>

                    {/* Hidden Needs */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="text-blue-500" size={20} />
                          <h4 className="font-semibold text-gray-900">Hidden Needs</h4>
                        </div>
                        <ul className="space-y-2">
                          {report.psychologicalProfile?.hiddenNeeds?.map((need, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                              {need}
                            </li>
                          )) || <li className="text-sm text-gray-500">No hidden needs detected.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="max-w-3xl mx-auto space-y-8">
                 {report.messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div 
                          className={`p-4 rounded-2xl text-sm relative group min-w-[140px] ${
                            msg.sender === 'user' 
                              ? 'bg-brand-600 text-white rounded-tr-none' 
                              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          {msg.emotion && (
                            <div 
                              className={`absolute -bottom-3 ${
                                msg.sender === 'user' ? 'right-0' : 'left-0'
                              } px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm border border-white whitespace-nowrap z-10`}
                              style={{ backgroundColor: msg.emotion.color, color: '#fff' }}
                            >
                              {msg.emotion.label} {Math.round(msg.emotion.confidence * 100)}%
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-2 mx-1">{msg.timestamp}</span>
                     </div>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === 'conflicts' && (
               <div className="max-w-4xl mx-auto">
                 {report.conflicts.length === 0 ? (
                   <div className="text-center py-20">
                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-green-500" size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">No Conflicts Detected</h3>
                     <p className="text-gray-500">Your communication flow is healthy!</p>
                   </div>
                 ) : (
                   <div className="grid gap-6">
                     {report.conflicts.map(conflict => (
                       <div key={conflict.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-brand-300 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2 ${
                                conflict.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                {conflict.severity} Severity
                              </span>
                              <h3 className="text-lg font-bold text-gray-900">Conflict Point Detected</h3>
                            </div>
                            <button 
                              onClick={() => setSelectedConflict(conflict)}
                              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                              Rewind & Fix
                            </button>
                          </div>
                          <p className="text-gray-600 mb-4">{conflict.description}</p>
                          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                             <p className="text-sm text-gray-500 mb-1 font-semibold">Trigger Message:</p>
                             <p className="text-gray-800 italic">"{conflict.triggerMessage}"</p>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      </main>

      {selectedConflict && (
        <RewindModal 
          conflict={selectedConflict} 
          context={report.messages.map(m => `[${m.sender}]: ${m.text}`)}
          onClose={() => setSelectedConflict(null)} 
        />
      )}
    </div>
  );
};

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);