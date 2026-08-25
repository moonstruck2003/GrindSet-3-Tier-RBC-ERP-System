import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, X, ArrowRight, Zap, Database, Shield, BarChart3,
  Users, FolderKanban, Coins, ShieldAlert, CheckCircle2,
  ChevronRight, Globe2, Layers, Activity, Star
} from 'lucide-react';
import { fetchApiHealth, fetchErdSummary, API_BASE_URL } from './config/api';
import GrindsetLogoNodes from './components/GrindsetLogoNodes';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import WorkforcePage from './pages/WorkforcePage';
import ProjectsPage from './pages/ProjectsPage';
import FinancePage from './pages/FinancePage';
import AuditPage from './pages/AuditPage';

// ─── Landing Page ────────────────────────────────────────────────────────────
function LandingPage({ lightMode, setLightMode }) {
  const [apiHealth, setApiHealth] = useState({ Status: 'Checking...' });
  const [erdSummary, setErdSummary] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('SuperAdmin');
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

  const nav = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Workforce', to: '/workforce' },
    { label: 'Projects', to: '/projects' },
    { label: 'Finance', to: '/finance' },
    { label: 'Audit Logs', to: '/audit' },
    { label: 'API Docs', href: `${API_BASE_URL}/swagger`, external: true },
  ];

  const features = [
    { icon: Shield,       color: '#FF8F73', title: '3-Tier RBAC Auth',       desc: 'SuperAdmin, Company Owner, Employee role enforcement with immutable audit logs.' },
    { icon: Users,        color: '#57D9A3', title: 'Workforce Management',    desc: 'Department hierarchy, designations, and per-employee hourly billing rates.' },
    { icon: FolderKanban, color: '#FFDA75', title: 'Agile Project Board',     desc: 'Kanban tracking, milestone timelines, scope definitions, and archive system.' },
    { icon: Coins,        color: '#BF9AFF', title: 'Financial Ledger',        desc: 'Multi-account budgets, real-time expense logging, and P&L report generation.' },
    { icon: BarChart3,    color: '#4C9AFF', title: 'Sprint Analytics',        desc: 'Velocity charts, budget burn-rate visualisation and team capacity metrics.' },
    { icon: Database,     color: '#79E8F5', title: '20-Table SQLite ERD',     desc: 'EF Core auto-migrations shared via GitHub across the entire WFH team.' },
  ];

  const bg = isDark ? '#070F1F' : '#F0F2F5';
  const textPrimary = isDark ? '#F4F5F7' : '#091E42';
  const textMuted   = isDark ? '#8993A4'  : '#5E6C84';
  const cardBg      = isDark ? 'rgba(11,27,61,0.6)' : 'rgba(255,255,255,0.9)';
  const border      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      {/* Background orbs */}
      {isDark && (
        <>
          <div className="orb" style={{ width: 500, height: 500, background: '#0052CC', opacity: 0.08, top: -100, right: -100, position: 'fixed', animationDelay: '0s' }} />
          <div className="orb" style={{ width: 400, height: 400, background: '#6554C0', opacity: 0.06, bottom: 100, left: -100, position: 'fixed', animationDelay: '3s' }} />
        </>
      )}

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDark ? 'rgba(7,15,31,0.85)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${border}`
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link to="/"><GrindsetLogoNodes isDark={isDark} className="w-36 h-auto" /></Link>
            <nav style={{ display: 'flex', gap: 4 }} className="hidden lg:flex">
              {nav.map(n => n.external
                ? <a key={n.label} href={n.href} target="_blank" rel="noreferrer"
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: textMuted, transition: 'color .15s' }}
                    onMouseEnter={e => e.target.style.color='#4C9AFF'} onMouseLeave={e => e.target.style.color=textMuted}>
                    {n.label} ↗
                  </a>
                : <Link key={n.label} to={n.to}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: textMuted, transition: 'color .15s', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color='#4C9AFF'} onMouseLeave={e => e.target.style.color=textMuted}>
                    {n.label}
                  </Link>
              )}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* API status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
              background: apiOnline ? 'rgba(54,179,126,0.1)' : 'rgba(255,171,0,0.1)',
              border: `1px solid ${apiOnline ? 'rgba(54,179,126,0.25)' : 'rgba(255,171,0,0.25)'}`,
              fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              color: apiOnline ? '#57D9A3' : '#FFDA75' }} className="hidden sm:flex">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: apiOnline ? '#36B37E' : '#FFAB00' }} />
              API {apiOnline ? 'Online' : 'Standby'}
            </div>

            {/* Theme */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setLightMode(l => !l)}
              style={{ padding: 8, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#F0F2F5',
                border: `1px solid ${border}`, color: isDark ? '#FFDA75' : '#0052CC', cursor: 'pointer' }}>
              {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>

            {/* CTA */}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLoginOpen(true)}
              className="btn-primary" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13 }}>
              Sign In
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 24px 64px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          style={{ textAlign: 'center' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999,
            background: 'rgba(0,82,204,0.1)', border: '1px solid rgba(0,82,204,0.25)', marginBottom: 24 }}>
            <Zap className="w-3.5 h-3.5" style={{ color: '#4C9AFF' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4C9AFF', fontFamily: 'JetBrains Mono, monospace' }}>
              Built on .NET 10 · React 19 · EF Core SQLite
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, color: textPrimary, marginBottom: 20 }}>
            The Enterprise ERP<br />
            <span className="grad-blue">Built for your team</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 20px)', color: textMuted, maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.65 }}>
            GrindSet unifies workforce, projects, finance, and compliance into one blazing-fast platform — synced via GitHub across remote teams.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="btn-gold" style={{ padding: '14px 28px', borderRadius: 12, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLoginOpen(true)}
              className="btn-ghost" style={{ padding: '14px 28px', borderRadius: 12, fontSize: 15 }}>
              Sign In
            </motion.button>
          </div>

          {/* ERD badge */}
          {erdSummary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ display: 'inline-flex', gap: 24, marginTop: 36, padding: '12px 24px', borderRadius: 14,
                background: cardBg, border: `1px solid ${border}`, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'Users', val: erdSummary.totalUsers },
                { label: 'Employees', val: erdSummary.totalEmployees },
                { label: 'Projects', val: erdSummary.totalProjects },
                { label: 'Transactions', val: erdSummary.totalTransactions },
                { label: 'ERD Tables', val: erdSummary.erdTablesCount },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 900, color: '#4C9AFF' }}>{s.val}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: textMuted }}>{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 900, color: textPrimary, marginBottom: 12 }}>
            Five subsystems. One platform.
          </h2>
          <p style={{ fontSize: 15, color: textMuted, maxWidth: 500, margin: '0 auto' }}>
            Every module maps directly to the 20-table ERD, accessed live via the ASP.NET Core API.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              whileHover={{ y: -6, boxShadow: `0 20px 60px ${f.color}15` }}
              style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20,
                borderTop: `2px solid ${f.color}`, padding: '24px', cursor: 'default' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: textPrimary, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ borderRadius: 24, padding: 'clamp(32px,5vw,64px)',
            background: 'linear-gradient(135deg, #0052CC 0%, #6554C0 100%)',
            textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <h2 style={{ fontSize: 'clamp(22px,4vw,40px)', fontWeight: 900, color: 'white', marginBottom: 12 }}>
            Ready to explore GrindSet ERP?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 28 }}>
            The full dashboard is live — no setup needed.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="btn-gold" style={{ padding: '12px 28px', borderRadius: 12, fontSize: 14 }}>
              Go to Dashboard
            </motion.button>
            <a href={`${API_BASE_URL}/swagger`} target="_blank" rel="noreferrer">
              <motion.button whileHover={{ scale: 1.04 }}
                style={{ padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                Swagger API Docs ↗
              </motion.button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: textMuted }}>
          © 2026 GrindSet ERP · .NET 10 · React 19 · EF Core SQLite · 20-Table ERD
        </p>
      </footer>

      {/* ── Login Modal ── */}
      <AnimatePresence>
        {loginOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{ width: '100%', maxWidth: 400, borderRadius: 20, overflow: 'hidden',
                background: isDark ? '#0B1B3D' : 'white', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield className="w-4 h-4" style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: textPrimary }}>GrindSet ERP Access</p>
                    <p style={{ fontSize: 11, color: textMuted }}>Select your role profile</p>
                  </div>
                </div>
                <button onClick={() => setLoginOpen(false)} style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Role tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, padding: 4,
                  borderRadius: 10, background: isDark ? '#172B4D' : '#F0F2F5', border: `1px solid ${border}` }}>
                  {['SuperAdmin', 'CompanyOwner', 'Employee'].map(r => (
                    <button key={r} onClick={() => setSelectedRole(r)}
                      style={{ padding: '7px 4px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                        background: selectedRole === r ? '#0052CC' : 'transparent',
                        color: selectedRole === r ? 'white' : textMuted, transition: 'all .15s' }}>
                      {r}
                    </button>
                  ))}
                </div>

                {/* Email */}
                <div>
                  <label className="gs-label" style={{ color: textMuted }}>Email</label>
                  <input readOnly className="gs-input"
                    style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFBFC', color: textPrimary, borderColor: isDark ? 'var(--gs-border)' : '#C1C7D0' }}
                    value={selectedRole === 'SuperAdmin' ? 'admin@grindset.io' : selectedRole === 'CompanyOwner' ? 'corp@acmeglobal.com' : 'john.dev@grindset.io'} />
                </div>
                <div>
                  <label className="gs-label" style={{ color: textMuted }}>Password</label>
                  <input readOnly type="password" className="gs-input"
                    style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFBFC', color: textPrimary, borderColor: isDark ? 'var(--gs-border)' : '#C1C7D0' }}
                    value="••••••••••••" />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setLoginOpen(false); navigate('/dashboard'); }}
                  className="btn-primary" style={{ padding: '11px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Log In as {selectedRole} <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light', lightMode);
  }, [lightMode]);

  return (
    <AppShell lightMode={lightMode} setLightMode={setLightMode}>
      <Routes>
        <Route path="/" element={<LandingPage lightMode={lightMode} setLightMode={setLightMode} />} />
        <Route path="/dashboard" element={<DashboardPage lightMode={lightMode} />} />
        <Route path="/workforce" element={<WorkforcePage lightMode={lightMode} />} />
        <Route path="/projects"  element={<ProjectsPage lightMode={lightMode} />} />
        <Route path="/finance"   element={<FinancePage lightMode={lightMode} />} />
        <Route path="/audit"     element={<AuditPage lightMode={lightMode} />} />
        <Route path="*"          element={<LandingPage lightMode={lightMode} setLightMode={setLightMode} />} />
      </Routes>
    </AppShell>
  );
}
