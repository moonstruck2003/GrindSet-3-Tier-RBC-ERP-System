import React from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban, X, Target, FileText, DollarSign, Users,
  CheckSquare, Coins, Calendar, ArrowRight, Plus
} from 'lucide-react';

export default function ProjectDetailModal({ isOpen, onClose, project, accounts = [], tasks = [], lightMode, onOpenCreateModal }) {
  if (!isOpen || !project) return null;

  const projId = Number(project.ProjectId || project.projectId);
  const projName = project.ProjectName || project.projectName || `Project #${projId}`;
  const projBudget = Number(project.TotalBudget || project.totalBudget || 0);
  const projStatus = project.Status || project.status || 'In Progress';
  const scopeDesc = project.ScopeDescription || project.scopeDescription || 'Enterprise software architecture and multi-tenant subsystem rollout.';
  const objectives = project.Objectives || project.objectives || 'On-time sprint milestones, high performance, and compliance.';

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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        style={{
          width: '100%', maxWidth: 540, height: '100vh', background: cardBg,
          borderLeft: `1px solid ${border}`, boxShadow: '-12px 0 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0052CC, #36B37E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FolderKanban style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: textPri, margin: 0 }}>{projName}</h2>
                <span className={`pill ${projStatus === 'In Progress' ? 'pill-blue' : 'pill-green'}`}>
                  {projStatus}
                </span>
              </div>
              <p style={{ fontSize: 11, color: textMut, margin: 0, marginTop: 2 }}>Project #{String(projId).padStart(3, '0')} &nbsp;·&nbsp; GAAP Compliant Portfolio Scope</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

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
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: textMut }}>Active Tasks</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#FFDA75', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                {projTasks.length} Tasks
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

          {/* Linked Operating Financial Accounts */}
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

          {/* Project Sprint Tasks */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare style={{ width: 16, height: 16, color: '#FFDA75' }} />
                <h3 style={{ fontSize: 13, fontWeight: 800, color: textPri, margin: 0 }}>Project Sprint Backlog ({projTasks.length})</h3>
              </div>
              <button
                onClick={() => { onClose(); if (onOpenCreateModal) onOpenCreateModal(); }}
                className="btn-primary"
                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus style={{ width: 12, height: 12 }} /> Add Task
              </button>
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
