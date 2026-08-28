import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, FolderKanban, Users, Coins, ShieldAlert, ArrowRight, X, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';

export default function CommandPaletteModal({ isOpen, onClose, onOpenCreateModal, lightMode }) {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      Promise.all([
        api.projects().catch(() => []),
        api.employees().catch(() => []),
        api.tasks().catch(() => []),
      ]).then(([p, e, t]) => {
        setProjects(p);
        setEmployees(e);
        setTasks(t);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredRoutes = [
    { label: 'Go to Dashboard', path: '/dashboard', icon: Command, category: 'Navigation' },
    { label: 'Go to Projects Portfolio', path: '/projects', icon: FolderKanban, category: 'Navigation' },
    { label: 'Go to Workforce Directory', path: '/workforce', icon: Users, category: 'Navigation' },
    { label: 'Go to Finance & Ledger', path: '/finance', icon: Coins, category: 'Navigation' },
    { label: 'Go to Security Audit Logs', path: '/audit', icon: ShieldAlert, category: 'Navigation' },
  ].filter(r => !q || r.label.toLowerCase().includes(q));

  const filteredProjects = projects.filter(p => !q || p.projectName?.toLowerCase().includes(q));
  const filteredEmployees = employees.filter(e => !q || e.FullName?.toLowerCase().includes(q) || e.Designation?.toLowerCase().includes(q));
  const filteredTasks = tasks.filter(t => !q || t.Title?.toLowerCase().includes(q) || t.ProjectName?.toLowerCase().includes(q));

  const handleSelectRoute = (path) => {
    navigate(path);
    onClose();
  };

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const itemHover = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.06)';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
    }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -10 }}
        style={{
          width: '100%', maxWidth: 620, maxHeight: '80vh', overflow: 'hidden',
          background: cardBg, borderRadius: 20, border: `1px solid ${border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${border}`, gap: 12 }}>
          <Search style={{ width: 20, height: 20, color: '#4C9AFF', flexShrink: 0 }} />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, project, employee, or task... (Esc to close)"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: textPri, fontSize: 15, fontWeight: 500, fontFamily: 'Inter, sans-serif'
            }}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: lightMode ? '#EAECEF' : 'rgba(255,255,255,0.08)', color: textMut, fontFamily: 'JetBrains Mono, monospace' }}>
            Ctrl+K
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Quick Create Action */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: textMut, marginBottom: 8, paddingLeft: 8 }}>
              Quick Actions
            </div>
            <div
              onClick={() => { onClose(); if (onOpenCreateModal) onOpenCreateModal('task'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                cursor: 'pointer', background: 'rgba(0,82,204,0.1)', border: '1px solid rgba(0,82,204,0.2)', transition: 'background 0.15s'
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Plus style={{ width: 16, height: 16 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4C9AFF' }}>Create New Task / Issue</div>
                <div style={{ fontSize: 11, color: textMut }}>Create task bound to specific project</div>
              </div>
              <ArrowRight style={{ width: 14, height: 14, color: '#4C9AFF' }} />
            </div>
          </div>

          {/* Navigation Routes */}
          {filteredRoutes.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: textMut, marginBottom: 8, paddingLeft: 8 }}>
                Navigation
              </div>
              {filteredRoutes.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectRoute(r.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 10,
                    cursor: 'pointer', transition: 'background 0.15s', fontSize: 13, fontWeight: 600, color: textPri
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = itemHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <r.icon style={{ width: 16, height: 16, color: textMut }} />
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: textMut, marginBottom: 8, paddingLeft: 8 }}>
                Tasks ({filteredTasks.length})
              </div>
              {filteredTasks.slice(0, 4).map(t => (
                <div
                  key={t.TaskId || t.id}
                  onClick={() => handleSelectRoute('/projects')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10,
                    cursor: 'pointer', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = itemHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: textPri }}>{t.Title || t.title}</div>
                    <div style={{ fontSize: 11, color: '#4C9AFF' }}>{t.ProjectName || t.project || 'Project Task'}</div>
                  </div>
                  <span className={`pill ${t.Priority === 'High' || t.priority === 'High' ? 'pill-red' : 'pill-blue'}`} style={{ fontSize: 10 }}>
                    {t.Priority || t.priority || 'Medium'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: textMut, marginBottom: 8, paddingLeft: 8 }}>
                Projects ({filteredProjects.length})
              </div>
              {filteredProjects.map(p => (
                <div
                  key={p.projectId}
                  onClick={() => handleSelectRoute('/projects')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10,
                    cursor: 'pointer', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = itemHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FolderKanban style={{ width: 16, height: 16, color: '#FFDA75' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: textPri }}>{p.projectName}</span>
                  </div>
                  <span className="pill pill-blue">{p.status}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
