import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Sun,
  Moon,
  X,
  Menu,
  Play,
  RotateCcw,
  LayoutGrid,
  Bug,
  Check,
  ChevronRight,
  Database,
  Sliders,
  Activity,
  BarChart3,
  TrendingUp,
  PieChart,
  Move,
  Layers,
  Sparkles,
  Zap,
  Award,
  Globe2,
  Command,
  Filter,
  ShieldCheck,
  Building2,
  FolderKanban,
  Users,
  Coins,
  FileCheck2
} from 'lucide-react';
import { fetchApiHealth, fetchErdSummary, API_BASE_URL } from './config/api';
import GrindsetLogoNodes from './components/GrindsetLogoNodes';

export default function App() {
  // Day Mode enabled by default as requested!
  const [lightMode, setLightMode] = useState(true);
  const [activePill, setActivePill] = useState('plan');
  const [apiHealth, setApiHealth] = useState({ Status: 'Checking...', System: 'ASP.NET Core Web API' });
  const [erdSummary, setErdSummary] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('SuperAdmin');

  // Motion & Interactive State
  const [sprintProgress, setSprintProgress] = useState(76);
  const [allocatedBudget, setAllocatedBudget] = useState(380000);
  const [teamCapacity, setTeamCapacity] = useState(88);
  const [selectedMetricPeriod, setSelectedMetricPeriod] = useState('Q4 2026');

  useEffect(() => {
    async function loadStatus() {
      try {
        const health = await fetchApiHealth();
        if (health) setApiHealth(health);
        const summary = await fetchErdSummary();
        if (summary) setErdSummary(summary);
      } catch (err) {
        console.log('API Status check:', err);
      }
    }
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lightMode) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    }
  }, [lightMode]);

  const pillTabs = [
    { id: 'plan', label: 'Plan' },
    { id: 'track', label: 'Track' },
    { id: 'release', label: 'Release' },
    { id: 'report', label: 'Report' },
    { id: 'automate', label: 'Automate' }
  ];

  // BKlit.ui Dummy Chart Visual Data
  const chartData = [
    { label: 'Sprint 1', velocity: 45, budget: 30 },
    { label: 'Sprint 2', velocity: 68, budget: 52 },
    { label: 'Sprint 3', velocity: 85, budget: 70 },
    { label: 'Sprint 4', velocity: 92, budget: 88 },
    { label: 'Sprint 5', velocity: 78, budget: 64 },
    { label: 'Sprint 6', velocity: 96, budget: 91 }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${lightMode ? 'bg-[#FFFFFF] text-[#091E42]' : 'bg-[#07132B] text-[#F4F5F7]'}`}>
      
      {/* 1. Global Navigation Header with Mobile Drawer */}
      <header className={`sticky top-0 z-50 border-b transition-colors duration-200 ${lightMode ? 'bg-white/95 border-[#DFE1E6]' : 'bg-[#07132B]/95 border-[#1E2D4A]'} backdrop-blur-md`}>
        <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between py-0 h-16">
          
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Top-Left Atlassian Blue Square Badge */}
            <div className="w-10 sm:w-12 h-16 bg-[#0052CC] flex items-center justify-center text-white -ml-4 sm:-ml-8 lg:-ml-12 font-black text-xl shadow-md">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 fill-current text-white" viewBox="0 0 24 24">
                <path d="M11.53 2C6.45 2 2.31 6.14 2.31 11.22c0 5.08 4.14 9.22 9.22 9.22 5.08 0 9.22-4.14 9.22-9.22C20.75 6.14 16.61 2 11.53 2zm4.71 13.06l-4.71 2.72-4.71-2.72v-5.44l4.71-2.72 4.71 2.72v5.44z" />
              </svg>
            </div>

            {/* Official GrindSet 3-Tier RBC Node Logo Component */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center cursor-pointer pl-1 sm:pl-2"
            >
              <GrindsetLogoNodes isDark={!lightMode} className="w-36 sm:w-48 h-auto" />
            </motion.div>

            {/* Desktop Menu Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold pl-4">
              <a href="#single-source" className="hover:text-[#0052CC] transition-colors">Features ▾</a>
              <a href="#bklit-charts" className="hover:text-[#0052CC] transition-colors">Solutions ▾</a>
              <a href="#kokonut-bento" className="hover:text-[#0052CC] transition-colors">Guides</a>
              <a href="#scale" className="hover:text-[#0052CC] transition-colors">Templates ▾</a>
              <a href={`${API_BASE_URL}/swagger`} target="_blank" rel="noreferrer" className="hover:text-[#0052CC] transition-colors flex items-center space-x-1">
                <span>Pricing</span>
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {/* Kokonut.ui Search Bar Preview */}
            <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
              lightMode ? 'bg-[#F4F5F7] border-[#DFE1E6] text-[#42526E]' : 'bg-[#0B1B3D] border-[#1E2D4A] text-[#B3D4FF]'
            }`}>
              <Command className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Search ERP...</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">⌘K</span>
            </div>

            {/* Live API Node Pill */}
            <div className={`hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
              lightMode ? 'bg-[#F4F5F7] border-[#DFE1E6] text-[#42526E]' : 'bg-[#0B1B3D] border-[#1E2D4A] text-[#B3D4FF]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${(apiHealth?.Status === 'Healthy' || apiHealth?.status === 'Healthy') ? 'bg-[#36B37E]' : 'bg-[#FFAB00]'}`} />
              <span>{(apiHealth?.Status === 'Healthy' || apiHealth?.status === 'Healthy') ? 'ASP.NET Node Active' : 'API Standby'}</span>
            </div>

            {/* Theme Toggle Switch */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLightMode(!lightMode)}
              aria-label="Toggle Theme"
              className={`p-2 rounded border transition-all ${
                lightMode
                  ? 'bg-[#F4F5F7] border-[#DFE1E6] text-[#0052CC] hover:bg-[#EBECF0]'
                  : 'bg-[#0B1B3D] border-[#1E2D4A] text-[#FFAB00] hover:bg-[#1E2D4A]'
              }`}
            >
              {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>

            {/* Get it free CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsLoginModalOpen(true)}
              className="btn-jira-blue px-3 sm:px-5 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-bold shadow-sm"
            >
              Get it free
            </motion.button>

            {/* Sign In Button */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden sm:inline-block text-xs sm:text-sm font-bold hover:text-[#0052CC] transition-colors"
            >
              Sign In
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-[#0052CC] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`lg:hidden border-b px-6 py-4 space-y-3 font-semibold text-sm ${
                lightMode ? 'bg-white border-[#DFE1E6] text-[#091E42]' : 'bg-[#0B1B3D] border-[#1E2D4A] text-white'
              }`}
            >
              <a href="#single-source" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#0052CC]">Features</a>
              <a href="#bklit-charts" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#0052CC]">Solutions</a>
              <a href="#kokonut-bento" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#0052CC]">ERP Subsystems</a>
              <a href="#scale" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-[#0052CC]">Scaling Plans</a>
              <a href={`${API_BASE_URL}/swagger`} target="_blank" rel="noreferrer" className="block py-1 text-[#0052CC] font-bold">Swagger OpenAPI Docs ↗</a>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                  className="w-full py-2 bg-[#0052CC] text-white rounded font-bold text-center"
                >
                  Sign In / Access Portal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Responsive Hero Section */}
      <section className="pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-12 lg:px-16 w-full max-w-[1650px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-4 sm:space-y-6 text-left"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight">
              Move fast, stay aligned, <br className="hidden sm:inline" />
              and build better - together
            </h1>
            <p className={`text-base sm:text-xl lg:text-2xl font-medium ${lightMode ? 'text-[#42526E]' : 'text-[#B3D4FF]'}`}>
              The #1 software development tool used by agile teams
            </p>

            <div className="pt-2 sm:pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginModalOpen(true)}
                className="btn-jira-gold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-xl w-full sm:w-auto"
              >
                Get it free
              </motion.button>
            </div>
          </motion.div>

          {/* Hero Graphic Container */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-xl border ${
              lightMode ? 'bg-[#FAFBFC] border-[#DFE1E6]' : 'bg-[#0B1B3D] border-[#1E2D4A]'
            }`}>
              <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-[#DFE1E6] dark:border-[#1E2D4A]">
                <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold">
                  <span className="text-[#36B37E]">v Releases</span>
                  <span className={lightMode ? 'text-[#5E6C84]' : 'text-slate-400'}>ETL-160 Subscriptions</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono flex items-center space-x-1">
                  <Move className="w-3 h-3 text-[#0052CC]" />
                  <span>Tasks Queue</span>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 text-xs font-mono">
                {[
                  { key: 'ETL-164 Selection', status: 'IN PROGRESS', color: 'bg-[#0052CC]' },
                  { key: 'ETL-166 Transaction Ledger', status: 'IN PROGRESS', color: 'bg-[#0052CC]' },
                  { key: 'ETL-168 Quick booking...', status: 'TO DO', color: 'bg-[#42526E]' },
                  { key: 'ETL-169 Options & Payment', status: 'TO DO', color: 'bg-[#42526E]' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 sm:p-3.5 rounded-xl border flex justify-between items-center ${
                      lightMode ? 'bg-white border-[#DFE1E6] text-[#091E42]' : 'bg-[#172B4D] border-[#253858] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 truncate mr-2">
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0052CC] shrink-0" />
                      <span className="font-semibold truncate">{item.key}</span>
                    </div>
                    <span className={`px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] ${item.color} text-white font-bold tracking-wider shrink-0`}>
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. Wide "All from a single source of truth" Section */}
      <section id="single-source" className="py-12 sm:py-20 px-4 sm:px-12 lg:px-16 w-full max-w-[1650px] mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 sm:mb-10">
          All from a single source of truth
        </h2>

        {/* Mint Floating Pill Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10 sm:mb-14">
          {pillTabs.map((p) => {
            const isActive = activePill === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePill(p.id)}
                className={`relative px-5 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-base transition-all ${
                  isActive
                    ? 'bg-[#36B37E] text-white shadow-lg shadow-[#36B37E]/25'
                    : lightMode
                      ? 'bg-[#F4F5F7] text-[#42526E] hover:bg-[#EBECF0]'
                      : 'bg-[#172B4D] text-[#B3D4FF] hover:bg-[#253858]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Plan Tab Grid Showcase */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 text-left items-center">
          
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Plan</h3>
            <p className={`text-base sm:text-lg leading-relaxed ${lightMode ? 'text-[#42526E]' : 'text-[#B3D4FF]'}`}>
              Break the big ideas down into manageable chunks across teams with user stories, issues, and tasks.
            </p>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-[#0052CC] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 relative"
            >
              <div className="text-4xl sm:text-5xl font-serif text-sky-200">“</div>
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                Work becomes a lot more visible when it's all in one place. It makes collaboration a whole lot easier.
              </p>
              <div className="pt-3 border-t border-blue-400/40 text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                JEFF LAI • INTERNAL INFRASTRUCTURE, CANVA
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <div className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl border ${lightMode ? 'bg-[#FAFBFC] border-[#DFE1E6]' : 'bg-[#0B1B3D] border-[#1E2D4A]'}`}>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#DFE1E6] dark:border-[#1E2D4A]">
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-bold">
                  <span className="text-[#0052CC]">Beyond Gravity Project</span>
                  <span className="text-slate-400">/ Board</span>
                </div>
                <button className="px-3 sm:px-4 py-1.5 bg-[#0052CC] text-white rounded-lg text-xs font-bold shadow-sm">Create</button>
              </div>

              {/* Kanban Column Responsive Grid (Stack on small screens) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-bold text-slate-500 pb-2 border-b border-[#DFE1E6] dark:border-[#1E2D4A]">TO DO 6</div>
                  <motion.div whileHover={{ scale: 1.03 }} className={`p-3 rounded-xl border space-y-2 ${lightMode ? 'bg-white border-[#DFE1E6]' : 'bg-[#172B4D] border-[#253858]'}`}>
                    <div className="text-xs font-semibold">Optimize experience for mobile</div>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-bold">BILLING</span>
                  </motion.div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-bold text-[#FFAB00] pb-2 border-b border-[#DFE1E6] dark:border-[#1E2D4A]">IN PROGRESS 6</div>
                  <motion.div whileHover={{ scale: 1.03 }} className="p-3 rounded-xl bg-[#FFAB00]/10 border border-[#FFAB00]/40 space-y-2">
                    <div className="text-xs font-semibold text-amber-800 dark:text-amber-200">Fact trip search</div>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">ACCOUNTS</span>
                  </motion.div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-bold text-cyan-600 pb-2 border-b border-[#DFE1E6] dark:border-[#1E2D4A]">IN REVIEW 6</div>
                  <motion.div whileHover={{ scale: 1.03 }} className={`p-3 rounded-xl border space-y-2 ${lightMode ? 'bg-white border-[#DFE1E6]' : 'bg-[#172B4D] border-[#253858]'}`}>
                    <div className="text-xs font-semibold">Revise booking flow</div>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] bg-cyan-100 text-cyan-800 font-bold">ACCOUNTS</span>
                  </motion.div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-bold text-[#36B37E] pb-2 border-b border-[#DFE1E6] dark:border-[#1E2D4A]">DONE 6</div>
                  <motion.div whileHover={{ scale: 1.03 }} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">Customers cart issues</div>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">ACCOUNTS</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Responsive BKlit.ui Analytics & Charts Section */}
      <section id="bklit-charts" className="py-12 sm:py-20 px-4 sm:px-12 lg:px-16 w-full max-w-[1650px] mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0052CC]/10 text-[#0052CC] text-xs font-mono font-bold mb-3 sm:mb-4">
            <BarChart3 className="w-4 h-4" />
            <span>BKlit.ui Analytics & Visual Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Real-Time Enterprise Velocity & Ledger Visuals
          </h2>
        </div>

        <div className={`p-5 sm:p-12 rounded-2xl sm:rounded-3xl border shadow-xl ${lightMode ? 'bg-[#FAFBFC] border-[#DFE1E6]' : 'bg-[#0B1B3D] border-[#1E2D4A]'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 sm:pb-8 mb-6 sm:mb-8 border-b border-[#DFE1E6] dark:border-[#1E2D4A] gap-4">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold">Sprint Velocity vs Budget Allocation</h3>
              <p className={`text-xs sm:text-sm mt-1 ${lightMode ? 'text-[#5E6C84]' : 'text-slate-400'}`}>Live telemetry across 6 active enterprise sprints</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-mono">
              {['Q3 2026', 'Q4 2026'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedMetricPeriod(p)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold transition-all ${
                    selectedMetricPeriod === p ? 'bg-[#0052CC] text-white shadow' : 'bg-slate-200 dark:bg-[#172B4D] text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chart container with horizontal scroll fall-back on ultra small screens */}
          <div className="overflow-x-auto pb-2">
            <div className="h-56 sm:h-64 min-w-[320px] flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 pt-4 border-b border-[#DFE1E6] dark:border-[#1E2D4A] pb-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 sm:gap-3 group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-40 sm:h-48">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${d.velocity}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="w-1/2 bg-[#36B37E] rounded-t hover:bg-emerald-400 transition-colors relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded font-mono z-10">
                        {d.velocity}%
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${d.budget}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 + 0.05 }}
                      className="w-1/2 bg-[#0052CC] rounded-t hover:bg-blue-400 transition-colors relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded font-mono z-10">
                        ${d.budget}k
                      </span>
                    </motion.div>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-mono font-bold ${lightMode ? 'text-[#5E6C84]' : 'text-slate-400'}`}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mt-4 sm:mt-6 text-xs sm:text-sm font-mono font-bold">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#36B37E] rounded" />
              <span>Sprint Velocity Index</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#0052CC] rounded" />
              <span>Budget Utilized ($k)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 5. Responsive Kokonut.ui Bento Suite */}
      <section id="kokonut-bento" className="py-12 sm:py-20 px-4 sm:px-12 lg:px-16 w-full max-w-[1650px] mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#36B37E]/10 text-[#36B37E] text-xs font-mono font-bold mb-3 sm:mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Kokonut.ui Ready-Made Component Suite</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Integrated 20-Table ERD Subsystem Bento Suite
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {[
            { title: 'Identity & Governance', icon: ShieldCheck, tables: 'USER, ADMIN, AUDIT_LOG', desc: 'SSO, 3-tier RBAC security, and immutable audit logs.' },
            { title: 'Workforce Directory', icon: Building2, tables: 'COMPANY, DEPARTMENT, EMPLOYEE', desc: 'Corporate hierarchy, designations, and hourly rate management.' },
            { title: 'Portfolio Management', icon: FolderKanban, tables: 'PROJECT, TIMELINE, SCOPE', desc: 'Multi-project baselines, timeline status, and archives.' },
            { title: 'Resource Intelligence', icon: Users, tables: 'ASSIGNMENT, STAKEHOLDER', desc: 'Skill-based assignments and extension approval chains.' },
            { title: 'Financial Engineering', icon: Coins, tables: 'ACCOUNT, BUDGET_ALERT, REPORT', desc: 'Multi-account ledgers, variance alerts, and P&L reports.' },
            { title: 'Audit & Compliance', icon: FileCheck2, tables: 'TRANSACTION, EXPORT', desc: 'Real-time transaction logs and multi-format PDF exports.' }
          ].map((c, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border flex flex-col justify-between cursor-pointer ${
                lightMode ? 'bg-[#FAFBFC] border-[#DFE1E6] hover:border-[#0052CC]' : 'bg-[#0B1B3D] border-[#1E2D4A]'
              }`}
            >
              <div>
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center mb-4 sm:mb-6">
                  <c.icon className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{c.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 ${lightMode ? 'text-[#42526E]' : 'text-[#B3D4FF]'}`}>{c.desc}</p>
              </div>
              <div className="text-[10px] sm:text-xs font-mono text-[#0052CC] dark:text-cyan-400 bg-slate-100 dark:bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold">
                {c.tables}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Responsive Scaling Pipeline Section */}
      <section id="scale" className="py-12 sm:py-20 px-4 sm:px-12 lg:px-16 w-full max-w-[1650px] mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4">
          Built for teams of 1 to 35,000
        </h2>
        <p className={`text-sm sm:text-lg max-w-4xl mx-auto leading-relaxed mb-10 sm:mb-16 ${lightMode ? 'text-[#42526E]' : 'text-[#B3D4FF]'}`}>
          A growing team doesn't need to mean growing pains. With best-of-breed features, security, privacy, and the right tool for every step of your journey - Jira Software allows you to scale without friction.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-10 sm:mb-16 text-center text-xs">
          {[
            { tag: 'FREE', title: 'Jira Software free forever for teams up to 10' },
            { tag: 'STANDARD', title: 'Jira Software Standard for growing teams' },
            { tag: 'PREMIUM', title: 'Scale across teams with Jira Software Premium' },
            { tag: 'ENTERPRISE', title: 'Connect and accelerate your entire enterprise' },
            { tag: 'ALIGN', title: 'Enterprise agility with Jira Align' }
          ].map((n, idx) => (
            <div key={idx} className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between ${
              lightMode ? 'bg-[#FAFBFC] border-[#DFE1E6]' : 'bg-[#0B1B3D] border-[#1E2D4A]'
            }`}>
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-[#0052CC] text-white font-bold flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xs">
                {n.tag}
              </div>
              <div className="font-semibold text-xs sm:text-sm leading-snug">{n.title}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="btn-jira-gold px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-xl inline-block w-full sm:w-auto"
        >
          Get it free
        </button>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 sm:py-10 px-4 sm:px-12 lg:px-16 w-full max-w-[1650px] mx-auto text-xs ${lightMode ? 'border-[#DFE1E6] text-[#5E6C84]' : 'border-[#1E2D4A] text-[#8993A4]'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <GrindsetLogoNodes isDark={!lightMode} className="w-36 sm:w-40 h-auto" />
          </div>
          <div className="text-xs sm:text-sm">Powered by .NET 8 ASP.NET Core API & React 18</div>
          <div className="text-xs sm:text-sm">© 2026 GrindSet ERP. All rights reserved.</div>
        </div>
      </footer>

      {/* Clean Portal Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative ${lightMode ? 'bg-white border-[#DFE1E6]' : 'bg-[#0B1B3D] border-[#1E2D4A]'}`}
            >
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded bg-[#0052CC] text-white font-bold flex items-center justify-center mx-auto mb-2 text-lg">
                  G
                </div>
                <h3 className="text-xl font-bold">GrindSet ERP Access</h3>
                <p className={`text-xs mt-1 ${lightMode ? 'text-[#5E6C84]' : 'text-[#8993A4]'}`}>Select a role profile to log in</p>
              </div>

              <div className={`grid grid-cols-3 gap-1 mb-4 p-1 rounded border text-xs ${lightMode ? 'bg-[#F4F5F7] border-[#DFE1E6]' : 'bg-[#172B4D] border-[#253858]'}`}>
                {['SuperAdmin', 'CompanyOwner', 'Employee'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`py-1.5 rounded font-semibold transition-all ${
                      selectedRole === role ? 'bg-[#0052CC] text-white shadow-sm' : 'text-[#8993A4]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className={`block font-semibold mb-1 ${lightMode ? 'text-[#5E6C84]' : 'text-[#8993A4]'}`}>Email Address</label>
                  <input
                    type="email"
                    readOnly
                    value={
                      selectedRole === 'SuperAdmin' ? 'admin@grindset.io' :
                      selectedRole === 'CompanyOwner' ? 'corp@acmeglobal.com' : 'john.dev@grindset.io'
                    }
                    className={`w-full border rounded px-3 py-2 ${lightMode ? 'bg-[#FAFBFC] border-[#DFE1E6]' : 'bg-[#172B4D] border-[#253858] text-white'}`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${lightMode ? 'text-[#5E6C84]' : 'text-[#8993A4]'}`}>Password</label>
                  <input
                    type="password"
                    readOnly
                    value="••••••••••••"
                    className={`w-full border rounded px-3 py-2 ${lightMode ? 'bg-[#FAFBFC] border-[#DFE1E6]' : 'bg-[#172B4D] border-[#253858] text-white'}`}
                  />
                </div>

                <button
                  onClick={() => {
                    alert(`Authenticated successfully as ${selectedRole}! Live ASP.NET Core ERP session active.`);
                    setIsLoginModalOpen(false);
                  }}
                  className="w-full py-2.5 rounded btn-jira-gold text-sm shadow transition-all mt-2"
                >
                  Log In to GrindSet ERP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
