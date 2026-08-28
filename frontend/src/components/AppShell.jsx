import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FolderKanban, Coins, ShieldAlert,
  Sun, Moon, LogOut, ChevronRight, Activity, Building2, Shield, UserCheck, Plus, Search, Bell, Command
} from 'lucide-react';
import { api } from '../config/api';
import GrindsetLogoNodes from './GrindsetLogoNodes';
import ApprovalPendingOverlay from './ApprovalPendingOverlay';
import CommandPaletteModal from './CommandPaletteModal';
import GlobalCreateModal from './GlobalCreateModal';
import NotificationsDrawer from './NotificationsDrawer';

// ── Theme tokens ──────────────────────────────────────────────────────────────
function theme(light) {
  return light
    ? {
      pageBg: '#F0F2F5',
      sidebarBg: 'linear-gradient(180deg,#FFFFFF 0%,#F4F5F7 100%)',
      sidebarBdr: '#DFE1E6',
      topbarBg: 'rgba(255,255,255,0.94)',
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
  const [currentUser, setCurrentUser] = useState(null);

  // Top-Tier Enterprise Drawers & Modals
  const [cmdOpen, setCmdOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTab, setCreateTab] = useState('task');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(2);

  const location = useLocation();
  const isLanding = location.pathname === '/';
  const T = theme(lightMode);

  const syncUserSession = async () => {
    try {
      const raw = localStorage.getItem('grindset_user');
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentUser(u);
        // Refresh session from API to get fresh approval status
        if (u?.userId) {
          const fresh = await api.me(u.userId).catch(() => null);
          if (fresh) {
            const merged = { ...u, ...fresh };
            setCurrentUser(merged);
            localStorage.setItem('grindset_user', JSON.stringify(merged));
          }
        }
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Session sync error:', e);
    }
  };

  useEffect(() => {
    syncUserSession();
    api.health()
      .then(d => setApiStatus(d?.Status === 'Healthy' || d?.status === 'Healthy' ? 'Online' : 'Offline'))
      .catch(() => setApiStatus('Offline'));
  }, [location.pathname]);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (isLanding) return <>{children}</>;

  // Role-based Nav filtering
  const userRole = currentUser?.role || 'Company';
  const isApproved = currentUser ? currentUser.approvalStatus === 'Approved' : true;

  let navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: userRole === 'Admin' ? 'Admin Dashboard' : userRole === 'Employee' ? 'My Dashboard' : 'Company Dashboard', accent: '#4C9AFF' },
    { path: '/workforce', icon: Users, label: userRole === 'Admin' ? 'Cross-Tenant Workforce' : 'Workforce & Approvals', accent: '#57D9A3' },
    { path: '/projects', icon: FolderKanban, label: 'Projects', accent: '#FFDA75' },
    { path: '/finance', icon: Coins, label: 'Finance & Ledger', accent: '#BF9AFF' },
    { path: '/audit', icon: ShieldAlert, label: 'Security Audit Logs', accent: '#FF8F73' },
  ];

  if (userRole === 'Admin') {
    navItems = [
      { path: '/dashboard', icon: Shield, label: 'Admin Governance', accent: '#0052CC' },
      { path: '/workforce', icon: Users, label: 'Employee Oversight', accent: '#57D9A3' },
      { path: '/projects', icon: Building2, label: 'Company Directory', accent: '#FFDA75' },
      { path: '/audit', icon: ShieldAlert, label: 'System Audit Logs', accent: '#FF8F73' },
    ];
  } else if (userRole === 'Employee') {
    navItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'My Sprint Dashboard', accent: '#57D9A3' },
      { path: '/projects', icon: FolderKanban, label: 'My Projects', accent: '#FFDA75' },
      { path: '/finance', icon: Coins, label: 'My Work & Rates', accent: '#BF9AFF' },
    ];
  }

  const currentPage = navItems.find(n => location.pathname.startsWith(n.path));
  const SIDEBAR_W = 240;

  const handleSignOut = () => {
    localStorage.removeItem('grindset_user');
    window.location.href = '/';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.pageBg, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Pending Approval Blur Lock Overlay ── */}
      {currentUser && !isApproved && (
        <ApprovalPendingOverlay
          user={currentUser}
          onRefreshSession={updated => setCurrentUser({ ...currentUser, ...updated })}
          onSignOut={handleSignOut}
          lightMode={lightMode}
        />
      )}

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

          {/* API status & Role Pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: apiStatus === 'Online' ? '#36B37E' : '#FFAB00',
                boxShadow: apiStatus === 'Online' ? '0 0 6px #36B37E' : '0 0 6px #FFAB00',
              }} />
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: T.textMut }}>
                API {apiStatus}
              </span>
            </div>

            {currentUser && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
                background: userRole === 'Admin' ? 'rgba(0,82,204,0.15)' : userRole === 'Company' ? 'rgba(255,171,0,0.15)' : 'rgba(54,179,126,0.15)',
                color: userRole === 'Admin' ? '#4C9AFF' : userRole === 'Company' ? '#FFDA75' : '#57D9A3',
              }}>
                {userRole}
              </span>
            )}
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '16px 20px 6px' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMut }}>
            {userRole} Workspace
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ path, icon: Icon, label, accent }) => (
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
          <NavLink to="/" style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
            borderRadius: 10, color: T.textMut, fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.navHover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Back to Landing Page
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* 1. GLOBAL + NEW ACTION LAUNCHER BUTTON (Jira & Monday Standard) */}
            <button
              onClick={() => { setCreateTab('task'); setCreateModalOpen(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                background: '#0052CC', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0,82,204,0.3)', transition: 'all 0.15s'
              }}
              title="Create New Task, Project, or Asset"
            >
              <Plus style={{ width: 16, height: 16 }} />
              <span>New</span>
            </button>

            {/* 2. COMMAND PALETTE CTRL+K SEARCH BUTTON (Linear & Stripe Standard) */}
            <button
              onClick={() => setCmdOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 14px', borderRadius: 10,
                background: lightMode ? '#EAECEF' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${T.topbarBdr}`,
                cursor: 'pointer', color: T.textMut, fontSize: 12, fontWeight: 600
              }}
              title="Search Spotlight (Ctrl+K)"
            >
              <Search style={{ width: 14, height: 14, color: '#4C9AFF' }} />
              <span style={{ display: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : 'inline' }}>Search...</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: lightMode ? '#DCDFE4' : 'rgba(255,255,255,0.1)', color: T.textPri, fontFamily: 'JetBrains Mono, monospace' }}>
                Ctrl+K
              </span>
            </button>

            {/* 3. NOTIFICATIONS BELL & DRAWER BUTTON (Jira & GitHub Standard) */}
            <button
              onClick={() => setNotifOpen(true)}
              style={{
                position: 'relative', padding: 8, borderRadius: 10,
                background: lightMode ? '#EAECEF' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${T.topbarBdr}`,
                cursor: 'pointer', color: T.textPri
              }}
              title="Notifications Center"
            >
              <Bell style={{ width: 16, height: 16, color: '#4C9AFF' }} />
              <span style={{
                position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%',
                background: '#FF5630', color: 'white', fontSize: 9, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.topbarBg}`
              }}>
                {notifCount}
              </span>
            </button>

            {/* 4. TOP THEME TOGGLE BUTTON (Day / Dark Mode Requirement) */}
            <button
              onClick={() => setLightMode(l => !l)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 10,
                background: lightMode ? '#EAECEF' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${T.topbarBdr}`,
                cursor: 'pointer', color: T.textPri, fontSize: 12, fontWeight: 700,
                transition: 'all 0.2s',
              }}
              title="Toggle Day/Dark Theme"
            >
              {lightMode
                ? <Sun style={{ width: 15, height: 15, color: '#FFAB00' }} />
                : <Moon style={{ width: 15, height: 15, color: '#4C9AFF' }} />}
              <span style={{ display: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : 'inline' }}>{lightMode ? 'Day Mode' : 'Dark Mode'}</span>
            </button>

            {/* Active User Session Pill / Demo Mode Indicator */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 12px', borderRadius: 12, background: T.cardBg, border: `1px solid ${T.cardBdr}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0052CC, #6554C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>
                  {(currentUser.fullName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textPri, lineHeight: 1.2 }}>{currentUser.fullName || currentUser.email}</span>
                  <span style={{ fontSize: 10, color: '#4C9AFF', fontWeight: 700 }}>{currentUser.role}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut, marginLeft: 4 }}>
                  <LogOut style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(255,171,0,0.12)',
                border: '1px solid rgba(255,171,0,0.3)',
                fontSize: 12, fontWeight: 700, color: '#FFDA75'
              }}>
                Guest Session
              </div>
            )}
          </div>
        </div>

        {/* Inner Page Container */}
        <div style={{ flex: 1, padding: 32, maxWidth: 1600, width: '100%', margin: '0 auto' }}>
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

      {/* Render Top-Tier Enterprise Modals & Drawers */}
      <CommandPaletteModal
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onOpenCreateModal={(tab) => { setCreateTab(tab); setCreateModalOpen(true); }}
        lightMode={lightMode}
      />

      <GlobalCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialTab={createTab}
        onItemCreated={() => { window.location.reload(); }}
        lightMode={lightMode}
      />

      <NotificationsDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        user={currentUser}
        lightMode={lightMode}
      />
    </div>
  );
}
