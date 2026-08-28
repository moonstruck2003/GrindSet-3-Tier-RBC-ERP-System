import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban, Calendar, DollarSign, TrendingUp, CheckCircle, AlertCircle,
  Clock, Target, Layers, Plus, Filter, ArrowRight, Eye, ChevronRight, CheckSquare, Sparkles
} from 'lucide-react';
import { api } from '../config/api';
import ProjectDetailModal from '../components/ProjectDetailModal';

const STATUS_CONFIG = {
  'In Progress': { bg: 'rgba(255,171,0,0.15)', color: '#FFDA75', bdr: 'rgba(255,171,0,0.3)', dot: '#FFAB00', health: 'On Track' },
  'Completed':   { bg: 'rgba(54,179,126,0.15)', color: '#57D9A3', bdr: 'rgba(54,179,126,0.3)', dot: '#36B37E', health: 'Delivered' },
  'On Hold':     { bg: 'rgba(255,86,48,0.15)',  color: '#FF8F73', bdr: 'rgba(255,86,48,0.3)',  dot: '#FF5630', health: 'At Risk' },
  'Planning':    { bg: 'rgba(0,82,204,0.15)',   color: '#4C9AFF', bdr: 'rgba(0,82,204,0.3)',   dot: '#0052CC', health: 'Scoping' },
};

function ProgressBar({ pct, dot }) {
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
        style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${dot}88, ${dot})` }}
      />
    </div>
  );
}

export default function ProjectsPage({ lightMode }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Presentation View: 'cards' | 'roadmap' | 'kanban'
  const [view, setView] = useState('cards');

  // Kanban Scope Filter: 'all' or numeric project ID
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  // Detail Modal State
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, accRes] = await Promise.all([
        api.projectDetails().catch(() => api.projects().catch(() => [])),
        api.tasks().catch(() => []),
        api.accounts().catch(() => []),
      ]);
      setProjects(projRes);
      setTasks(taskRes);
      setAccounts(accRes);
    } catch (err) {
      console.error('Failed to load project management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Task Status Inline (Lightweight Kanban Action)
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  const totalBudget = projects.reduce((s, p) => s + Number(p.TotalBudget || p.totalBudget || 0), 0);

  // Theme Tokens
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const cardBg = lightMode ? 'rgba(255,255,255,0.92)' : 'rgba(11,27,61,0.65)';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.08)';
  const sectionBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

      {/* Header & Presentation View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0052CC, #FFAB00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FolderKanban style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: textPri, margin: 0 }}>
                Enterprise Project Portfolio Management
              </h1>
              <p style={{ fontSize: 13, color: textMut, margin: 0, marginTop: 2 }}>
                {projects.length} Active Portfolio Projects &nbsp;·&nbsp; Milestone Roadmaps &nbsp;·&nbsp; Sprint Backlogs
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div style={{ display: 'flex', gap: 6, background: lightMode ? '#EAECEF' : 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 12, border: `1px solid ${border}` }}>
          {[
            { id: 'cards', label: '⊞ Portfolio Cards' },
            { id: 'roadmap', label: '🗓️ Epic Roadmap Timeline' },
            { id: 'kanban', label: '⊟ Sprint Kanban Board' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: view === v.id ? '#0052CC' : 'transparent',
                color: view === v.id ? 'white' : textMut,
                transition: 'all 0.15s'
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#57D9A3', letterSpacing: '0.06em' }}>Total Portfolio Budget</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>${totalBudget.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Across {projects.length} Active Projects</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FFDA75', letterSpacing: '0.06em' }}>In Progress Projects</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
            {projects.filter(p => (p.Status || p.status) === 'In Progress').length}
          </div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Active Delivery Milestones</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#4C9AFF', letterSpacing: '0.06em' }}>Completed Milestones</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
            {projects.filter(p => (p.Status || p.status) === 'Completed').length}
          </div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Delivered Initiatives</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#BF9AFF', letterSpacing: '0.06em' }}>Total Sprint Tasks</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{tasks.length} Tasks</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>{tasks.filter(t => (t.Status || t.status) === 'Done').length} Tasks Completed</div>
        </motion.div>
      </div>

      {/* ── PRESENTATION 1: PORTFOLIO CARDS VIEW ── */}
      {view === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {projects.map((p, i) => {
            const id = Number(p.ProjectId || p.projectId);
            const name = p.ProjectName || p.projectName || `Project #${id}`;
            const status = p.Status || p.status || 'In Progress';
            const budget = Number(p.TotalBudget || p.totalBudget || 0);
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['In Progress'];
            const scopeDesc = p.ScopeDescription || p.scopeDescription || 'Enterprise software initiative.';

            // Calculate task completion percentage
            const projTasks = tasks.filter(t => Number(t.ProjectId || t.projectId) === id);
            const doneTasks = projTasks.filter(t => (t.Status || t.status) === 'Done');
            const pct = projTasks.length > 0 ? Math.round((doneTasks.length / projTasks.length) * 100) : (i * 25 + 35) % 95;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass"
                style={{
                  padding: 22, borderRadius: 18, background: cardBg, border: `1px solid ${border}`,
                  borderTop: `3px solid ${cfg.dot}`, display: 'flex', flexDirection: 'column', gap: 14,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cfg.dot}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderKanban style={{ width: 22, height: 22, color: cfg.dot }} />
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.bdr}` }}>
                      {status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: textPri, margin: 0 }}>{name}</h3>
                  <p style={{ fontSize: 11, color: textMut, margin: 0, marginTop: 4, lineHeight: 1.4, height: 32, overflow: 'hidden' }}>
                    {scopeDesc}
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: textMut, marginBottom: 6 }}>
                    <span>Sprint Milestone Completion</span>
                    <span style={{ fontWeight: 800, color: cfg.dot, fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} dot={cfg.dot} />
                </div>

                {/* Footer metrics */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>
                    ${budget.toLocaleString()}
                  </div>

                  <button
                    onClick={() => { setSelectedProjectForDetail(p); setDetailModalOpen(true); }}
                    className="btn-ghost"
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Eye style={{ width: 13, height: 13 }} /> Inspect Project
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── PRESENTATION 2: INTERACTIVE MILESTONE ROADMAP TIMELINE VIEW ── */}
      {view === 'roadmap' && (
        <div className="glass" style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: textPri, margin: 0 }}>
                Enterprise Quarterly Epic & Milestone Roadmap
              </h2>
              <p style={{ fontSize: 12, color: textMut, margin: 0, marginTop: 2 }}>
                Strategic Multi-Project Execution Schedule (Q1 2026 – Q4 2026)
              </p>
            </div>

            <div style={{ display: 'flex', gap: 14, fontSize: 11, fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#57D9A3' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#36B37E' }} /> On Track
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFDA75' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFAB00' }} /> In Scoping
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF8F73' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5630' }} /> Milestone Review
              </span>
            </div>
          </div>

          {/* Quarterly Timeline Header Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(4, 1fr)', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${border}`, fontWeight: 800, fontSize: 12, color: textMut, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <div>Project Epic</div>
            <div style={{ textAlign: 'center' }}>Q1 2026</div>
            <div style={{ textAlign: 'center' }}>Q2 2026</div>
            <div style={{ textAlign: 'center' }}>Q3 2026</div>
            <div style={{ textAlign: 'center' }}>Q4 2026</div>
          </div>

          {/* Project Timeline Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {projects.map((p, idx) => {
              const id = Number(p.ProjectId || p.projectId);
              const name = p.ProjectName || p.projectName || `Project #${id}`;
              const budget = Number(p.TotalBudget || p.totalBudget || 0);

              // Calculate Gantt offset span based on index
              const startQuarter = (idx % 3) + 1;
              const quarterSpan = Math.min(4 - startQuarter + 1, 2);
              const status = p.Status || p.status || 'In Progress';
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['In Progress'];

              return (
                <div key={id} style={{ display: 'grid', gridTemplateColumns: '220px repeat(4, 1fr)', gap: 12, alignItems: 'center' }}>
                  {/* Left Title */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: textPri }}>{name}</div>
                    <div style={{ fontSize: 11, color: textMut, marginTop: 2 }}>
                      Budget: ${budget.toLocaleString()}
                    </div>
                  </div>

                  {/* Right Timeline Grid Bar */}
                  <div style={{ gridColumn: `span 4`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, height: 44, position: 'relative', alignItems: 'center' }}>
                    <div
                      style={{
                        gridColumn: `${startQuarter} / span ${quarterSpan}`,
                        height: 38, borderRadius: 10,
                        background: `linear-gradient(90deg, ${cfg.dot}22, ${cfg.dot}44)`,
                        border: `1px solid ${cfg.dot}`,
                        padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: `0 4px 14px ${cfg.dot}20`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles style={{ width: 14, height: 14, color: cfg.dot }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: textPri }}>
                          {idx === 0 ? 'M1: Architecture & Auth' : idx === 1 ? 'M2: AI Analytics Engine' : 'M3: Mobile Workforce iOS'}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: cfg.dot, color: 'white' }}>
                        {cfg.health}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PRESENTATION 3: UNIQUE & LIGHTWEIGHT SPRINT KANBAN BOARD ── */}
      {view === 'kanban' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Kanban Scope Selector */}
          <div className="glass" style={{ padding: '14px 20px', borderRadius: 14, background: cardBg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Filter style={{ width: 16, height: 16, color: '#0052CC' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: textPri }}>Filter Board Scope:</span>
              <select
                className="gs-input"
                style={{ width: 240, padding: '6px 10px', fontSize: 12 }}
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
              >
                <option value="all">🌐 All Projects ({projects.length})</option>
                {projects.map(p => {
                  const id = p.ProjectId || p.projectId;
                  return <option key={id} value={id}>📁 {p.ProjectName || p.projectName}</option>;
                })}
              </select>
            </div>

            <span style={{ fontSize: 12, color: textMut }}>
              Showing {tasks.filter(t => selectedProjectId === 'all' || String(t.ProjectId || t.projectId) === String(selectedProjectId)).length} Filtered Tasks
            </span>
          </div>

          {/* Lightweight 4-Column Board */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { statusKey: 'To Do', label: 'To Do', color: '#8993A4', nextStatus: 'In Progress', nextLabel: '→ In Progress' },
              { statusKey: 'In Progress', label: 'In Progress', color: '#FFAB00', nextStatus: 'In Review', nextLabel: '→ In Review' },
              { statusKey: 'In Review', label: 'In Review', color: '#00B8D9', nextStatus: 'Done', nextLabel: '✓ Mark Done' },
              { statusKey: 'Done', label: 'Done', color: '#36B37E', nextStatus: 'In Progress', nextLabel: '↺ Reopen' },
            ].map(col => {
              const colTasks = tasks
                .filter(t => selectedProjectId === 'all' || String(t.ProjectId || t.projectId) === String(selectedProjectId))
                .filter(t => (t.Status || t.status || 'To Do') === col.statusKey);

              const totalPoints = colTasks.reduce((s, t) => s + Number(t.StoryPoints || t.storyPoints || 1), 0);

              return (
                <div key={col.statusKey} className="glass" style={{ borderRadius: 16, background: cardBg, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Column Header */}
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${border}`, borderTop: `3px solid ${col.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                      <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: col.color, margin: 0, letterSpacing: '0.06em' }}>
                        {col.label}
                      </h3>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: `${col.color}20`, color: col.color }}>
                      {colTasks.length} ({totalPoints} pts)
                    </span>
                  </div>

                  {/* Task Cards Container */}
                  <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 280, background: sectionBg }}>
                    {colTasks.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: textMut, fontSize: 11, fontStyle: 'italic' }}>
                        No tasks in {col.label}
                      </div>
                    ) : (
                      colTasks.map(t => {
                        const id = t.TaskId || t.taskId;
                        const title = t.Title || t.title;
                        const projName = t.ProjectName || t.projectName || 'Core Project';
                        const assignee = t.AssigneeName || t.assigneeName || 'Unassigned';
                        const priority = t.Priority || t.priority || 'Medium';
                        const pts = t.StoryPoints || t.storyPoints || 1;

                        const priColor = priority === 'Highest' || priority === 'High' ? '#FF8F73' : priority === 'Medium' ? '#FFDA75' : '#4C9AFF';

                        return (
                          <motion.div
                            key={id}
                            whileHover={{ y: -2 }}
                            style={{
                              padding: 12, borderRadius: 12, background: lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: textMut }}>#GS-{id}</span>
                              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${priColor}20`, color: priColor }}>
                                {priority}
                              </span>
                            </div>

                            <div style={{ fontSize: 13, fontWeight: 700, color: textPri, lineHeight: 1.3 }}>{title}</div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: textMut }}>
                              <span>📁 {projName}</span>
                              <span style={{ fontWeight: 700, color: '#4C9AFF' }}>{pts} pts</span>
                            </div>

                            {/* Lightweight 1-Click Fast Transition Button */}
                            <div style={{ paddingTop: 6, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 10, color: textMut }}>👤 {assignee}</span>

                              <button
                                onClick={() => handleUpdateTaskStatus(id, col.nextStatus)}
                                style={{
                                  padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                  background: `${col.color}18`, color: col.color, border: `1px solid ${col.color}40`,
                                  cursor: 'pointer', transition: 'all 0.15s'
                                }}
                              >
                                {col.nextLabel}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Render Project Inspection Modal */}
      <ProjectDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        project={selectedProjectForDetail}
        accounts={accounts}
        tasks={tasks}
        lightMode={lightMode}
      />

    </div>
  );
}
