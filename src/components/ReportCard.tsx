import React, { useState } from 'react';
import { AnalysisResult, FileData } from '../types';
import { ScoreChart } from './ScoreChart';
import { CheckCircle, XCircle, Download, ArrowLeft, Target, TrendingUp, Layout } from 'lucide-react';
import { XYZGenerator } from './XYZGenerator';

interface ReportCardProps {
  result: AnalysisResult;
  onReset: () => void;
  fileSource?: FileData | null;
}

export const ReportCard: React.FC<ReportCardProps> = ({ result, onReset, fileSource }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'keywords' | 'roadmap'>('analysis');

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = "resume-analysis.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-20 z-40">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold"
        >
          <ArrowLeft size={16} />
          Edit Resume
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-sm font-bold"
        >
          <Download size={16} />
          Export JSON
        </button>
      </div>

      <div className="space-y-8 pb-20">
        {/* Main Score & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[260px]">
            <div className="scale-125">
              <ScoreChart score={result.overallScore} />
            </div>
            <p className="text-center text-slate-400 text-[10px] mt-6 uppercase font-black tracking-widest px-4">
              ATS Compatibility
            </p>
          </div>

          <div className="md:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Target size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-2xl">Executive Summary</h3>
            </div>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              {result.summary}
            </p>
            {result.jobMarketInsights && (
              <div className="p-5 bg-slate-50 rounded-2xl text-[12px] text-slate-500 border border-slate-100 leading-relaxed italic">
                <span className="font-black text-slate-400 uppercase tracking-tighter block mb-1.5 flex items-center gap-1.5">
                  <TrendingUp size={14} /> Market Context Used
                </span>
                {result.jobMarketInsights}
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'analysis' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Layout size={18} /> Section Analysis
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'keywords' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <CheckCircle size={18} /> Keywords
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'roadmap' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <TrendingUp size={18} /> Roadmap
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'analysis' && (
            /* Section Analysis */
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <Layout size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-2xl">Deep Section Analysis</h3>
              </div>
              <div className="space-y-8">
                {result.sections.map((section: any, idx: number) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-bold text-slate-800 flex items-center gap-2 text-base">
                        {section.name}
                      </span>
                      <span className={`text-sm font-black ${section.score > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                        {section.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden shadow-inner">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-1000 ease-out shadow-sm ${section.score > 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${section.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pl-1 group-hover:text-slate-800 transition-colors">
                      {section.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            /* Keyword Optimization */
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-2xl">Keyword Optimization</h3>
              </div>
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 px-1">Critical Missing Terms</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.keywords.missing.length > 0 ? (
                      result.keywords.missing.map((kw: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-red-50/50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2 shadow-sm hover:scale-105 transition-transform">
                          <XCircle size={12} /> {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">No critical keywords missing. Perfect alignment!</span>
                    )}
                  </div>
                </div>
                <div className="h-px bg-slate-100" />
                <div>
                  <h4 className="text-xs font-black text-green-500 uppercase tracking-widest mb-4 px-1">Detected Expertise</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.keywords.present.map((kw: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-green-50/50 text-green-700 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-2 shadow-sm hover:scale-105 transition-transform">
                        <CheckCircle size={12} /> {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            /* Action Items */
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-2xl">Prioritized Roadmap</h3>
              </div>
              <div className="space-y-5">
                {result.actionItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group cursor-default">
                    <div className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-black border uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-1 shadow-black group-hover:text-blue-500 transition-colors">{item.category}</span>
                      <p className="text-slate-700 text-base font-bold leading-relaxed group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* X-Y-Z Generator Tool */}
        <XYZGenerator />
      </div>
    </div>
  );
};
