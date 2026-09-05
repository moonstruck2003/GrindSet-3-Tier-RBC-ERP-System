import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, X, Target, FileText, DollarSign, Users,
  CheckSquare, Coins, Calendar, ArrowRight, Plus, UserPlus,
  Trash2, Lock, Sparkles
} from 'lucide-react';
import { api } from '../config/api';

export default function ProjectDetailModal({ isOpen, onClose, project, accounts = [], tasks = [], lightMode, onOpenCreateModal }) {
  if (!isOpen || !project) return null;

  const [members, setMembers] = useState([]);
  const [workforce, setWorkforce] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [memberRole, setMemberRole] = useState('Team Member');
  const [actionMsg, setActionMsg] = useState('');

  let user = null;
  try {
    const raw = localStorage.getItem('grindset_user');
    if (raw) user = JSON.parse(raw);
  } catch {}

  const projId = Number(project.ProjectId || project.projectId);
  const projName = project.ProjectName || project.projectName || `Project #${projId}`;
  const projBudget = Number(project.TotalBudget || project.totalBudget || 0);
  const projStatus = project.Status || project.status || 'In Progress';
  const scopeDesc = project.ScopeDescription || project.scopeDescription || 'Enterprise software architecture and multi-tenant subsystem rollout.';
  const objectives = project.Objectives || project.objectives || 'On-time sprint milestones, high performance, and compliance.';
  const pmName = project.projectManagerName || project.ProjectManagerName || 'Unassigned';
  const pmId = project.projectManagerId || project.ProjectManagerId;

  const isCompany = user?.role === 'Company' || user?.role === 'Admin';
  const isPM = (pmId && Number(pmId) === Number(user?.userId)) || project.isManager || project.IsManager;
  const isMember = isCompany || isPM || project.isMember || project.IsMember || members.some(m => Number(m.employeeId || m.EmployeeId) === Number(user?.userId));
  const canManageTeam = isCompany || isPM;

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await api.projectMembers(projId);
      setMembers(res || []);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
    if (canManageTeam) {
      api.employees().then(e => setWorkforce(e || [])).catch(() => setWorkforce([]));
    }
  }, [projId]);

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    try {
      await api.addProjectMember(projId, {
        employeeId: parseInt(selectedEmpId),
        roleInProject: memberRole
      });
      setActionMsg('Team member recruited successfully!');
      setTimeout(() => setActionMsg(''), 3000);
      setShowAddMember(false);
      setSelectedEmpId('');
      loadMembers();
    } catch (err) {
      alert(err.message || 'Failed to add member to project.');
    }
  };

  const handleRemoveMember = async (empId) => {
    if (!window.confirm('Remove this member from the project roster?')) return;
    try {
      await api.removeProjectMember(projId, empId);
      setActionMsg('Member removed from project roster.');
      setTimeout(() => setActionMsg(''), 3000);
      loadMembers();
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  // Filter project-specific accounts & tasks
  const projAccounts = accounts.filter(a => Number(a.ProjectId || a.projectId) === projId);
  const projTasks = tasks.filter(t => Number(t.ProjectId || t.projectId) === projId);
  const completedTasks = projTasks.filter(t => (t.Status || t.status) === 'Done');
  const pctComplete = projTasks.length > 0 ? Math.round((completedTasks.length / projTasks.length) * 100) : 45;

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const sectionBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.04)';
  const inputBg = lightMode ? '#FFFFFF' : '#172B4D';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        style={{
          width: '100%', maxWidth: 580, height: '100vh', background: cardBg,
          borderLeft: `1px solid ${border}`, boxShadow: '-12px 0 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ padding: '22px 26px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0052CC, #36B37E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FolderKanban style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: textPri, margin: 0 }}>{projName}</h2>
                <span className={`pill ${projStatus === 'In Progress' ? 'pill-blue' : 'pill-green'}`}>
                  {projStatus}
                </span>
                {isPM ? (
                  <span className="pill pill-gold" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles style={{ width: 11, height: 11 }} /> You are Project Manager
                  </span>
                ) : isMember ? (
                  <span className="pill pill-green">Team Member</span>
                ) : (
                  <span className="pill" style={{ background: 'rgba(255,255,255,0.08)', color: textMut }}>Company Portfolio</span>
                )}
              </div>
              <p style={{ fontSize: 11, color: textMut, margin: 0, marginTop: 4 }}>
                Project Manager: <strong style={{ color: textPri }}>{pmName}</strong> &nbsp;·&nbsp; Project #{String(projId).padStart(3, '0')}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Non-Member Banner */}
        {!isMember && (
          <div style={{ margin: '16px 24px 0', padding: '12px 16px', borderRadius: 12, background: 'rgba(0,82,204,0.08)', border: '1px solid rgba(0,82,204,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock style={{ width: 16, height: 16, color: '#4C9AFF', flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: textPri }}>
              <strong>Read-Only Overview (Non-Member):</strong> You are not currently assigned to this project. Operating account details and task creation are managed by Project Manager <strong>{pmName}</strong>.
            </div>
          </div>
        )}

        {actionMsg && (
          <div style={{ margin: '12px 24px 0', padding: '10px 14px', borderRadius: 10, background: 'rgba(54,179,126,0.15)', border: '1px solid rgba(54,179,126,0.3)', color: '#57D9A3', fontSize: 12, fontWeight: 700 }}>
            {actionMsg}
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 12, background: sectionBg, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: textMut }}>Total Budget</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#57D9A3', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                ${projBudget.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: sectionBg, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: textMut }}>Sprint Progress</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#4C9AFF', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                {pctComplete}%
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: sectionBg, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: textMut }}>Team Size</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#FFDA75', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                {members.length} Members
              </div>
            </div>
          </div>

          {/* Scope & Strategic Objectives */}
          <div style={{ padding: 18, borderRadius: 14, background: sectionBg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <FileText style={{ width: 16, height: 16, color: '#0052CC' }} />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: textPri, margin: 0 }}>Project Scope Description</h3>
            </div>
            <p style={{ fontSize: 12, color: textMut, margin: 0, lineHeight: 1.5 }}>{scopeDesc}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 6 }}>
              <Target style={{ width: 16, height: 16, color: '#36B37E' }} />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: textPri, margin: 0 }}>Strategic Objectives</h3>
            </div>
            <p style={{ fontSize: 12, color: textMut, margin: 0, lineHeight: 1.5 }}>{objectives}</p>
          </div>

          {/* ── Project Team Roster ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users style={{ width: 16, height: 16, color: '#4C9AFF' }} />
                <h3 style={{ fontSize: 13, fontWeight: 800, color: textPri, margin: 0 }}>Project Team Roster ({members.length})</h3>
              </div>
              {canManageTeam && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="btn-primary"
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <UserPlus style={{ width: 12, height: 12 }} /> {showAddMember ? 'Cancel' : 'Recruit Member'}
                </button>
              )}
            </div>

            {/* Recruit Member Form */}
            {canManageTeam && showAddMember && (
              <form onSubmit={handleAddMemberSubmit} style={{ padding: 14, borderRadius: 12, background: sectionBg, border: `1px solid ${border}`, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: textPri }}>Recruit Employee from Company Workforce</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="gs-label" style={{ color: textMut }}>Workforce Member</label>
                    <select
                      required
                      className="gs-input"
                      style={{ background: inputBg, color: textPri, borderColor: border }}
                      value={selectedEmpId}
                      onChange={e => setSelectedEmpId(e.target.value)}
                    >
                      <option value="">Select Employee...</option>
                      {workforce
                        .filter(w => !members.some(m => Number(m.employeeId || m.EmployeeId) === Number(w.employeeId || w.EmployeeId)))
                        .map(emp => {
                          const id = emp.EmployeeId ?? emp.employeeId;
                          return (
                            <option key={id} value={id}>
                              {emp.FullName || emp.fullName} ({emp.Designation || emp.designation})
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  <div>
                    <label className="gs-label" style={{ color: textMut }}>Role in Project</label>
                    <input
                      type="text"
                      className="gs-input"
                      style={{ background: inputBg, color: textPri, borderColor: border }}
                      value={memberRole}
                      onChange={e => setMemberRole(e.target.value)}
                      placeholder="e.g. Lead Architect, QA Specialist"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, alignSelf: 'flex-start' }}>
                  Confirm Assignment
                </button>
              </form>
            )}

            {/* Members List */}
            {loadingMembers ? (
              <div style={{ fontSize: 12, color: textMut }}>Loading project roster...</div>
            ) : members.length === 0 ? (
              <div style={{ padding: 14, borderRadius: 10, background: sectionBg, color: textMut, fontSize: 12 }}>
                No members assigned to this project yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {members.map(m => {
                  const empId = m.employeeId || m.EmployeeId;
                  const isManager = m.isProjectManager || m.IsProjectManager || (pmId && Number(pmId) === Number(empId));
                  return (
                    <div key={empId} style={{ padding: '10px 14px', borderRadius: 10, background: sectionBg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: textPri }}>{m.fullName || m.FullName}</span>
                          {isManager && (
                            <span className="pill pill-gold" style={{ fontSize: 9 }}>Project Manager</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: textMut, marginTop: 2 }}>
                          {m.roleInProject || m.RoleInProject || 'Team Member'} &nbsp;·&nbsp; {m.designation || m.Designation}
                        </div>
                      </div>
                      {canManageTeam && !isManager && (
                        <button
                          onClick={() => handleRemoveMember(empId)}
                          style={{ background: 'transparent', border: 'none', color: '#FF5630', cursor: 'pointer', padding: 4 }}
                          title="Remove from project"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Linked Operating Financial Accounts (Hidden from non-members) */}
          {isMember ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Coins style={{ width: 16, height: 16, color: '#BF9AFF' }} />
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: textPri, margin: 0 }}>Operating Accounts ({projAccounts.length})</h3>
                </div>
              </div>

              {projAccounts.length === 0 ? (
                <div style={{ padding: 12, borderRadius: 10, background: sectionBg, color: textMut, fontSize: 12 }}>
                  No dedicated accounts registered yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {projAccounts.map(acc => {
                    const bal = Number(acc.CurrentBalance || acc.currentBalance || 0);
                    const alloc = Number(acc.AllocatedBudget || acc.allocatedBudget || 1);
                    return (
                      <div key={acc.AccountId || acc.accountId} style={{ padding: '10px 14px', borderRadius: 10, background: sectionBg, border: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: textPri }}>{acc.AccountName || acc.accountName}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>
                          ${bal.toLocaleString()} / ${alloc.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {/* Project Sprint Tasks */}
          {isMember ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckSquare style={{ width: 16, height: 16, color: '#FFDA75' }} />
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: textPri, margin: 0 }}>Project Sprint Backlog ({projTasks.length})</h3>
                </div>
                {canManageTeam && (
                  <button
                    onClick={() => { onClose(); if (onOpenCreateModal) onOpenCreateModal(); }}
                    className="btn-primary"
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus style={{ width: 12, height: 12 }} /> Add Task
                  </button>
                )}
              </div>

              {projTasks.length === 0 ? (
                <div style={{ padding: 16, borderRadius: 10, background: sectionBg, color: textMut, fontSize: 12, textAlign: 'center' }}>
                  No active tasks linked to this project yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {projTasks.map(t => {
                    const id = t.TaskId || t.taskId;
                    const title = t.Title || t.title;
                    const pri = t.Priority || t.priority || 'Medium';
                    const st = t.Status || t.status || 'To Do';
                    const pts = t.StoryPoints || t.storyPoints || 1;

                    return (
                      <div key={id} style={{ padding: '10px 12px', borderRadius: 10, background: sectionBg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: textPri }}>{title}</div>
                          <div style={{ fontSize: 10, color: textMut, marginTop: 2 }}>Priority: {pri} &nbsp;·&nbsp; {pts} Story Points</div>
                        </div>
                        <span className={`pill ${st === 'Done' ? 'pill-green' : st === 'In Progress' ? 'pill-gold' : 'pill-blue'}`} style={{ fontSize: 9 }}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div style={{ padding: 20, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
            Close Inspector
          </button>
        </div>

      </motion.div>
    </div>
  );
}
