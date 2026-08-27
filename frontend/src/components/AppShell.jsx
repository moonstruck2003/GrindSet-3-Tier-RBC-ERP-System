import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FolderKanban, Coins, ShieldAlert,
  Sun, Moon, LogOut, ChevronRight, Activity, Menu, X
} from 'lucide-react';
import { api } from '../config/api';
import GrindsetLogoNodes from './GrindsetLogoNodes';

const NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', accent: '#4C9AFF' },
  { path: '/workforce', icon: Users, label: 'Workforce', accent: '#57D9A3' },
  { path: '/projects', icon: FolderKanban, label: 'Projects', accent: '#FFDA75' },
  { path: '/finance', icon: Coins, label: 'Finance', accent: '#BF9AFF' },
  { path: '/audit', icon: ShieldAlert, label: 'Audit Logs', accent: '#FF8F73' },
];

// ── Theme tokens ──────────────────────────────────────────────────────────────
function theme(light) {
  return light
    ? {
      pageBg: '#F0F2F5',
      sidebarBg: 'linear-gradient(180deg,#FFFFFF 0%,#F4F5F7 100%)',
      sidebarBdr: '#DFE1E6',
      topbarBg: 'rgba(255,255,255,0.92)',
      topbarBdr: '#DFE1E6',
      cardBg: 'rgba(255,255,255,0.95)',
      cardBdr: '#DFE1E6',
      textPri: '#091E42',
      textMut: '#5E6C84',
      navHover: 'rgba(0,0,0,0.05)',
      navActive: 'rgba(0,82,204,0.10)',
    }
    : {
      pageBg: '#070F1F',
      sidebarBg: 'linear-gradient(180deg,#0A1628 0%,#060E1A 100%)',
      sidebarBdr: '#1E2D4A',
      topbarBg: 'rgba(6,14,26,0.88)',
      topbarBdr: '#1E2D4A',
      cardBg: 'rgba(11,27,61,0.65)',
      cardBdr: 'rgba(255,255,255,0.07)',
      textPri: '#F4F5F7',
      textMut: '#8993A4',
      navHover: 'rgba(255,255,255,0.05)',
      navActive: 'rgba(0,82,204,0.18)',
    };
}

export default function AppShell({ children, lightMode, setLightMode }) {
  const [apiStatus, setApiStatus] = useState('...');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const T = theme(lightMode);
  const currentPage = NAV.find(n => location.pathname.startsWith(n.path));

  useEffect(() => {
    api.health()
      .then(d => setApiStatus(d?.Status === 'Healthy' || d?.status === 'Healthy' ? 'Online' : 'Offline'))
      .catch(() => setApiStatus('Offline'));
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (isLanding) return <>{children}</>;

  const SIDEBAR_W = 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.pageBg, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 38, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: SIDEBAR_W,
        minHeight: '100vh',
        background: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBdr}`,
        position: 'fixed',
        left: mobileOpen ? 0 : undefined,
        top: 0,
        bottom: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: lightMode ? '2px 0 12px rgba(0,0,0,0.06)' : '2px 0 20px rgba(0,0,0,0.4)',
        transform: typeof window !== 'undefined' && window.innerWidth < 768 && !mobileOpen ? 'translateX(-100%)' : 'none',
        transition: 'transform 0.25s ease',
      }}>

        {/* Logo area */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.sidebarBdr}` }}>
          <NavLink to="/" style={{ display: 'block', textDecoration: 'none' }}>
            <GrindsetLogoNodes isDark={!lightMode} style={{ width: 140, height: 'auto' }} />
          </NavLink>

          {/* API status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: apiStatus === 'Online' ? '#36B37E' : '#FFAB00',
              boxShadow: apiStatus === 'Online' ? '0 0 6px #36B37E' : '0 0 6px #FFAB00',
            }} />
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: T.textMut }}>
              API {apiStatus}
            </span>
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '16px 20px 6px' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMut }}>
            Navigation
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ path, icon: Icon, label, accent }) => (
            <NavLink key={path} to={path} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: isActive ? T.navActive : 'transparent',
                    borderLeft: `3px solid ${isActive ? accent : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.navHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? accent : T.textMut }} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? (lightMode ? '#091E42' : '#F4F5F7') : T.textMut }}>
                    {label}
                  </span>
                  {isActive && (
                    <ChevronRight style={{ width: 12, height: 12, marginLeft: 'auto', color: accent, opacity: 0.7 }} />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '8px 10px 16px', borderTop: `1px solid ${T.sidebarBdr}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => setLightMode(l => !l)}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
              borderRadius: 10, background: 'transparent', border: 'none',
              cursor: 'pointer', width: '100%', color: T.textMut, fontSize: 13, fontWeight: 500,
              fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.navHover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {lightMode
              ? <Moon style={{ width: 16, height: 16, color: T.textMut }} />
              : <Sun style={{ width: 16, height: 16, color: T.textMut }} />}
            {lightMode ? 'Dark Mode' : 'Light Mode'}
          </button>

          <NavLink to="/" style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
            borderRadius: 10, color: T.textMut, fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.navHover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Back to Landing
          </NavLink>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <main style={{ marginLeft: SIDEBAR_W, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 100,
          background: T.topbarBg,
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${T.topbarBdr}`,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {currentPage && (
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: currentPage.accent, boxShadow: `0 0 10px ${currentPage.accent}` }} />
              )}
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.textPri, margin: 0, letterSpacing: '-0.01em' }}>
                {currentPage?.label ?? 'GrindSet ERP'}
              </h1>
            </div>
            <p style={{ fontSize: 12, color: T.textMut, margin: 0, marginTop: 3, marginLeft: 20 }}>
              GrindSet Enterprise Platform &nbsp;·&nbsp;
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Live API badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 999,
              background: 'rgba(54,179,126,0.1)',
              border: '1px solid rgba(54,179,126,0.2)',
              fontSize: 12, fontWeight: 700, color: '#57D9A3',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <Activity style={{ width: 13, height: 13 }} />
              v1.0.0 · Live
            </div>

            {/* Active User Session Pill / Demo Mode Indicator */}
            {(() => {
              try {
                const raw = localStorage.getItem('grindset_user');
                const u = raw ? JSON.parse(raw) : null;
                if (!u) {
                  return (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '6px 14px', borderRadius: 999,
                      background: 'rgba(255,171,0,0.12)',
                      border: '1px solid rgba(255,171,0,0.3)',
                      fontSize: 11, fontWeight: 700, color: '#FFDA75'
                    }}>
                      <span className="pulse-dot pulse-gold" />
                      Demo Mode · Anonymized Sample Data
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 12px', borderRadius: 12, background: T.cardBg, border: `1px solid ${T.cardBdr}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0052CC, #6554C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>
                      {(u.fullName || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.textPri, lineHeight: 1.2 }}>{u.fullName || u.email}</span>
                      <span style={{ fontSize: 10, color: '#4C9AFF', fontWeight: 700 }}>{u.role}</span>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('grindset_user');
                        window.location.href = '/';
                      }}
                      title="Sign Out"
                      style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut, marginLeft: 4 }}>
                      <LogOut style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                );
              } catch { return null; }
            })()}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: 24, overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
