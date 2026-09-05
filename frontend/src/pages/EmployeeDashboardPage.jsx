import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, FolderKanban, CheckCircle2, Clock, Coins, Activity,
  Calendar, Award, ChevronRight, CheckSquare, Plus, FileText
} from 'lucide-react';
import { api } from '../config/api';
import ItemDetailDrawer from '../components/ItemDetailDrawer';

export default function EmployeeDashboardPage({ lightMode }) {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Item Drawer state
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Kanban Tasks State
  const [kanbanTasks, setKanbanTasks] = useState([]);

  useEffect(() => {
    let u = null;
    try {
      const raw = localStorage.getItem('grindset_user');
      if (raw) {
        u = JSON.parse(raw);
        setUser(u);
      }
    } catch {}

    const loadData = async () => {
      setLoading(true);
      try {
        const [projRes, assignRes, txRes, tasksRes] = await Promise.all([
          api.projects().catch(() => []),
          api.assignments().catch(() => []),
          api.transactions().catch(() => []),
          api.tasks().catch(() => []),
        ]);
        setProjects(projRes);
        setAssignments(assignRes);
        setTransactions(txRes);

        if (tasksRes && tasksRes.length > 0) {
          const mapped = tasksRes.map(t => ({
            id: t.taskId || t.TaskId,
            title: t.title || t.Title,
            status: t.status || t.Status || 'To Do',
            priority: t.priority || t.Priority || 'Medium',
            project: t.projectName || t.ProjectName || 'Core Project',
            assigneeId: t.assigneeId || t.AssigneeId
          }));
          setKanbanTasks(mapped);
        }
      } catch (err) {
        console.error('Failed to load employee dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const moveTask = async (taskId, newStatus) => {
    setKanbanTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to persist task status update:', err);
    }
  };

  // Theme styling
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const cardBg = lightMode ? 'rgba(255,255,255,0.92)' : 'rgba(11,27,61,0.65)';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.07)';
  const columnBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

      {/* Header Banner */}
      <div className="glass" style={{ padding: '24px 30px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(87,217,163,0.18), rgba(0,82,204,0.18))', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #36B37E, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(54,179,126,0.3)' }}>
              <User style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: textPri, margin: 0 }}>
                  Welcome back, {user?.fullName || 'Specialist'}!
                </h1>
                <span className="pill pill-green">Approved Employee</span>
                {projects.some(p => p.isManager || p.IsManager || Number(p.projectManagerId || p.ProjectManagerId) === Number(user?.userId)) && (
                  <span className="pill pill-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    ⭐ Project Manager
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: textMut, margin: 0, marginTop: 4 }}>
                Employee Portal &nbsp;·&nbsp; My Tasks & Agile Sprint Board &nbsp;·&nbsp; Personal Log
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: 12, background: cardBg, border: `1px solid ${border}`, textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: textMut }}>Hourly Billing Rate</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#57D9A3' }}>$85.00 / hr</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#57D9A3', letterSpacing: '0.06em' }}>Active Sprint Tasks</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{kanbanTasks.length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Assigned Jira Work Items</div>
        </div>

        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#4C9AFF', letterSpacing: '0.06em' }}>Tasks Completed</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{kanbanTasks.filter(t => t.status === 'Done').length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Resolved Sprint Deliverables</div>
        </div>

        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FFDA75', letterSpacing: '0.06em' }}>Assigned Projects</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{projects.length || 1}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Active Team Engagements</div>
        </div>

        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#BF9AFF', letterSpacing: '0.06em' }}>Logged Transactions</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{transactions.length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Logged Expenses & Timesheets</div>
        </div>
      </div>

      {/* ── SECTION 1: Agile Sprint Kanban Board ── */}
      <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderKanban style={{ width: 20, height: 20, color: '#4C9AFF' }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>My Agile Kanban Board (Sprint 1)</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {columns.map(col => {
            const colTasks = kanbanTasks.filter(t => t.status === col);
            return (
              <div key={col} style={{ background: columnBg, borderRadius: 14, padding: 16, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: col === 'Done' ? '#57D9A3' : col === 'In Progress' ? '#4C9AFF' : textMut }}>
                    {col}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.08)', color: textPri }}>
                    {colTasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {colTasks.map(t => (
                    <motion.div
                      key={t.id}
                      whileHover={{ y: -2 }}
                      onClick={() => { setSelectedTask(t); setDrawerOpen(true); }}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: cardBg,
                        border: `1px solid ${border}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#4C9AFF', fontWeight: 700, marginBottom: 4 }}>{t.project}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: textPri, marginBottom: 10 }}>{t.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className={`pill ${t.priority === 'High' ? 'pill-red' : 'pill-blue'}`} style={{ fontSize: 10 }}>
                          {t.priority} Priority
                        </span>

                        {/* Move Status buttons */}
                        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                          {col !== 'To Do' && (
                            <button
                              onClick={() => moveTask(t.id, col === 'Done' ? 'In Progress' : 'To Do')}
                              style={{ padding: '3px 6px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'transparent', border: `1px solid ${border}`, color: textMut, cursor: 'pointer' }}
                            >
                              ←
                            </button>
                          )}
                          {col !== 'Done' && (
                            <button
                              onClick={() => moveTask(t.id, col === 'To Do' ? 'In Progress' : 'Done')}
                              style={{ padding: '3px 6px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'rgba(0,82,204,0.12)', border: '1px solid rgba(0,82,204,0.3)', color: '#4C9AFF', cursor: 'pointer' }}
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: My Projects Overview ── */}
      <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award style={{ width: 20, height: 20, color: '#57D9A3' }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>My Project Allocations & Timeline</h2>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="gs-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Role in Project</th>
                <th>Total Budget</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const pId = Number(p.projectId || p.ProjectId);
                const isPM = p.isManager || p.IsManager || Number(p.projectManagerId || p.ProjectManagerId) === Number(user?.userId);
                const myAssignment = assignments.find(a => Number(a.projectId || a.ProjectId) === pId && Number(a.employeeId || a.EmployeeId) === Number(user?.userId));
                const roleInProj = isPM ? 'Project Manager' : (myAssignment?.roleInProject || myAssignment?.RoleInProject || (p.isMember ? 'Team Member' : 'Observer / Non-Member'));

                return (
                  <tr key={pId}>
                    <td style={{ fontWeight: 700, color: textPri }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📁 {p.projectName || p.ProjectName}</span>
                        {isPM && <span className="pill pill-gold" style={{ fontSize: 9, padding: '2px 6px' }}>PM</span>}
                      </div>
                    </td>
                    <td><span className="pill pill-blue">{p.status || p.Status || 'In Progress'}</span></td>
                    <td style={{ fontWeight: 600 }}>
                      {isPM ? (
                        <span className="pill pill-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          ⭐ Project Manager
                        </span>
                      ) : p.isMember || myAssignment ? (
                        <span className="pill pill-blue">
                          {roleInProj}
                        </span>
                      ) : (
                        <span className="pill pill-cyan" style={{ opacity: 0.8 }}>
                          Observer (Not Assigned)
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: '#57D9A3' }}>${(p.totalBudget || p.TotalBudget || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Slide-Over Drawer */}
      <ItemDetailDrawer
        item={selectedTask}
        itemType="task"
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lightMode={lightMode}
      />
    </div>
  );
}
