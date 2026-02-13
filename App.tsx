
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Brief, Theme, Platform, Mode, PromptConfig, ApiConfig, AIProvider, Portfolio, Tone } from './types';
import { generateContent, DEFAULT_SYSTEM_PROMPTS } from './services/ai';
import { AnimatePresence, motion } from 'framer-motion';

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode }[] = [
  {
    id: 'fiverr',
    label: 'Fiverr',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508.02 508.02">
        <circle fill="#1dbf73" cx="254.01" cy="254.01" r="254.01" />
        <circle fill="#fff" cx="315.97" cy="162.19" r="26.87" />
        <path fill="#fff" d="M345.87,207.66h-123V199.6c0-15.83,15.83-16.13,23.89-16.13,9.25,0,13.44.9,13.44.9v-43.6a155.21,155.21,0,0,0-19.71-1.19c-25.68,0-73.16,7.16-73.16,61.51V208h-22.4v40.31h22.4v85.1h-20.9v40.31H247.34V333.37H222.85v-85.1H290v85.1H269.13v40.31h97.65V333.37H345.87Z" transform="translate(-1.83 -0.98)" />
      </svg>
    )
  },
  {
    id: 'upwork',
    label: 'Upwork',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2">
        <ellipse cx="184.5" cy="234.5" rx="57.5" ry="56.5" transform="translate(-546.174 -763.565) scale(4.34783)" fill="#14a800" />
        <path d="M345.516 181.708c-42.168 0-65.774 27.481-72.532 55.773-7.658-14.416-13.335-33.698-17.75-51.628H196.94v72.531c0 26.31-11.984 45.772-35.41 45.772-23.427 0-36.852-19.462-36.852-45.772l.27-72.531H91.34v72.531c0 21.174 6.848 40.366 19.372 54.061 12.884 14.146 30.454 21.534 50.817 21.534 40.545 0 68.837-31.085 68.837-75.595V209.64c4.235 16.038 14.326 46.853 33.608 73.884l-18.02 102.625h34.148l11.893-72.712c3.875 3.244 8.02 6.127 12.434 8.74 11.443 7.208 24.508 11.263 38.023 11.713 0 0 2.073.09 3.154.09 41.807 0 75.054-32.346 75.054-76.045 0-43.7-33.337-76.226-75.144-76.226m0 122.358c-25.86 0-42.979-20.003-47.754-27.752 6.127-49.015 24.057-64.512 47.754-64.512 23.426 0 41.626 18.741 41.626 46.132 0 27.39-18.2 46.132-41.626 46.132" fill="#fff" fillRule="nonzero" />
      </svg>
    )
  },
  {
    id: 'email',
    label: 'Email',
    icon: (
      <svg className="w-5 h-5" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 85.57">
        <path fill="#b578ff" d="M3.8,0,62.48,47.85,118.65,0ZM0,80.52,41.8,38.61,0,4.53v76ZM46.41,42.37,3.31,85.57h115.9L78,42.37,64.45,53.94h0a3,3,0,0,1-3.79.05L46.41,42.37Zm36.12-3.84,40.35,42.33V4.16L82.53,38.53Z" />
      </svg>
    )
  },
];

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'deliverable', label: 'Deliverable', icon: '🛠️' },
  { id: 'proposal', label: 'Proposal', icon: '🖋️' },
];

const SETTINGS_TABS = [
  { id: 'connection', label: 'AI Connection' },
  { id: 'fiverr', label: 'Fiverr' },
  { id: 'upwork', label: 'Upwork' },
  { id: 'email', label: 'Email' },
  { id: 'deliverable', label: 'Deliverable' },
  { id: 'portfolios', label: 'Portfolios' },
];

const TONES: { id: Tone; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'persuasive', label: 'Persuasive' },
];


const AutoResizeTextarea = ({ value, onChange, className, placeholder, minRows = 1 }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const element = textareaRef.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useLayoutEffect(() => {
    adjustHeight();
  }, [value]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`${className} block w-full overflow-hidden resize-none`}
      placeholder={placeholder}
      rows={minRows}
      style={{ display: 'block' }}
    />
  );
};

const getGradientFromUrl = (url: string) => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = url.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = Math.abs((hash + 40) % 360);
  return `linear-gradient(135deg, hsl(${h1}, 70%, 60%), hsl(${h2}, 70%, 60%))`;
};


const SettingsModal = ({
  isOpen,
  onClose,
  prompts,
  onSave,
  apiConfig,
  onSaveApiConfig,
  portfolios,
  onSavePortfolios
}: {
  isOpen: boolean;
  onClose: () => void;
  prompts: PromptConfig;
  onSave: (newPrompts: PromptConfig) => void;
  apiConfig: ApiConfig;
  onSaveApiConfig: (config: ApiConfig) => void;
  portfolios: Portfolio[];
  onSavePortfolios: (portfolios: Portfolio[]) => void;
}) => {
  const [activeTab, setActiveTab] = useState<string>('connection');
  const [localPrompts, setLocalPrompts] = useState<PromptConfig>(prompts);
  const [localApiConfig, setLocalApiConfig] = useState<ApiConfig>(apiConfig);
  const [localPortfolios, setLocalPortfolios] = useState<Portfolio[]>(portfolios);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    setLocalPrompts(prompts);
    setLocalApiConfig(apiConfig);
    setLocalPortfolios(portfolios);
  }, [prompts, apiConfig, portfolios, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (activeTab === 'connection') return;
    setLocalPrompts(prev => ({ ...prev, [activeTab]: DEFAULT_SYSTEM_PROMPTS[activeTab as keyof PromptConfig] }));
  };

  const handleSave = () => {
    onSave(localPrompts);
    onSaveApiConfig(localApiConfig);
    onSavePortfolios(localPortfolios);
    onClose();
  };

  const updateKey = (key: string) => {
    setLocalApiConfig(prev => ({
      ...prev,
      keys: { ...prev.keys, [prev.provider]: key }
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
          <h2 className="text-lg font-bold">App Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-56 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 no-scrollbar">
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none whitespace-nowrap text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col min-w-0 h-full bg-white dark:bg-slate-900 overflow-y-auto">
            {activeTab === 'connection' ? (
              <div className="p-5 md:p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select AI Provider</h3>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setLocalApiConfig(prev => ({ ...prev, provider: 'gemini' }))}
                      className={`p-3 rounded-xl border transition-all flex flex-row items-center gap-4 text-left ${localApiConfig.provider === 'gemini' ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/10 text-brand-600' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-60 hover:opacity-100'}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                        <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.png" alt="Gemini" className="w-5 h-5 object-contain" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm block">Google Gemini</span>
                        <span className="text-[10px] opacity-70 uppercase tracking-wider">Fast & Cost Effective</span>
                      </div>
                      {localApiConfig.provider === 'gemini' && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                    </button>
                    <button
                      onClick={() => setLocalApiConfig(prev => ({ ...prev, provider: 'openai' }))}
                      className={`p-3 rounded-xl border transition-all flex flex-row items-center gap-4 text-left ${localApiConfig.provider === 'openai' ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/10 text-brand-600' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-60 hover:opacity-100'}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                        <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/chatgpt-icon.png" alt="ChatGPT" className="w-5 h-5 object-contain" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm block">OpenAI GPT-4o</span>
                        <span className="text-[10px] opacity-70 uppercase tracking-wider">Premium Model</span>
                      </div>
                      {localApiConfig.provider === 'openai' && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">API Key ({localApiConfig.provider === 'openai' ? 'OpenAI' : 'Google Gemini'})</h3>
                  <div className="relative">
                    <input
                      type="password"
                      value={localApiConfig.keys[localApiConfig.provider]}
                      onChange={(e) => updateKey(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs outline-none focus:border-brand-500 transition-colors"
                      placeholder={`Paste your ${localApiConfig.provider === 'openai' ? 'sk-...' : 'Google AI'} Key here`}
                    />
                    <p className="mt-2 text-[10px] text-slate-400">Keys are stored locally in your browser and never sent to our servers.</p>
                  </div>
                </div>
              </div>
            ) : activeTab === 'portfolios' ? (
              <div className="p-5 md:p-6 h-full flex flex-col">
                <div className="mb-4 flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage Portfolios</h3>
                  <button
                    onClick={() => setEditingPortfolio({ id: crypto.randomUUID(), name: '', url: '' })}
                    className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider shadow-sm transition-colors"
                  >
                    + Add New
                  </button>
                </div>

                {editingPortfolio ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 mb-4 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                    <input
                      placeholder="Portfolio Name (e.g. My Website)"
                      value={editingPortfolio.name}
                      onChange={e => setEditingPortfolio({ ...editingPortfolio, name: e.target.value })}
                      className="w-full text-brand-600 dark:text-brand-400 font-normal bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none py-2 text-[1rem]"
                      autoFocus
                    />
                    <input
                      placeholder="URL (https://...)"
                      value={editingPortfolio.url}
                      onChange={e => setEditingPortfolio({ ...editingPortfolio, url: e.target.value })}
                      className="w-full text-slate-500 text-[0.75rem] bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-brand-500 outline-none py-2 font-mono"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          if (!editingPortfolio.name || !editingPortfolio.url) return;
                          const exists = localPortfolios.find(p => p.id === editingPortfolio.id);
                          if (exists) {
                            setLocalPortfolios(localPortfolios.map(p => p.id === editingPortfolio.id ? editingPortfolio : p));
                          } else {
                            setLocalPortfolios([...localPortfolios, editingPortfolio]);
                          }
                          setEditingPortfolio(null);
                        }}
                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs rounded-lg font-bold"
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingPortfolio(null)} className="px-4 py-1.5 text-slate-500 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 no-scrollbar">
                  {localPortfolios.map(p => (
                    <div key={p.id}
                      className="p-4 rounded-xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden h-28 flex flex-col justify-center"
                      style={{ background: getGradientFromUrl(p.url) }}
                    >
                      <div className="relative z-10 pr-2 bg-black/20 p-2 rounded-lg backdrop-blur-[2px]">
                        <h4 className="text-[1rem] font-normal text-white mb-1 leading-tight drop-shadow-sm">{p.name || 'Untitled'}</h4>
                        <div className="text-[0.75rem] text-white/90 truncate font-mono drop-shadow-sm">{p.url}</div>
                      </div>
                      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-900/90 shadow-sm p-1 rounded-lg backdrop-blur-sm">
                        <button onClick={() => setEditingPortfolio(p)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-slate-500 dark:text-slate-400 hover:text-brand-600" title="Edit">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(p.url)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-slate-500 dark:text-slate-400 hover:text-emerald-500" title="Copy URL">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button onClick={() => setLocalPortfolios(localPortfolios.filter(i => i.id !== p.id))} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-500" title="Delete">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {localPortfolios.length === 0 && !editingPortfolio && (
                    <div className="col-span-full py-12 text-center opacity-40">
                      <p className="text-sm">No portfolios added yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-3 h-full flex flex-col">
                <div className="mb-2 flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Prompt for {activeTab?.replace('prompt:', '')}</h3>
                  <button onClick={handleReset} className="text-[10px] text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider">Reset to Default</button>
                </div>
                <textarea
                  value={localPrompts[activeTab as keyof PromptConfig]}
                  onChange={(e) => setLocalPrompts(prev => ({ ...prev, [activeTab]: e.target.value }))}
                  className="w-full h-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm leading-relaxed outline-none focus:border-brand-500 transition-colors resize-none"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
          <button onClick={handleSave} className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-600/20">Save Changes</button>
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [activePlatform, setActivePlatform] = useState<Platform>('fiverr');
  const [activeMode, setActiveMode] = useState<Mode>('deliverable');
  const [activeTone, setActiveTone] = useState<Tone>('standard');
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([]);
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [briefs, setBriefs] = useState<Brief[]>(() => {
    const saved = localStorage.getItem('briefly_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentBrief, setCurrentBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('briefly_theme') as Theme) || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [showOriginal, setShowOriginal] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customPrompts, setCustomPrompts] = useState<PromptConfig>(() => {
    const saved = localStorage.getItem('briefly_prompts');
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_PROMPTS;
  });

  // Portfolios
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => {
    const saved = localStorage.getItem('briefly_portfolios');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSavePortfolios = (newPortfolios: Portfolio[]) => {
    setPortfolios(newPortfolios);
    localStorage.setItem('briefly_portfolios', JSON.stringify(newPortfolios));
  };

  // API Config
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('briefly_api_config');
    return saved ? JSON.parse(saved) : {
      provider: 'gemini',
      keys: { gemini: '', openai: '' }
    };
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('briefly_history', JSON.stringify(briefs));
  }, [briefs]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('briefly_theme', theme);
  }, [theme]);

  const handleSavePrompts = (newPrompts: PromptConfig) => {
    setCustomPrompts(newPrompts);
    localStorage.setItem('briefly_prompts', JSON.stringify(newPrompts));
  };

  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem('briefly_api_config', JSON.stringify(newConfig));
  };

  const getActivePrompt = (platform: Platform, mode: Mode): string => {
    if (mode === 'deliverable') return customPrompts.deliverable;
    if (platform === 'email') return customPrompts.email;
    if (platform === 'fiverr') return customPrompts.fiverr;
    return customPrompts.upwork;
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const promptToUse = getActivePrompt(activePlatform, activeMode);
      // Pass provider and key
      const result = await generateContent(
        input,
        activePlatform,
        activeMode,
        promptToUse,
        apiConfig.provider,
        apiConfig.keys[apiConfig.provider],
        activeTone,
        portfolios.filter(p => selectedPortfolios.includes(p.id))
      );
      setBriefs([result, ...briefs]);
      setCurrentBrief(result);
      setInput('');
      setShowOriginal(false);
    } catch (error) {
      console.error(error);
      alert('Generation failed. Please check your API key and Internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const deleteBrief = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = briefs.filter(b => b.id !== id);
    setBriefs(updated);
    if (currentBrief?.id === id) setCurrentBrief(null);
  };

  const handleRegenerate = async () => {
    if (!currentBrief) return;
    setLoading(true);
    try {
      const promptToUse = getActivePrompt(currentBrief.platform, currentBrief.mode);
      const result = await generateContent(
        currentBrief.originalInput,
        currentBrief.platform,
        currentBrief.mode,
        promptToUse,
        apiConfig.provider,
        apiConfig.keys[apiConfig.provider],
        currentBrief.tone || 'standard',
        currentBrief.includedPortfolios || []
      );
      const updated = briefs.map(b => b.id === currentBrief.id ? result : b);
      setBriefs(updated);
      setCurrentBrief(result);
    } catch (error) {
      console.error(error);
      alert('Regeneration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentBrief) return;
    let text = "";
    if (currentBrief.mode === 'proposal') {
      text = `Subject: ${currentBrief.subject}\n\n` + (currentBrief.proposalSections?.map(s => s.content).join('\n\n') || "");
    } else {
      text = `# ${currentBrief.title}\n\nOVERVIEW\n${currentBrief.overview}\n\nSTEPS\n` + (currentBrief.steps?.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n') || "");
    }
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const updateField = (field: keyof Brief, value: any) => {
    if (!currentBrief) return;
    const updated = { ...currentBrief, [field]: value };
    setCurrentBrief(updated);
    setBriefs(briefs.map(b => b.id === updated.id ? updated : b));
  };

  return (
    <div className={`min-h-screen flex overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        prompts={customPrompts}
        onSave={handleSavePrompts}
        apiConfig={apiConfig}
        onSaveApiConfig={handleSaveApiConfig}
        portfolios={portfolios}
        onSavePortfolios={handleSavePortfolios}
      />

      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="fixed lg:relative h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden shrink-0"
      >
        <div className="w-[260px] h-full flex flex-col p-5">
          <div className="flex items-center gap-3 mb-6 min-h-[32px]">
            {!logoError ? (
              <img
                src="/briefly.webp"
                alt="Briefly Logo"
                className="h-12 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">B</div>
                <h1 className="font-bold uppercase tracking-tighter text-lg">Briefly</h1>
              </>
            )}
          </div>
          <button onClick={() => { setCurrentBrief(null); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} className="w-full py-3 mb-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-600/20">+ New Task</button>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">History</h2>
            {briefs.map(b => (
              <div key={b.id} className="relative group">
                <button
                  onClick={() => { setCurrentBrief(b); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}
                  className={`w-full text-left p-3 pr-10 rounded-xl text-[11px] transition-all flex flex-col gap-1 ${currentBrief?.id === b.id ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold'}`}
                >
                  <div className="truncate flex items-center gap-2"><span>{b.mode === 'proposal' ? '🖋️' : '🛠️'}</span> {b.title}</div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-tighter">{b.platform} • {new Date(b.timestamp).toLocaleDateString()}</div>
                </button>
                <button
                  onClick={(e) => deleteBrief(b.id, e)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all z-10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1">
            <div className="flex justify-between gap-1">
              <button onClick={() => setIsSettingsOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-500 hover:text-brand-500 uppercase tracking-widest transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </button>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex-1 flex items-center justify-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-500 hover:text-brand-500 uppercase tracking-widest transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <motion.div
                initial="idle"
                whileHover="hover"
                className="flex items-center justify-end h-8"
              >
                <div className="relative flex items-center justify-end h-8">
                  <motion.div
                    variants={{
                      idle: { width: 70, borderColor: 'rgba(92, 157, 241, 1)' },
                      hover: { width: 170, borderColor: 'rgba(66, 100, 148, 1)' }
                    }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    className="flex items-center justify-end bg-white dark:bg-slate-900 border-2 rounded-full h-8 overflow-hidden relative"
                  >
                    <motion.span
                      variants={{
                        idle: { opacity: 1, x: 0 },
                        hover: { opacity: 0, x: 10 }
                      }}
                      transition={{ duration: 0.8 }}
                      className="absolute right-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap cursor-default"
                    >
                      About
                    </motion.span>

                    <motion.div
                      variants={{
                        idle: { opacity: 0, x: -10 },
                        hover: { opacity: 1, x: 0 }
                      }}
                      transition={{ duration: 0.8 }}
                      className="flex items-center gap-2 px-2 whitespace-nowrap relative z-10"
                    >
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-400">Nazmul Haider</span>
                      <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                      <div className="flex items-center gap-2">
                        <a href="mailto:nhs69mkt@gmail.com" className="text-slate-400 hover:text-brand-500 transition-colors p-1 cursor-pointer relative z-20" title="Email">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg>
                        </a>
                        <a href="https://linkedin.com/in/nhshihab69" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-600 transition-colors p-1 cursor-pointer relative z-20" title="LinkedIn">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 h-screen overflow-y-auto no-scrollbar relative flex flex-col">
        <header className="sticky top-0 z-30 mt-5 px-3 md:px-8 py-3 flex items-center justify-between backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 min-h-[4rem]">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex-1 flex justify-center px-2 min-w-0">
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full max-w-lg flex-nowrap overflow-hidden">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`px-1 sm:px-4 py-2 rounded-lg text-base font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 flex-1 min-w-0 whitespace-nowrap ${activePlatform === p.id ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  <span className="shrink-0">{p.icon}</span> <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="w-8 md:w-10 shrink-0 hidden sm:block" />
        </header>

        <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 flex-1">
          {!currentBrief ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="text-center pt-6">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">Humanized <span className="text-brand-600">Briefs.</span></h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-xl mx-auto font-medium">The standard for professional creator-brand communication.</p>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {MODES.map(m => (
                    <button key={m.id} onClick={() => setActiveMode(m.id)} className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeMode === m.id ? 'bg-white dark:bg-slate-800 shadow text-brand-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>{m.icon} {m.label}</button>
                  ))}
                </div>
              </div>

              <div className="relative group max-w-3xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">

                  <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Paste requirements for your ${activeMode} here...`} className="w-full min-h-[200px] bg-transparent outline-none text-[1rem] resize-none placeholder-slate-400 font-medium no-scrollbar" />
                  <div className="flex flex-col md:flex-row justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
                    <div className="flex gap-2 w-full md:w-auto overflow-visible">
                      <select
                        value={activeTone}
                        onChange={(e) => setActiveTone(e.target.value as Tone)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-brand-500 cursor-pointer"
                      >
                        {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>

                      {portfolios.length > 0 && activeMode === 'proposal' && (
                        <div className="relative">
                          {isPortfolioMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsPortfolioMenuOpen(false)} />}
                          <button
                            onClick={() => setIsPortfolioMenuOpen(!isPortfolioMenuOpen)}
                            className={`relative z-50 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold outline-none flex items-center gap-2 whitespace-nowrap transition-all ${isPortfolioMenuOpen || selectedPortfolios.length > 0 ? 'border-brand-600 text-brand-600 bg-brand-50 dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-500'}`}
                          >
                            <span>Attach Portfolio {selectedPortfolios.length > 0 && `(${selectedPortfolios.length})`}</span>
                            <svg className={`w-3 h-3 transition-transform ${isPortfolioMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {isPortfolioMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 animate-in slide-in-from-bottom-2 fade-in-20">
                              {portfolios.map(p => (
                                <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPortfolios.includes(p.id) ? 'bg-brand-600 border-brand-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                                    {selectedPortfolios.includes(p.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={selectedPortfolios.includes(p.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedPortfolios([...selectedPortfolios, p.id]);
                                      else setSelectedPortfolios(selectedPortfolios.filter(id => id !== p.id));
                                    }}
                                    className="hidden"
                                  />
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{p.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{p.url}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={handleGenerate} disabled={loading || !input.trim()} className="w-full md:w-auto bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-12 py-3 md:py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-3">
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Generate Now"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">{currentBrief.mode}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{currentBrief.platform}</span>
                  </div>
                  <input className="bg-transparent border-none outline-none text-3xl md:text-5xl font-bold w-full tracking-tighter" value={currentBrief.title} onChange={(e) => updateField('title', e.target.value)} />
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto">
                  {currentBrief.platform === 'email' && (
                    <a href={`mailto:?subject=${encodeURIComponent(currentBrief.subject || '')}&body=${encodeURIComponent(currentBrief.proposalSections?.map(s => s.content).join('\n\n') || '')}`} className="flex-1 md:flex-none px-6 py-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center">Open Mail</a>
                  )}
                  <button onClick={handleCopy} className="flex-1 md:flex-none px-10 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-brand-600/10 shrink-0">Copy Content</button>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button onClick={() => setShowOriginal(!showOriginal)} className="w-full flex justify-between items-center p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">View Source Notes <span className={`transition-transform duration-300 ${showOriginal ? 'rotate-180' : ''}`}>▼</span></button>
                <AnimatePresence>{showOriginal && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 overflow-hidden"><div className="p-5 bg-white/50 dark:bg-slate-950/50 rounded-xl text-xs leading-relaxed text-slate-500 whitespace-pre-wrap font-mono no-scrollbar">{currentBrief.originalInput}</div></motion.div>}</AnimatePresence>
              </div>

              {currentBrief.mode === 'deliverable' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Project Workflow</h3>
                      <div className="space-y-8 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800 z-0" />
                        {currentBrief.steps?.map((step, i) => (
                          <div key={i} className="relative z-10 flex gap-8">
                            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-lg shadow-brand-600/20">{i + 1}</div>
                            <div className="flex-1">
                              <input className="font-bold text-lg bg-transparent border-none outline-none w-full mb-2" value={step.title} onChange={(e) => { const s = [...currentBrief.steps!]; s[i].title = e.target.value; updateField('steps', s); }} />
                              <AutoResizeTextarea className="text-slate-500 dark:text-slate-400 text-[1rem] bg-transparent border-none outline-none w-full leading-relaxed" value={step.description} onChange={(e: any) => { const s = [...currentBrief.steps!]; s[i].description = e.target.value; updateField('steps', s); }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Strategic Overview</h3>
                      <AutoResizeTextarea className="w-full bg-transparent border-none outline-none text-[1rem] leading-relaxed font-medium" value={currentBrief.overview} onChange={(e: any) => updateField('overview', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-3xl">
                      <h3 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-6">Final Deliverables</h3>
                      {currentBrief.deliverables?.map((d, i) => (
                        <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <AutoResizeTextarea className="text-xs font-bold bg-transparent outline-none w-full leading-relaxed" value={d} onChange={(e: any) => { const updated = [...currentBrief.deliverables!]; updated[i] = e.target.value; updateField('deliverables', updated); }} />
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl">
                      <h3 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-6">Requirements</h3>
                      {currentBrief.requirements?.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
                          <span className="text-amber-500 font-bold shrink-0">→</span>
                          <AutoResizeTextarea className="text-xs font-bold bg-transparent outline-none w-full leading-relaxed" value={r} onChange={(e: any) => { const updated = [...currentBrief.requirements!]; updated[i] = e.target.value; updateField('requirements', updated); }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto w-full">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
                    <div className="mb-8 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border-l-4 border-brand-500">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Subject Line</label>
                      <AutoResizeTextarea className="w-full bg-transparent font-bold border-none outline-none text-[1rem]" value={currentBrief.subject} onChange={(e: any) => updateField('subject', e.target.value)} />
                    </div>
                    <div className="space-y-8">
                      {currentBrief.proposalSections?.map((section, idx) => (
                        <div key={idx} className="group relative">
                          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3 block">{section.label}</span>
                          <AutoResizeTextarea
                            className="w-full bg-transparent border-none outline-none text-[1rem] leading-relaxed font-medium no-scrollbar"
                            minRows={2}
                            value={section.content}
                            onChange={(e: any) => {
                              const sections = [...currentBrief.proposalSections!];
                              sections[idx].content = e.target.value;
                              updateField('proposalSections', sections);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-200/50 dark:border-slate-800/50 mt-8 space-y-4">
                <button onClick={handleRegenerate} disabled={loading} className="px-12 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-brand-600/20 active:scale-95 flex items-center gap-4 disabled:opacity-50">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "🔄 Regenerate Output"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div >
  );
};

export default App;
