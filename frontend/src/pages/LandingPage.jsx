import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, ArrowRight, Zap, Shield, BarChart3,
  Users, FolderKanban, Coins, ShieldAlert, CheckCircle2,
  ChevronRight, Activity, Sparkles, Lock,
  HelpCircle, ChevronDown, Check, X, UserPlus, Play, Pause,
  TrendingUp, Clock, FileText, CheckCircle
} from 'lucide-react';
import { fetchApiHealth, fetchErdSummary } from '../config/api';
import GrindsetLogoNodes from '../components/GrindsetLogoNodes';
import AuthModal from '../components/AuthModal';

export default function LandingPage({ lightMode, setLightMode }) {
  const [apiHealth, setApiHealth] = useState({ Status: 'Healthy' });
  const [erdSummary, setErdSummary] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [activeTab, setActiveTab] = useState('workforce');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const isDark = !lightMode;

  useEffect(() => {
    fetchApiHealth().then(h => { if (h) setApiHealth(h); });
    fetchErdSummary().then(s => { if (s) setErdSummary(s); });
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light', lightMode);
    document.body.classList.toggle('dark', !lightMode);
  }, [lightMode]);

  const apiOnline = apiHealth?.Status === 'Healthy' || apiHealth?.status === 'Healthy';

  // Subsystems Tab Content (Auto-cycling)
  const subsystems = [
    {
      id: 'workforce',
      title: 'Workforce & Team Directory',
      subtitle: 'Manage employee profiles, designations, and billable hours effortlessly.',
      icon: Users,
      color: '#57D9A3',
      badge: 'Human Resources',
      desc: 'Centralize your entire workforce data. Track team roles, department structures, hourly billing rates, and staff status in real time.',
      preview: {
        header: 'Live Team Directory Stream',
        items: [
          { name: 'Sarah Connor', role: 'Operations Lead', dept: 'Operations', rate: '$110/hr', status: 'Active' },
          { name: 'John Doe', role: 'Senior Staff Engineer', dept: 'Engineering', rate: '$95/hr', status: 'Active' },
          { name: 'Alex Vance', role: 'DevOps Specialist', dept: 'Infrastructure', rate: '$85/hr', status: 'Active' }
        ]
      }
    },
    {
      id: 'projects',
      title: 'Project Boards & Sprint Tracking',
      subtitle: 'Keep projects on schedule with real-time budget and progress metrics.',
      icon: FolderKanban,
      color: '#FFDA75',
      badge: 'Operations & Agile',
      desc: 'Kanban boards, milestone tracking, and task allocations tied directly to live project budgets and resource availability.',
      preview: {
        header: 'Active Operations & Sprints',
        items: [
          { name: 'Enterprise Platform Rollout', budget: '$250,000', progress: '78% Complete', status: 'On Track' },
          { name: 'Security Gateway Integration', budget: '$65,000', progress: '100% Complete', status: 'Delivered' },
          { name: 'Financial Ledger Upgrade', budget: '$120,000', progress: '60% Complete', status: 'In Progress' }
        ]
      }
    },
    {
      id: 'finance',
      title: 'Financial Accounting & Ledgers',
      subtitle: 'Automated expense tracking with real-time budget overrun safeguards.',
      icon: Coins,
      color: '#BF9AFF',
      badge: 'Finance & Accounting',
      desc: 'Multi-account financial reporting, automated expense approvals, and real-time alerts when department spending approaches budget caps.',
      preview: {
        header: 'Departmental Ledger Accounts',
        items: [
          { name: 'Engineering Operations', budget: '$150,000 Total', balance: '$112,500 Available', alert: 'Healthy' },
          { name: 'Cloud Infrastructure', budget: '$45,000 Total', balance: '$38,200 Available', alert: 'Healthy' },
          { name: 'Security Audit & Compliance', budget: '$25,000 Total', balance: '$19,800 Available', alert: 'Healthy' }
        ]
      }
    },
    {
      id: 'audit',
      title: 'Security & Compliance Audit Trail',
      subtitle: 'Automated event logging for regulatory peace of mind.',
      icon: ShieldAlert,
      color: '#FF8F73',
      badge: 'Enterprise Security',
      desc: 'Every key transaction, user action, and system authorization is automatically recorded into tamper-proof audit trails.',
      preview: {
        header: 'Live Security Audit Stream',
        items: [
          { action: 'Team Member Registered', entity: 'Alex Vance (Engineer)', time: 'Just now', badge: 'Verified' },
          { action: 'Project Expense Logged', entity: 'Infrastructure Account', time: '2m ago', badge: 'Approved' },
          { action: 'Security Policy Updated', entity: 'Global Access Rules', time: '1h ago', badge: 'Enforced' }
        ]
      }
    }
  ];

  // Auto-play interval for Subsystems Showcase
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveTab(current => {
        const currentIndex = subsystems.findIndex(s => s.id === current);
        const nextIndex = (currentIndex + 1) % subsystems.length;
        return subsystems[nextIndex].id;
      });
    }, 3800);
    return () => clearInterval(interval);
  }, [isAutoPlaying, subsystems]);

  // Business Permission Matrix (Business Owners vs Employees)
  const businessMatrix = [
    { feature: 'View Assigned Projects & Tasks', employee: true, company: true },
    { feature: 'Log Billable Hours & Work Logs', employee: true, company: true },
    { feature: 'Submit Expenses & Reimbursements', employee: true, company: true },
    { feature: 'Onboard & Manage Team Staff', employee: false, company: true },
    { feature: 'Allocate Project Budgets & Caps', employee: false, company: true },
    { feature: 'Reallocate Funds & Overrun Alerts', employee: false, company: true },
    { feature: 'Access Company Security & Audit Logs', employee: false, company: true },
  ];

  // Core Value Pillars
  const valuePillars = [
    { title: 'Lightning Fast Performance', category: 'Efficiency', icon: Zap, color: '#4C9AFF', desc: 'Instant page transitions and zero-wait data loads keep your entire team operating at peak productivity.' },
    { title: 'Bank-Grade Data Protection', category: 'Privacy & Security', icon: Shield, color: '#57D9A3', desc: 'Granular permissions ensure sensitive financial records and staff information remain strictly confidential.' },
    { title: 'Automated Financial Controls', category: 'Smart Accounting', icon: BarChart3, color: '#BF9AFF', desc: 'Real-time ledger tracking prevents budget overruns before they occur with automated smart notifications.' },
    { title: 'Seamless Workforce Alignment', category: 'Team Collaboration', icon: Users, color: '#FFDA75', desc: 'Keep remote, hybrid, and in-office teams in sync across all project deadlines and company objectives.' },
  ];

  // Business FAQs
  const faqs = [
    {
      q: 'How does GrindSet ERP help my business scale?',
      a: 'GrindSet ERP consolidates your team management, project workflows, and financial ledgers into a single unified platform, eliminating scattered tools and manual data entry.'
    },
    {
      q: 'What roles are available when creating an account?',
      a: 'You can sign up as a Company Owner (to manage your organization, staff, and budgets) or join as an Employee / Team Member (to collaborate on projects and log billable work).'
    },
    {
      q: 'How are sensitive financial and employee records protected?',
      a: 'GrindSet ERP enforces strict Role-Based Access Controls. Employees only see the projects and tasks assigned to them, while financial ledgers and company settings are restricted to business owners.'
    },
    {
      q: 'Is GrindSet ERP suitable for remote and hybrid teams?',
      a: 'Yes! GrindSet ERP is engineered for real-time remote collaboration, allowing team members across different locations to stay synchronized on project timelines and milestones.'
    }
  ];

  // Color tokens
  const bg = isDark ? '#070F1F' : '#F0F2F5';
  const textPrimary = isDark ? '#F4F5F7' : '#091E42';
  const textMuted = isDark ? '#8993A4' : '#5E6C84';
  const cardBg = isDark ? 'rgba(11, 27, 61, 0.75)' : 'rgba(255, 255, 255, 0.95)';
  const border = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div style={{ background: bg, color: textPrimary, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Animated Glowing Ambient Orbs */}
      {isDark && (
        <>
          <div className="orb" style={{ width: 650, height: 650, background: 'radial-gradient(circle, #0052CC 0%, transparent 70%)', opacity: 0.16, top: -180, right: -180, position: 'fixed', animationDelay: '0s' }} />
          <div className="orb" style={{ width: 550, height: 550, background: 'radial-gradient(circle, #6554C0 0%, transparent 70%)', opacity: 0.14, bottom: 40, left: -180, position: 'fixed', animationDelay: '3s' }} />
          <div className="orb" style={{ width: 450, height: 450, background: 'radial-gradient(circle, #36B37E 0%, transparent 70%)', opacity: 0.1, top: '45%', right: '25%', position: 'fixed', animationDelay: '5s' }} />
        </>
      )}

      {/* ── Header Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDark ? 'rgba(7, 15, 31, 0.85)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${border}`
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <GrindsetLogoNodes isDark={isDark} className="w-36 h-auto" />
            </Link>

            {/* Navigation Links */}
            <nav style={{ display: 'flex', gap: 8 }} className="hidden md:flex">
              {[
                { label: 'Platform Solutions', href: '#subsystems' },
                { label: 'Security & Access', href: '#security' },
                { label: 'Why GrindSet', href: '#features' },
                { label: 'FAQ', href: '#faq' },
              ].map(n => (
                <a key={n.label} href={n.href}
                  style={{ padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, color: textMuted, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.target.style.color = '#4C9AFF'; e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.target.style.color = textMuted; e.target.style.background = 'transparent'; }}>
                  {n.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Live System Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999,
              background: 'rgba(54,179,126,0.12)', border: '1px solid rgba(54,179,126,0.25)',
              fontSize: 11, fontWeight: 700, color: '#57D9A3'
            }} className="hidden sm:flex">
              <span className="pulse-dot pulse-green" />
              Platform Online · 99.99% Uptime
            </div>

            {/* Theme Switcher */}
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => setLightMode(l => !l)}
              style={{
                padding: 9, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#F0F2F5',
                border: `1px solid ${border}`, color: isDark ? '#FFDA75' : '#0052CC', cursor: 'pointer'
              }}>
              {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>

            {/* Authentication Buttons */}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
              className="btn-ghost" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, border: `1px solid ${border}` }}>
              Sign In
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="btn-primary" style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserPlus className="w-4 h-4" /> Get Started Free
            </motion.button>
          </div>

        </div>
      </header>

      {/* ── Hero Section ── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 24px 60px', position: 'relative' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center' }}>
          
          {/* Main Hero Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', borderRadius: 999,
            background: 'rgba(0, 82, 204, 0.12)', border: '1px solid rgba(0, 82, 204, 0.3)', marginBottom: 24
          }}>
            <Sparkles className="w-4 h-4 text-blue-400" style={{ color: '#4C9AFF' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4C9AFF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              All-in-One Enterprise Platform for Growing Businesses
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(42px, 6.5vw, 82px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', color: textPrimary, marginBottom: 24 }}>
            The Enterprise Operating System<br />
            <span className="grad-blue">Built to Scale Your Business.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 1.8vw, 21px)', color: textMuted, maxWidth: 660, margin: '0 auto 40px', lineHeight: 1.65, fontWeight: 400 }}>
            Streamline your workforce, manage complex projects, automate financial accounting, and protect company records in one intuitive, high-speed platform.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 54 }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 12px 35px rgba(0,82,204,0.45)' }} whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="btn-primary" style={{ padding: '16px 36px', borderRadius: 14, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              Start Free Trial (Sign Up) <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="btn-gold" style={{ padding: '16px 30px', borderRadius: 14, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              Explore Live Workspace <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Live Business Impact Metrics (Auto-animated) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex', gap: 36, padding: '18px 40px', borderRadius: 22,
              background: cardBg, border: `1px solid ${border}`, backdropFilter: 'blur(16px)',
              boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.06)',
              flexWrap: 'wrap', justifyContent: 'center'
            }}>
            {[
              { label: 'Active Staff & Contractors', val: erdSummary?.totalEmployees ? `${erdSummary.totalEmployees} Active` : '24 Active', accent: '#57D9A3' },
              { label: 'Active Client Projects', val: erdSummary?.totalProjects ? `${erdSummary.totalProjects} Projects` : '18 Projects', accent: '#FFDA75' },
              { label: 'Automated Accounting Logs', val: erdSummary?.totalTransactions ? `${erdSummary.totalTransactions} Reports` : '142 Logs', accent: '#BF9AFF' },
              { label: 'Data Security Rating', val: '100% Encrypted', accent: '#4C9AFF' },
              { label: 'Platform Availability', val: '99.99% Uptime', accent: '#79E8F5' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: s.accent, margin: 0 }}>{s.val}</p>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted, margin: 0, marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </section>

      {/* ── Auto-Animated Live Workspace Preview Mockup ── */}
      <section style={{ maxWidth: 1240, margin: '0 auto 110px', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            borderRadius: 24, overflow: 'hidden', border: `1px solid ${border}`,
            background: isDark ? 'linear-gradient(180deg, #0B1B3D 0%, #071020 100%)' : '#FFFFFF',
            boxShadow: isDark ? '0 30px 80px rgba(0,82,204,0.25)' : '0 20px 60px rgba(0,0,0,0.08)'
          }}>
          
          {/* Mockup Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', background: isDark ? 'rgba(0,0,0,0.35)' : '#F4F5F7', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5630' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFAB00' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#36B37E' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: textMuted, marginLeft: 12 }}>
                GrindSet Executive Command Center
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="pill pill-green"><Check className="w-3 h-3" /> System Operational</span>
              <span className="pill pill-blue">Real-Time Sync Active</span>
            </div>
          </div>

          {/* Auto-Animated Metric Grid */}
          <div style={{ padding: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Metric 1 */}
            <motion.div whileHover={{ scale: 1.02 }} style={{ padding: 22, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: textMuted, textTransform: 'uppercase' }}>Monthly Operating Budget</span>
                <TrendingUp className="w-4 h-4" style={{ color: '#57D9A3' }} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#57D9A3', margin: 0 }}>$112,500</p>
              <p style={{ fontSize: 12, color: textMuted, margin: 0, marginTop: 4 }}>75% of $150,000 Allocated Funds</p>
            </motion.div>

            {/* Metric 2 */}
            <motion.div whileHover={{ scale: 1.02 }} style={{ padding: 22, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: textMuted, textTransform: 'uppercase' }}>Workforce Utilization</span>
                <Users className="w-4 h-4" style={{ color: '#4C9AFF' }} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#4C9AFF', margin: 0 }}>94.2% Capacity</p>
              <p style={{ fontSize: 12, color: textMuted, margin: 0, marginTop: 4 }}>24 Active Staff Members Assigned</p>
            </motion.div>

            {/* Metric 3 */}
            <motion.div whileHover={{ scale: 1.02 }} style={{ padding: 22, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: textMuted, textTransform: 'uppercase' }}>Project Milestones</span>
                <CheckCircle className="w-4 h-4" style={{ color: '#BF9AFF' }} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#BF9AFF', margin: 0 }}>18 / 20 Delivered</p>
              <p style={{ fontSize: 12, color: textMuted, margin: 0, marginTop: 4 }}>90% Sprint Milestone Completion</p>
            </motion.div>
          </div>

        </motion.div>
      </section>

      {/* ── Auto-Cycling Subsystems Showcase (NO CLICKING REQUIRED!) ── */}
      <section id="subsystems" style={{ maxWidth: 1400, margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: textPrimary, marginBottom: 14 }}>
            Four Core Platform Pillars
          </h2>
          <p style={{ fontSize: 16, color: textMuted, maxWidth: 560, margin: '0 auto' }}>
            Watch the platform dynamically cycle through your company's operational modules.
          </p>
        </div>

        {/* Auto-Cycling Progress Bar Header */}
        <div
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          style={{ maxWidth: 1000, margin: '0 auto 36px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
            {subsystems.map(sub => {
              const isActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => { setActiveTab(sub.id); setIsAutoPlaying(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 14,
                    cursor: 'pointer', border: isActive ? `2px solid ${sub.color}` : `1px solid ${border}`,
                    background: isActive ? (isDark ? 'rgba(255,255,255,0.07)' : 'white') : 'transparent',
                    transition: 'all .25s', position: 'relative', overflow: 'hidden'
                  }}>
                  <sub.icon className="w-4.5 h-4.5" style={{ color: sub.color }} />
                  <span style={{ fontWeight: 800, fontSize: 13, color: isActive ? textPrimary : textMuted }}>
                    {sub.title.split(' & ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Subsystem Display Card */}
        {(() => {
          const sub = subsystems.find(s => s.id === activeTab) || subsystems[0];
          return (
            <div
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    borderRadius: 24, padding: '38px', background: cardBg, border: `1px solid ${border}`,
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 36, alignItems: 'center',
                    boxShadow: isDark ? `0 20px 50px ${sub.color}15` : '0 10px 30px rgba(0,0,0,0.05)'
                  }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99, background: `${sub.color}18`, border: `1px solid ${sub.color}40`, marginBottom: 18 }}>
                      <sub.icon className="w-4 h-4" style={{ color: sub.color }} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: sub.color }}>{sub.badge}</span>
                    </div>
                    <h3 style={{ fontSize: 30, fontWeight: 900, color: textPrimary, marginBottom: 12 }}>{sub.title}</h3>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#4C9AFF', marginBottom: 16 }}>{sub.subtitle}</p>
                    <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.7, marginBottom: 28 }}>{sub.desc}</p>
                    
                    <button
                      onClick={() => navigate(`/${sub.id}`)}
                      className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      Explore {sub.title.split(' ')[0]} Suite <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Live Stream Preview Box */}
                  <div style={{ borderRadius: 20, padding: 22, background: isDark ? 'rgba(0,0,0,0.35)' : '#FAFBFC', border: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: textMuted, textTransform: 'uppercase' }}>{sub.preview.header}</span>
                      <span className="pill pill-green">Live Feed</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {sub.preview.items.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          style={{
                            padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                            border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: 0 }}>{item.name || item.action}</p>
                            <p style={{ fontSize: 12, color: textMuted, margin: 0, marginTop: 2 }}>{item.role || item.dept || item.entity}</p>
                          </div>
                          <span className="pill pill-blue">{item.rate || item.progress || item.balance || item.badge}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })()}
      </section>

      {/* ── Business Security & Role Access Section ── */}
      <section id="security" style={{ maxWidth: 1300, margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 16px', borderRadius: 99, background: 'rgba(54,179,126,0.15)', border: '1px solid rgba(54,179,126,0.3)', color: '#57D9A3', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
            <Lock className="w-3.5 h-3.5" /> BANK-GRADE DATA PRIVACY
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: textPrimary, marginBottom: 14 }}>
            Granular Role Access Control
          </h2>
          <p style={{ fontSize: 15, color: textMuted, maxWidth: 560, margin: '0 auto' }}>
            Keep sensitive financial records and executive configurations protected while enabling smooth team collaboration.
          </p>
        </div>

        <div style={{ borderRadius: 24, overflow: 'hidden', background: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.4)' : 'none' }}>
          <table className="gs-table" style={{ margin: 0 }}>
            <thead>
              <tr style={{ background: isDark ? 'rgba(0,0,0,0.35)' : '#F4F5F7' }}>
                <th style={{ padding: '18px 24px', fontSize: 13 }}>Business Capability / Permission</th>
                <th style={{ textAlign: 'center', padding: '18px 24px', fontSize: 13, color: '#57D9A3' }}>Team Member / Employee</th>
                <th style={{ textAlign: 'center', padding: '18px 24px', fontSize: 13, color: '#4C9AFF' }}>Company Owner / Executive</th>
              </tr>
            </thead>
            <tbody>
              {businessMatrix.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: textPrimary, fontSize: 14 }}>{row.feature}</td>
                  <td style={{ textAlign: 'center' }}>
                    {row.employee ? <Check className="w-5 h-5 text-green-400 mx-auto" style={{ color: '#57D9A3' }} /> : <X className="w-5 h-5 text-red-400 mx-auto" style={{ color: '#FF8F73', opacity: 0.3 }} />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.company ? <Check className="w-5 h-5 text-green-400 mx-auto" style={{ color: '#57D9A3' }} /> : <X className="w-5 h-5 text-red-400 mx-auto" style={{ color: '#FF8F73', opacity: 0.3 }} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Why Businesses Choose GrindSet ── */}
      <section id="features" style={{ maxWidth: 1400, margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: textPrimary, marginBottom: 14 }}>
            Why Growing Businesses Choose GrindSet
          </h2>
          <p style={{ fontSize: 15, color: textMuted, maxWidth: 560, margin: '0 auto' }}>
            Built to provide absolute clarity, control, and efficiency for modern organizations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {valuePillars.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, boxShadow: `0 20px 50px ${t.color}20` }}
              style={{ padding: 30, borderRadius: 22, background: cardBg, border: `1px solid ${border}`, borderTop: `4px solid ${t.color}` }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <t.icon className="w-6 h-6" style={{ color: t.color }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.color }}>{t.category}</span>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: textPrimary, margin: '8px 0 12px' }}>{t.title}</h3>
              <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" style={{ maxWidth: 900, margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 16px', borderRadius: 99, background: 'rgba(76,154,255,0.15)', border: '1px solid rgba(76,154,255,0.3)', color: '#4C9AFF', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
            <HelpCircle className="w-3.5 h-3.5" /> FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: textPrimary, marginBottom: 14 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{ borderRadius: 18, background: cardBg, border: `1px solid ${border}`, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%', padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: textPrimary }}>{faq.q}</span>
                <ChevronDown className="w-5 h-5" style={{ color: textMuted, transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ padding: '0 26px 22px', color: textMuted, fontSize: 15, lineHeight: 1.65 }}>
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final Call to Action Banner ── */}
      <section style={{ maxWidth: 1400, margin: '0 auto 100px', padding: '0 24px' }}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          style={{
            borderRadius: 28, padding: 'clamp(40px, 6vw, 80px)',
            background: 'linear-gradient(135deg, #0052CC 0%, #6554C0 100%)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(0,82,204,0.35)'
          }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          
          <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 900, color: 'white', marginBottom: 16 }}>
            Ready to streamline your company's operations?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 17, maxWidth: 600, margin: '0 auto 38px', lineHeight: 1.6 }}>
            Join forward-thinking companies using GrindSet ERP to align their workforce, projects, and finances in one platform.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="btn-gold" style={{ padding: '16px 36px', borderRadius: 14, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              Get Started Now (Sign Up) <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '48px 24px 36px', background: isDark ? 'rgba(5,10,22,0.85)' : '#FFFFFF' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <GrindsetLogoNodes isDark={isDark} className="w-36 h-auto" />
              <p style={{ fontSize: 13, color: textMuted, marginTop: 8 }}>
                The Enterprise Operating System for Growing Businesses
              </p>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 600 }}>
              <a href="#subsystems" style={{ color: textMuted, textDecoration: 'none' }}>Solutions</a>
              <a href="#security" style={{ color: textMuted, textDecoration: 'none' }}>Privacy & Security</a>
              <a href="#features" style={{ color: textMuted, textDecoration: 'none' }}>Why GrindSet</a>
              <a href="#faq" style={{ color: textMuted, textDecoration: 'none' }}>FAQ</a>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
              © 2026 GrindSet ERP · All-in-One Enterprise Platform
            </p>
            <span className="pill pill-blue">Enterprise Platform Live</span>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        isDark={isDark}
        onAuthSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
}
