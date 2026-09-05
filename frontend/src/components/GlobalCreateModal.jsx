import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, FolderKanban, Users, Coins, CheckSquare, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../config/api';

export default function GlobalCreateModal({ isOpen, onClose, initialTab = 'task', onItemCreated, lightMode }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'task' | 'project' | 'employee' | 'expense'

  // Data for Dropdowns
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Task Form State (STRICT REQUIREMENT: MUST SELECT PROJECT)
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskStoryPoints, setTaskStoryPoints] = useState('3');

  // Project Form State
  const [projectName, setProjectName] = useState('');
  const [projectBudget, setProjectBudget] = useState('150000');
  const [projectScope, setProjectScope] = useState('');
  const [projectManagerId, setProjectManagerId] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);

  // Employee Form State
  const [empFullName, setEmpFullName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDesignation, setEmpDesignation] = useState('Fullstack Engineer');
  const [empRate, setEmpRate] = useState('85');

  // Expense Form State
  const [expAccountId, setExpAccountId] = useState('');
  const [expAmount, setExpAmount] = useState('2500');
  const [expType, setExpType] = useState('Infrastructure Expense');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      Promise.all([
        api.projects().catch(() => []),
        api.employees().catch(() => []),
        api.accounts().catch(() => []),
      ]).then(([p, e, a]) => {
        setProjects(p);
        setEmployees(e);
        setAccounts(a);
        if (p.length > 0 && !taskProjectId) {
          setTaskProjectId(p[0].projectId || p[0].ProjectId);
        }
        if (a.length > 0 && !expAccountId) {
          setExpAccountId(a[0].accountId || a[0].AccountId);
        }
      });
    }
  }, [isOpen]);

  // Dynamically load members of the currently selected project for task assignment
  useEffect(() => {
    if (taskProjectId) {
      api.projectMembers(taskProjectId)
        .then(m => setProjectMembers(m || []))
        .catch(() => setProjectMembers([]));
    } else {
      setProjectMembers([]);
    }
  }, [taskProjectId]);

  if (!isOpen) return null;

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!taskProjectId) {
      setError('Task must be bound to a specific project. Please select a project.');
      return;
    }
    if (!taskTitle.trim()) {
      setError('Please enter a task title.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        projectId: parseInt(taskProjectId),
        assigneeId: taskAssigneeId ? parseInt(taskAssigneeId) : null,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priority: taskPriority,
        status: 'To Do',
        storyPoints: parseInt(taskStoryPoints) || 3
      };

      await api.createTask(payload);
      setSuccess('Task created and bound to project successfully!');
      setTimeout(() => {
        onClose();
        if (onItemCreated) onItemCreated();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!projectName.trim()) {
      setError('Please enter a project name.');
      return;
    }

    setLoading(true);
    try {
      let u = null;
      try {
        const raw = localStorage.getItem('grindset_user');
        if (raw) u = JSON.parse(raw);
      } catch {}

      const payload = {
        companyId: u?.companyId || u?.userId || 0,
        projectName: projectName.trim(),
        totalBudget: parseFloat(projectBudget) || 100000,
        status: 'In Progress',
        scopeDescription: projectScope.trim() || 'New enterprise scope',
        projectManagerId: projectManagerId ? parseInt(projectManagerId) : null
      };

      await api.createProject(payload);
      setSuccess('Project initialized successfully!');
      setTimeout(() => {
        onClose();
        if (onItemCreated) onItemCreated();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const inputBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.06)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: 540, background: cardBg, borderRadius: 20, border: `1px solid ${border}`, boxShadow: '0 20px 50px rgba(0,0,0,0.4)', overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: textPri, margin: 0 }}>Create Enterprise Record</h2>
            <p style={{ fontSize: 12, color: textMut, margin: 0, marginTop: 2 }}>Strict 3-Tier Multi-Tenant Creation Portal</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${border}`, background: lightMode ? '#FAFBFC' : 'rgba(255,255,255,0.02)' }}>
          {[
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'project', label: 'Project', icon: FolderKanban },
            { id: 'employee', label: 'Workforce', icon: Users },
            { id: 'expense', label: 'Claim', icon: Coins },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                style={{
                  padding: '12px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: active ? (lightMode ? '#FFFFFF' : 'rgba(0,82,204,0.15)') : 'transparent',
                  border: 'none', borderBottom: active ? '2px solid #0052CC' : '2px solid transparent',
                  color: active ? '#0052CC' : textMut, fontSize: 12, fontWeight: active ? 800 : 600, cursor: 'pointer',
                  transition: 'all .15s'
                }}
              >
                <Icon style={{ width: 14, height: 14 }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,86,48,0.12)', border: '1px solid rgba(255,86,48,0.3)', color: '#FF5630', fontSize: 12, marginBottom: 16 }}>
              <AlertCircle style={{ width: 16, height: 16 }} /> {error}
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(54,179,126,0.12)', border: '1px solid rgba(54,179,126,0.3)', color: '#57D9A3', fontSize: 12, marginBottom: 16 }}>
              <CheckCircle2 style={{ width: 16, height: 16 }} /> {success}
            </div>
          )}

          {/* TAB 1: CREATE TASK */}
          {activeTab === 'task' && (
            <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="gs-label" style={{ color: textMut }}>Target Project *</label>
                <select
                  required
                  className="gs-input"
                  style={{ background: inputBg, color: textPri, borderColor: border }}
                  value={taskProjectId}
                  onChange={e => setTaskProjectId(e.target.value)}
                >
                  {projects.map(p => {
                    const id = p.projectId ?? p.ProjectId;
                    const name = p.projectName ?? p.ProjectName ?? `Project #${id}`;
                    return (
                      <option key={id} value={id} style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="gs-label" style={{ color: textMut }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement RBAC Route Guards"
                  className="gs-input"
                  style={{ background: inputBg, color: textPri, borderColor: border }}
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="gs-label" style={{ color: textMut }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Task details..."
                  className="gs-input"
                  style={{ background: inputBg, color: textPri, borderColor: border, resize: 'none' }}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="gs-label" style={{ color: textMut }}>Priority</label>
                  <select
                    className="gs-input"
                    style={{ background: inputBg, color: textPri, borderColor: border }}
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value)}
                  >
                    <option value="Highest" style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>Highest</option>
                    <option value="High" style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>High</option>
                    <option value="Medium" style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>Medium</option>
                    <option value="Low" style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>Low</option>
                  </select>
                </div>

                <div>
                  <label className="gs-label" style={{ color: textMut }}>
                    Assignee {projectMembers.length > 0 && <span style={{ fontSize: 10, color: '#4C9AFF' }}>({projectMembers.length} on project)</span>}
                  </label>
                  <select
                    className="gs-input"
                    style={{ background: inputBg, color: textPri, borderColor: border }}
                    value={taskAssigneeId}
                    onChange={e => setTaskAssigneeId(e.target.value)}
                  >
                    <option value="" style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>Unassigned</option>
                    {projectMembers.length > 0 ? (
                      projectMembers.map(m => (
                        <option key={m.employeeId} value={m.employeeId} style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>
                          {m.fullName} ({m.roleInProject || m.designation}) {m.isProjectManager ? '⭐ PM' : ''}
                        </option>
                      ))
                    ) : (
                      employees.map(emp => {
                        const id = emp.EmployeeId ?? emp.employeeId ?? emp.UserId ?? emp.userId;
                        const name = emp.FullName ?? emp.fullName ?? emp.Email ?? emp.email ?? `Employee #${id}`;
                        return (
                          <option key={id} value={id} style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>
                            {name}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                <div>
                  <label className="gs-label" style={{ color: textMut }}>Story Points</label>
                  <input
                    type="number"
                    min="1" max="13"
                    className="gs-input"
                    style={{ background: inputBg, color: textPri, borderColor: border }}
                    value={taskStoryPoints}
                    onChange={e => setTaskStoryPoints(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
              </button>
            </form>
          )}

          {/* TAB 2: CREATE PROJECT */}
          {activeTab === 'project' && (
            <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="gs-label" style={{ color: textMut }}>Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen ERP Analytics Module"
                  className="gs-input"
                  style={{ background: inputBg, color: textPri, borderColor: border }}
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                />
              </div>

              <div>
                <label className="gs-label" style={{ color: textMut }}>Designate Project Manager (Optional)</label>
                <select
                  className="gs-input"
                  style={{ background: inputBg, color: textPri, borderColor: border }}
                  value={projectManagerId}
                  onChange={e => setProjectManagerId(e.target.value)}
                >
                  <option value="" style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>Select Project Manager from workforce...</option>
                  {employees.map(emp => {
                    const id = emp.EmployeeId ?? emp.employeeId ?? emp.UserId ?? emp.userId;
                    const name = emp.FullName ?? emp.fullName ?? `Employee #${id}`;
                    const desig = emp.Designation ?? emp.designation ?? '';
                    return (
                      <option key={id} value={id} style={{ background: lightMode ? '#FFFFFF' : '#172B4D', color: lightMode ? '#091E42' : '#F4F5F7' }}>
                        {name} {desig ? `· ${desig}` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="gs-label" style={{ color: textMut }}>Total Budget ($)</label>
                <input
                  type="number"
                  placeholder="150000"
                  className="gs-input"
                  style={{ background: inputBg, color: textPri, borderColor: border }}
                  value={projectBudget}
                  onChange={e => setProjectBudget(e.target.value)}
                />
              </div>

              <div>
                <label className="gs-label" style={{ color: textMut }}>Project Scope & Deliverables</label>
                <textarea
                  rows={3}
                  placeholder="Scope description and objectives..."
                  className="gs-input"
                  style={{ background: inputBg, color: textPri, borderColor: border, resize: 'none' }}
                  value={projectScope}
                  onChange={e => setProjectScope(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Initialize New Project'}
              </button>
            </form>
          )}

          {/* TAB 3 & 4 (Placeholders for Staff/Expense quick action) */}
          {(activeTab === 'employee' || activeTab === 'expense') && (
            <div style={{ padding: 20, textAlign: 'center', color: textMut, fontSize: 13 }}>
              Use the Workforce or Finance dashboard pages to access full employee onboarding and financial ledger options.
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
