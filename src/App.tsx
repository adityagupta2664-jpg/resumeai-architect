import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Auth } from './components/Auth';
import { ReportCard } from './components/ReportCard';
import { analyzeResume, getQuickSummary } from './services/geminiService';
import { AnalysisResult, AppState, FileData, HistoryItem } from './types';
import { Briefcase, CheckCircle2, Sparkles, ArrowRight, History, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD); // Start on Upload by default, or choice
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJD, setShowJD] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('resume_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingMessage, setLoadingMessage] = useState('Initializing AI...');
  const [quickSummary, setQuickSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTargetLocked, setIsTargetLocked] = useState(false);

  useEffect(() => {
    localStorage.setItem('resume_history', JSON.stringify(history));
  }, [history]);

  const handleFileSelected = async (file: FileData) => {
    setAppState(AppState.ANALYZING);
    setError(null);
    setQuickSummary(null);

    try {
      // 1. Start Quick Summary (Parallel)
      getQuickSummary(file.base64, file.mimeType).then((summary: string) => {
        setQuickSummary(summary);
      });

      // 2. Main Analysis
      setLoadingMessage(jobTitle ? `Analyzing fit for "${jobTitle}"...` : "Analysing ATS compatibility...");
      const result = await analyzeResume(file, jobTitle, jobDescription);

      setAnalysisResult(result);
      setAppState(AppState.REPORT);

      // Save to History
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        jobTitle: jobTitle || 'General Analysis',
        score: result.overallScore,
        result: result,
        fileName: file.name
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10
    } catch (err: any) {
      console.error(err);
      setError("An error occurred during analysis. Please try again. " + (err.message || ''));
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.UPLOAD);
    setAnalysisResult(null);
    setCurrentFile(null);
    setQuickSummary(null);
    setError(null);
    setIsTargetLocked(false);
    setJobDescription('');
    setShowJD(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Briefcase className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">ResumeAI Architect</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hidden sm:flex"
              title="View History"
            >
              <History size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode('login'); setAppState(AppState.AUTH); }}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  Log in
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setAppState(AppState.AUTH); }}
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-1.5 rounded-lg shadow-sm"
                >
                  Sign up
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 hidden sm:inline">Signed in as User</span>
                <button
                  onClick={() => { setIsAuthenticated(false); setAppState(AppState.UPLOAD); }}
                  className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* AUTH STATE */}
        {appState === AppState.AUTH && (
          <Auth
            initialMode={authMode}
            onAuthComplete={() => {
              setIsAuthenticated(true);
              setAppState(AppState.UPLOAD);
            }}
          />
        )}

        {/* UPLOAD STATE */}
        {appState === AppState.UPLOAD && (
          <div className="animate-fade-in-up space-y-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Beat the ATS. <span className="text-blue-600">Land the Interview.</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload your resume to get an instant, AI-powered audit. benchmarked against real-world job data.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); if (jobTitle) setIsTargetLocked(true); }}
              className="max-w-xl mx-auto space-y-2 group"
            >
              <label className="block text-sm font-medium text-slate-700 ml-1 flex items-center gap-2">
                Target Job Title (Optional)
                {isTargetLocked && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in"><CheckCircle2 size={10} /> Targeted</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Senior Product Manager"
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none shadow-sm
                     ${isTargetLocked ? 'border-green-300 bg-green-50 ring-2 ring-green-100' : 'border-slate-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'}
                   `}
                  value={jobTitle}
                  onChange={(e) => { setJobTitle(e.target.value); setIsTargetLocked(false); }}
                />
                <button
                  type="submit"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors
                     ${isTargetLocked ? 'text-green-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}
                   `}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
              <p className="text-xs text-slate-500 ml-1">
                {isTargetLocked
                  ? `Google Search Grounding is ready for "${jobTitle}". Now upload your resume.`
                  : "Press Enter to lock in target for Search Grounding."}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowJD(!showJD)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  {showJD ? '− Hide Job Description' : '+ Paste Job Description (More Accurate)'}
                </button>
              </div>

              {showJD && (
                <div className="animate-fade-in-up mt-3">
                  <textarea
                    placeholder="Paste the full job description here... (Key skills, requirements, responsibilities)"
                    className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm shadow-inner"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 ml-1 uppercase tracking-wider font-bold">Recommended for 100% accurate keyword matching</p>
                </div>
              )}
            </form>

            <FileUpload onFileSelected={handleFileSelected} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
              {[
                { title: "Deep Analysis", desc: "Uses Gemini 3 Pro reasoning to simulate top-tier ATS logic." },
                { title: "Market Data", desc: "Real-time keyword comparison via Google Search." },
                { title: "Secure & Private", desc: "Processing happens in memory. No data storage." }
              ].map((feat, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-sm text-slate-500">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {appState === AppState.ANALYZING && (
          <div className="max-w-xl mx-auto text-center pt-20 space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-blue-600 animate-pulse" size={32} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{loadingMessage}</h2>
              {quickSummary && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm animate-fade-in text-left">
                  <p className="font-semibold mb-1 flex items-center gap-2"><CheckCircle2 size={14} /> First Impression:</p>
                  {quickSummary}
                </div>
              )}
              <p className="text-slate-500 mt-4 text-sm">This typically takes 10-20 seconds for deep reasoning...</p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {appState === AppState.ERROR && (
          <div className="max-w-xl mx-auto text-center pt-20">
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-red-800">
              <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
              <p>{error}</p>
              <button
                onClick={reset}
                className="mt-6 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* REPORT STATE */}
        {appState === AppState.REPORT && analysisResult && (
          <ReportCard
            result={analysisResult}
            onReset={reset}
            fileSource={currentFile}
          />
        )}

        {/* HISTORY SIDEBAR */}
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setShowHistory(false)}
            />
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl animate-slide-in-right flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <History size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">Analysis History</h3>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setAnalysisResult(item.result);
                        setAppState(AppState.REPORT);
                        setShowHistory(false);
                      }}
                      className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate pr-4">
                          {item.jobTitle}
                        </span>
                        <span className={`text-xs font-black ${item.score > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <Clock size={10} />
                        {new Date(item.timestamp).toLocaleDateString()} · {item.fileName}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <History size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">No history yet</h4>
                      <p className="text-xs text-slate-500 mt-1">Upload and analyze your first resume to see it here.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-medium text-center italic">
                History is stored locally and stays on your device.
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
