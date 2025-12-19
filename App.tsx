
import React, { useState, useCallback, useEffect } from 'react';
import { GithubRepoData, AIAnalysis, AppState } from './types';
import { fetchRepoData, fetchLanguages } from './services/githubService';
import { analyzeRepository } from './services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    repoUrl: '',
    isLoading: false,
    repoData: null,
    analysis: null,
    error: null
  });

  const [languageData, setLanguageData] = useState<{name: string, value: number}[]>([]);

  const performAnalysis = async (url: string) => {
    setState(prev => ({ ...prev, repoUrl: url, isLoading: true, error: null, repoData: null, analysis: null }));
    
    try {
      const data = await fetchRepoData(url);
      const languagesRaw = await fetchLanguages(data.languages_url);
      
      const langArray = Object.entries(languagesRaw).map(([name, value]) => ({
        name,
        value: value as number
      })).sort((a, b) => b.value - a.value);
      
      setLanguageData(langArray);

      const aiResult = await analyzeRepository(data, langArray.map(l => l.name));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        repoData: data,
        analysis: aiResult
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'An unexpected error occurred'
      }));
    }
  };

  const handleLinkRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.repoUrl) return;
    performAnalysis(state.repoUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 selection:bg-blue-500/30">
      {/* Header */}
      <nav className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <i className="fab fa-github text-xl"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight">GitLens <span className="text-blue-500">AI</span></h1>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <button className="hover:text-blue-400 transition-colors">Analyzer</button>
            <button className="hover:text-blue-400 transition-colors">History</button>
            <button className="hover:text-blue-400 transition-colors">API Status</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Powered by Gemini 3 Flash
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
            Link Your Repo. <br className="hidden sm:block"/> Get the Edge.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly surface technical debt, security risks, and architectural insights 
            from any public GitHub repository.
          </p>
          
          <form onSubmit={handleLinkRepo} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <i className="fas fa-link"></i>
              </div>
              <input
                type="text"
                value={state.repoUrl}
                onChange={(e) => setState(prev => ({ ...prev, repoUrl: e.target.value }))}
                placeholder="https://github.com/owner/repo"
                className="block w-full pl-11 pr-3 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 backdrop-blur-sm"
              />
            </div>
            <button
              disabled={state.isLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 whitespace-nowrap shadow-xl shadow-blue-900/20 active:scale-95"
            >
              {state.isLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Analyzing
                </>
              ) : (
                <>
                  <i className="fas fa-bolt"></i> Analyze Repo
                </>
              )}
            </button>
          </form>

          {/* Quick Start Suggested Link */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <span>Try example:</span>
            <button 
              onClick={() => performAnalysis('https://github.com/levy01/colisseum.git')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center gap-2"
            >
              <i className="fab fa-github text-xs"></i> levy01/colisseum
            </button>
          </div>

          {state.error && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl max-w-2xl mx-auto text-sm flex items-center gap-3">
              <i className="fas fa-triangle-exclamation text-lg"></i>
              <span>{state.error}</span>
            </div>
          )}
        </div>

        {/* Results Dashboard */}
        {state.repoData && state.analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Repo Header Card */}
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <img 
                      src={state.repoData.owner.avatar_url} 
                      alt="Owner" 
                      className="w-20 h-20 rounded-2xl border-2 border-slate-800 p-1 bg-slate-900 shadow-2xl" 
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-500 font-medium text-sm tracking-wide">REPOSITORY</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="text-slate-500 text-sm">{state.repoData.owner.login}</span>
                      </div>
                      <h3 className="text-3xl font-black">{state.repoData.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <a 
                      href={state.repoData.html_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-semibold"
                    >
                      <i className="fab fa-github"></i> GitHub
                    </a>
                  </div>
                </div>

                <p className="text-slate-300 text-lg leading-relaxed mb-8 border-l-4 border-blue-600 pl-6 py-1">
                  {state.repoData.description || "No description available for this repository."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Stars', value: state.repoData.stargazers_count, icon: 'fa-star', color: 'text-yellow-500' },
                    { label: 'Forks', value: state.repoData.forks_count, icon: 'fa-code-branch', color: 'text-blue-400' },
                    { label: 'Language', value: state.repoData.language || 'Mixed', icon: 'fa-code', color: 'text-indigo-400' },
                    { label: 'Topics', value: state.repoData.topics.length, icon: 'fa-tags', color: 'text-emerald-400' }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-2xl text-center">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">{stat.label}</p>
                      <p className={`text-lg font-black ${stat.color}`}>
                        <i className={`fas ${stat.icon} mr-2 text-sm`}></i> 
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary Card */}
              <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <i className="fas fa-brain text-8xl"></i>
                </div>
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <i className="fas fa-robot text-sm"></i>
                  </span>
                  Project Intelligence Summary
                </h4>
                <div className="text-slate-200 text-lg leading-relaxed font-medium">
                  {state.analysis.summary}
                </div>
              </div>

              {/* Recommendations & Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-3xl p-8">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-3 text-red-400">
                    <i className="fas fa-shield-halved"></i> Security & Risks
                  </h4>
                  <div className="space-y-4">
                    {state.analysis.potentialIssues.map((issue, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-sm text-slate-400">
                        <i className="fas fa-circle-exclamation text-red-500 mt-1"></i>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-3xl p-8">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-3 text-emerald-400">
                    <i className="fas fa-rocket"></i> Key Recommendations
                  </h4>
                  <div className="space-y-4">
                    {state.analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-sm text-slate-400">
                        <i className="fas fa-lightbulb text-emerald-500 mt-1"></i>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              
              {/* Health Score Card */}
              <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-slate-500 mb-8">Maintainability Score</h4>
                <div className="relative w-48 h-48 mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-slate-800"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={552}
                      strokeDashoffset={552 - (552 * state.analysis.score) / 100}
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${state.analysis.score > 70 ? "text-emerald-500" : state.analysis.score > 40 ? "text-yellow-500" : "text-red-500"}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black tracking-tight">{state.analysis.score}</span>
                    <span className="text-xs font-bold text-slate-500 mt-1">PERCENT</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium px-4">
                  Composite rating based on structure, documentation, and stack modernness.
                </p>
              </div>

              {/* Language Breakdown Card */}
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-3xl p-8">
                <h4 className="text-lg font-bold mb-8">Technology Profile</h4>
                <div className="h-56 w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {languageData.slice(0, 5).map((lang, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-sm font-semibold text-slate-300">{lang.name}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {(lang.value / languageData.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stack Insights Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <i className="fas fa-layer-group text-purple-400"></i> Expert Insights
                </h4>
                <div className="space-y-3">
                  {state.analysis.techStackInsights.map((insight, i) => (
                    <div key={i} className="text-sm p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 text-slate-400 leading-relaxed">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!state.repoData && !state.isLoading && !state.error && (
          <div className="mt-12 flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-700">
              <i className="fas fa-folder-open text-4xl"></i>
            </div>
            <p className="text-slate-500 font-medium text-center px-8">
              Paste a repository link above to generate a comprehensive AI audit. <br/>
              Results will appear here in seconds.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-32 py-12 border-t border-slate-900/50 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4 text-slate-400">
            <i className="fas fa-code"></i>
            <span className="font-semibold">GitLens AI</span>
          </div>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            A state-of-the-art diagnostic tool for modern development teams. 
            Built for performance and deep technical clarity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
