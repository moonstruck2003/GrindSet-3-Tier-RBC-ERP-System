import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ShieldCheck, RefreshCw, Download, FileSpreadsheet, Plus, CheckCircle2,
  XCircle, Clock, AlertTriangle, UserCheck, Layers, Coins, Calculator,
  FolderKanban, Filter, Grid, ListFilter, CheckSquare
} from 'lucide-react';
import { api } from '../config/api';
import FundReallocationModal from '../components/FundReallocationModal';
import ExpenseClaimModal from '../components/ExpenseClaimModal';

export default function FinancePage({ lightMode }) {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'isolated' (Each project has its own distinct ledger card) or 'consolidated' (One master table)
  const [viewMode, setViewMode] = useState('isolated');

  // Selected Project Filter in Consolidated View ('all' or numeric project ID)
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  // Modals state
  const [reallocModalOpen, setReallocModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [modalTargetProjectId, setModalTargetProjectId] = useState(null);

  // Timesheet calculator state (Employee)
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(85);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [projRes, accRes, txRes] = await Promise.all([
        api.projects().catch(() => []),
        api.accounts().catch(() => []),
        api.transactions().catch(() => []),
      ]);
      setProjects(projRes);
      setAccounts(accRes);
      setTransactions(txRes);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('grindset_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}

    loadFinanceData();
  }, []);

  const userRole = user?.role || 'Company';
  const isCfoScope = userRole === 'Admin' || userRole === 'Company';

  // Handle Approvals / Rejections (CFO Scope)
  const handleApproveExpense = async (txId) => {
    try {
      await api.approveExpense(txId);
      loadFinanceData();
    } catch (err) {
      alert(err.message || 'Failed to approve expense.');
    }
  };

  const handleRejectExpense = async (txId) => {
    try {
      await api.rejectExpense(txId);
      loadFinanceData();
    } catch (err) {
      alert(err.message || 'Failed to reject expense.');
    }
  };

  // Helper: Robust Transaction Enrichment (Ensures ProjectId & ProjectName are never undefined)
  const enrichedTransactions = transactions.map(t => {
    const acc = accounts.find(a => Number(a.AccountId || a.accountId) === Number(t.AccountId || t.accountId));
    const projId = t.ProjectId ?? t.projectId ?? acc?.ProjectId ?? acc?.projectId ?? 1;
    const proj = projects.find(p => Number(p.ProjectId || p.projectId) === Number(projId));
    const projName = t.ProjectName ?? t.projectName ?? acc?.ProjectName ?? acc?.projectName ?? proj?.ProjectName ?? proj?.projectName ?? `Project #${projId}`;

    return {
      raw: t,
      txId: t.TransactionId || t.transactionId,
      accountId: t.AccountId || t.accountId,
      accName: t.AccountName || t.accountName || acc?.AccountName || acc?.accountName || 'Financial Account',
      projId: Number(projId),
      projName,
      loggedBy: t.LoggedBy || t.loggedBy || 'System',
      type: t.Type || t.type || 'Expense',
      amount: Number(t.Amount || t.amount || 0),
      status: t.Status || t.status || 'Approved',
      note: t.Note || t.note || '',
      txDate: t.TransactionDate || t.transactionDate || Date.now()
    };
  });

  // Global KPI Calculations
  const totalAllocated = accounts.reduce((s, a) => s + Number(a.AllocatedBudget || a.allocatedBudget || 0), 0);
  const totalBalance = accounts.reduce((s, a) => s + Number(a.CurrentBalance || a.currentBalance || 0), 0);
  const approvedExpenses = enrichedTransactions.filter(t => t.status === 'Approved').reduce((s, t) => s + t.amount, 0);
  const pendingClaims = enrichedTransactions.filter(t => t.status === 'PendingApproval');

  // Employee calculated earnings
  const monthlyEarnings = weeklyHours * hourlyRate * 4.33;

  // Theme tokens
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const cardBg = lightMode ? 'rgba(255,255,255,0.92)' : 'rgba(11,27,61,0.65)';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.08)';
  const sectionBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';
  const inputBg = lightMode ? '#FFFFFF' : 'rgba(255,255,255,0.05)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

      {/* Header Banner */}
      <div className="glass" style={{ padding: '24px 30px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(0,82,204,0.18), rgba(101,84,192,0.18))', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #0052CC, #6554C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,82,204,0.3)' }}>
              <Coins style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: textPri, margin: 0 }}>
                  Multi-Project General Ledger & Finance Hub
                </h1>
                <span className={`pill ${isCfoScope ? 'pill-blue' : 'pill-green'}`}>
                  {isCfoScope ? 'CFO Controller Scope' : 'Employee Timesheet & Claims'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: textMut, margin: 0, marginTop: 4 }}>
                Multi-Tenant Financial Subsystem &nbsp;·&nbsp; Isolated Project Ledgers &nbsp;·&nbsp; GAAP Accounting
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={`${api.exportCsvUrl()}${selectedProjectId !== 'all' ? `?projectId=${selectedProjectId}` : ''}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button className="btn-ghost" style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download style={{ width: 14, height: 14 }} /> Download Master CSV
              </button>
            </a>

            {isCfoScope && (
              <button
                onClick={() => { setModalTargetProjectId(null); setReallocModalOpen(true); }}
                className="btn-primary"
                style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#6554C0', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw style={{ width: 14, height: 14 }} /> Reallocate Budget
              </button>
            )}

            <button
              onClick={() => { setModalTargetProjectId(null); setClaimModalOpen(true); }}
              className="btn-primary"
              style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Submit Expense Claim
            </button>
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#57D9A3', letterSpacing: '0.06em' }}>Total Enterprise Budget</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>${totalAllocated.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Across {projects.length} Projects & {accounts.length} Accounts</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#4C9AFF', letterSpacing: '0.06em' }}>Current Liquidity Balance</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>${totalBalance.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Available Liquid Capital</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#BF9AFF', letterSpacing: '0.06em' }}>Total Cleared Expenses</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>${approvedExpenses.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Cleared Ledger Entries</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FFAB00', letterSpacing: '0.06em' }}>Pending Claims Queue</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{pendingClaims.length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Reimbursement Claims</div>
        </motion.div>
      </div>

      {/* ── VIEW MODE SWITCHER BAR ── */}
      <div className="glass" style={{ padding: '16px 24px', borderRadius: 16, background: cardBg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FolderKanban style={{ width: 20, height: 20, color: '#0052CC' }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: textPri }}>Ledger Presentation Mode:</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setViewMode('isolated')}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: viewMode === 'isolated' ? '#0052CC' : 'transparent',
              color: viewMode === 'isolated' ? 'white' : textMut,
              border: `1px solid ${viewMode === 'isolated' ? '#0052CC' : border}`,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s'
            }}
          >
            <Grid style={{ width: 14, height: 14 }} /> Distinct Project-Isolated Ledgers
          </button>

          <button
            onClick={() => setViewMode('consolidated')}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: viewMode === 'consolidated' ? '#0052CC' : 'transparent',
              color: viewMode === 'consolidated' ? 'white' : textMut,
              border: `1px solid ${viewMode === 'consolidated' ? '#0052CC' : border}`,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s'
            }}
          >
            <ListFilter style={{ width: 14, height: 14 }} /> Unified Master Consolidated Table
          </button>
        </div>
      </div>

      {/* ── PERSPECTIVE 1: CFO / COMPANY OWNER WORKSPACE ── */}
      {isCfoScope && (
        <>
          {/* MODE A: DISTINCT PROJECT-ISOLATED LEDGERS (EACH PROJECT HAS ITS OWN CARD & LEDGER TABLE) */}
          {viewMode === 'isolated' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {projects.map(proj => {
                const projId = Number(proj.projectId || proj.ProjectId);
                const projName = proj.projectName || proj.ProjectName || `Project #${projId}`;
                const projBudget = Number(proj.totalBudget || proj.TotalBudget || 0);
                const projStatus = proj.status || proj.Status || 'In Progress';

                // Project-specific accounts
                const projAccounts = accounts.filter(a => Number(a.ProjectId || a.projectId) === projId);
                const projAllocated = projAccounts.reduce((s, a) => s + Number(a.AllocatedBudget || a.allocatedBudget || 0), 0);
                const projBalance = projAccounts.reduce((s, a) => s + Number(a.CurrentBalance || a.currentBalance || 0), 0);

                // Project-specific transactions
                const projTxs = enrichedTransactions.filter(t => t.projId === projId);
                const projApprovedTxs = projTxs.filter(t => t.status === 'Approved');
                const projPendingTxs = projTxs.filter(t => t.status === 'PendingApproval');

                return (
                  <motion.div
                    key={projId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  >
                    {/* Project Ledger Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, paddingBottom: 18, borderBottom: `1px solid ${border}`, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #0052CC, #36B37E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <FolderKanban style={{ width: 22, height: 22 }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: textPri, margin: 0 }}>{projName}</h2>
                            <span className={`pill ${projStatus === 'In Progress' ? 'pill-blue' : 'pill-purple'}`}>
                              {projStatus}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: textMut, margin: 0, marginTop: 2 }}>
                            Total Budget: <strong style={{ color: textPri }}>${projBudget.toLocaleString()}</strong> &nbsp;·&nbsp; {projAccounts.length} Financial Accounts &nbsp;·&nbsp; {projTxs.length} Ledger Entries
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={`${api.exportCsvUrl()}?projectId=${projId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <button className="btn-ghost" style={{ padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Download style={{ width: 13, height: 13 }} /> Export {projName} CSV
                          </button>
                        </a>

                        <button
                          onClick={() => { setModalTargetProjectId(projId); setClaimModalOpen(true); }}
                          className="btn-primary"
                          style={{ padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <Plus style={{ width: 13, height: 13 }} /> Log Claim for Project
                        </button>
                      </div>
                    </div>

                    {/* Sub-Section 1: Operating Accounts */}
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: textMut, letterSpacing: '0.06em', marginBottom: 12 }}>
                        Project Operating Accounts ({projAccounts.length})
                      </h3>

                      {projAccounts.length === 0 ? (
                        <div style={{ padding: 14, borderRadius: 10, background: sectionBg, color: textMut, fontSize: 12 }}>
                          No financial operating accounts registered for this project yet.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                          {projAccounts.map(acc => {
                            const accId = acc.AccountId || acc.accountId;
                            const accName = acc.AccountName || acc.accountName;
                            const allocated = Number(acc.AllocatedBudget || acc.allocatedBudget || 1);
                            const balance = Number(acc.CurrentBalance || acc.currentBalance || 0);
                            const pct = Math.max(0, Math.min(100, Math.round((balance / allocated) * 100)));
                            const isOverrun = pct < 20;

                            return (
                              <div key={accId} style={{ padding: 16, borderRadius: 12, background: sectionBg, border: `1px solid ${isOverrun ? 'rgba(255,86,48,0.4)' : border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <div style={{ fontWeight: 800, fontSize: 13, color: textPri }}>{accName}</div>
                                  {isOverrun && (
                                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, background: 'rgba(255,86,48,0.15)', color: '#FF8F73' }}>
                                      Low Liquidity
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: textMut, marginBottom: 6 }}>
                                  <span>Liquidity Balance</span>
                                  <span style={{ fontWeight: 800, color: isOverrun ? '#FF8F73' : '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>
                                    ${balance.toLocaleString()} / ${allocated.toLocaleString()}
                                  </span>
                                </div>

                                <div style={{ height: 5, borderRadius: 99, background: lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: isOverrun ? 'linear-gradient(90deg, #FF8F73, #FF5630)' : 'linear-gradient(90deg, #0052CC, #36B37E)', transition: 'width 0.5s' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Sub-Section 2: Pending Claims for Project */}
                    {projPendingTxs.length > 0 && (
                      <div style={{ marginBottom: 20, padding: 16, borderRadius: 14, background: 'rgba(255,171,0,0.06)', border: '1px solid rgba(255,171,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Clock style={{ width: 16, height: 16, color: '#FFAB00' }} />
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: textPri, margin: 0 }}>
                            Pending Claims for {projName} ({projPendingTxs.length})
                          </h4>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                          <table className="gs-table">
                            <thead>
                              <tr>
                                <th>Claim ID</th>
                                <th>Category</th>
                                <th>Logged By</th>
                                <th>Note</th>
                                <th>Amount</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projPendingTxs.map(t => (
                                <tr key={t.txId}>
                                  <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4C9AFF' }}>#EXP-{t.txId}</td>
                                  <td style={{ fontWeight: 700, color: textPri }}>{t.type}</td>
                                  <td>{t.loggedBy}</td>
                                  <td style={{ fontSize: 11, color: textMut }}>{t.note}</td>
                                  <td style={{ fontWeight: 800, color: '#FFDA75', fontFamily: 'JetBrains Mono, monospace' }}>${t.amount.toLocaleString()}</td>
                                  <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button onClick={() => handleApproveExpense(t.txId)} style={{ padding: '4px 10px', borderRadius: 6, background: '#36B37E', color: 'white', fontWeight: 700, fontSize: 10, border: 'none', cursor: 'pointer' }}>
                                        Approve
                                      </button>
                                      <button onClick={() => handleRejectExpense(t.txId)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,86,48,0.15)', color: '#FF8F73', border: '1px solid rgba(255,86,48,0.3)', fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>
                                        Reject
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Sub-Section 3: Dedicated Project General Ledger Table */}
                    <div>
                      <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: textMut, letterSpacing: '0.06em', marginBottom: 12 }}>
                        {projName} — Dedicated General Ledger ({projApprovedTxs.length})
                      </h3>

                      {projApprovedTxs.length === 0 ? (
                        <div style={{ padding: 20, borderRadius: 12, background: sectionBg, textAlign: 'center', color: textMut, fontSize: 12 }}>
                          No cleared ledger entries for {projName} yet.
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="gs-table">
                            <thead>
                              <tr>
                                <th>TX ID</th>
                                <th>Account</th>
                                <th>Category / Type</th>
                                <th>Logged By</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projApprovedTxs.map(t => (
                                <tr key={t.txId}>
                                  <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: textMut }}>#{t.txId}</td>
                                  <td style={{ fontWeight: 700, color: textPri }}>{t.accName}</td>
                                  <td>{t.type}</td>
                                  <td>{t.loggedBy}</td>
                                  <td style={{ fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>${t.amount.toLocaleString()}</td>
                                  <td>
                                    <span className="pill pill-green">Approved</span>
                                  </td>
                                  <td style={{ fontSize: 11, color: textMut }}>{new Date(t.txDate).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

          {/* MODE B: UNIFIED MASTER CONSOLIDATED TABLE VIEW */}
          {viewMode === 'consolidated' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Filter Selector */}
              <div className="glass" style={{ padding: '14px 20px', borderRadius: 14, background: cardBg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Filter style={{ width: 16, height: 16, color: '#4C9AFF' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: textMut }}>Filter Master View:</span>
                <select
                  className="gs-input"
                  style={{ width: 220, padding: '6px 10px', fontSize: 12 }}
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                >
                  <option value="all">All Projects ({projects.length})</option>
                  {projects.map(p => {
                    const id = p.projectId || p.ProjectId;
                    return <option key={id} value={id}>{p.projectName || p.ProjectName}</option>;
                  })}
                </select>
              </div>

              {/* Master Ledger Table */}
              <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileSpreadsheet style={{ width: 20, height: 20, color: '#57D9A3' }} />
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Unified Master General Ledger</h2>
                  </div>
                  <span style={{ fontSize: 11, color: textMut }}>{enrichedTransactions.length} Total Records</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="gs-table">
                    <thead>
                      <tr>
                        <th>TX ID</th>
                        <th>Project Scope</th>
                        <th>Account</th>
                        <th>Category / Type</th>
                        <th>Logged By</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrichedTransactions
                        .filter(t => selectedProjectId === 'all' || String(t.projId) === String(selectedProjectId))
                        .map(t => (
                          <tr key={t.txId}>
                            <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: textMut }}>#{t.txId}</td>
                            <td style={{ fontWeight: 700, fontSize: 12, color: '#4C9AFF' }}>📁 {t.projName}</td>
                            <td style={{ fontWeight: 700, color: textPri }}>{t.accName}</td>
                            <td>{t.type}</td>
                            <td>{t.loggedBy}</td>
                            <td style={{ fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>${t.amount.toLocaleString()}</td>
                            <td>
                              <span className={`pill ${t.status === 'Approved' ? 'pill-green' : t.status === 'PendingApproval' ? 'pill-gold' : 'pill-red'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ fontSize: 11, color: textMut }}>{new Date(t.txDate).toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── PERSPECTIVE 2: EMPLOYEE TIMESHEET & CLAIMS WORKSPACE ── */}
      {!isCfoScope && (
        <>
          {/* Hourly Billing Timesheet Calculator */}
          <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Calculator style={{ width: 20, height: 20, color: '#57D9A3' }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>My Hourly Timesheet & Billable Earnings Calculator</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              <div style={{ padding: 18, borderRadius: 14, background: sectionBg, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="gs-label" style={{ color: textMut }}>Hourly Billing Rate ($/hr)</label>
                  <input
                    type="number"
                    className="gs-input"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: textMut, marginBottom: 4 }}>
                    <span>Weekly Billable Hours</span>
                    <span style={{ fontWeight: 800, color: textPri }}>{weeklyHours} hrs / week</span>
                  </div>
                  <input
                    type="range"
                    min="10" max="60" step="1"
                    style={{ width: '100%', accentColor: '#0052CC' }}
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ padding: 20, borderRadius: 14, background: 'linear-gradient(135deg, rgba(54,179,126,0.15), rgba(0,82,204,0.15))', border: '1px solid rgba(54,179,126,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#57D9A3', letterSpacing: '0.06em' }}>Estimated Gross Monthly Earnings</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: textPri, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                  ${monthlyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 11, color: textMut, marginTop: 6 }}>
                  Based on {weeklyHours * 4.33} monthly billable hours @ ${hourlyRate}/hr
                </div>
              </div>
            </div>
          </div>

          {/* Employee Reimbursement Claims Tracker */}
          <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Coins style={{ width: 20, height: 20, color: '#4C9AFF' }} />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>My Reimbursement Expense Claims</h2>
              </div>
              <button onClick={() => setClaimModalOpen(true)} className="btn-primary" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                + Submit New Claim
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="gs-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Claim Description</th>
                    <th>Amount</th>
                    <th>Approval Status</th>
                    <th>Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedTransactions.map(t => (
                    <tr key={t.txId}>
                      <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: textMut }}>#EXP-{t.txId}</td>
                      <td style={{ fontWeight: 700, fontSize: 12, color: '#4C9AFF' }}>📁 {t.projName}</td>
                      <td style={{ fontWeight: 700, color: textPri }}>{t.type}</td>
                      <td style={{ fontSize: 12, color: textMut }}>{t.note || 'Reimbursement claim'}</td>
                      <td style={{ fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>${t.amount.toLocaleString()}</td>
                      <td>
                        <span className={`pill ${t.status === 'Approved' ? 'pill-green' : t.status === 'PendingApproval' ? 'pill-gold' : 'pill-red'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: textMut }}>{new Date(t.txDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Render Modals */}
      <FundReallocationModal
        isOpen={reallocModalOpen}
        onClose={() => setReallocModalOpen(false)}
        accounts={accounts}
        projects={projects}
        onReallocated={loadFinanceData}
        lightMode={lightMode}
      />

      <ExpenseClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        accounts={accounts}
        projects={projects}
        user={user}
        onClaimSubmitted={loadFinanceData}
        lightMode={lightMode}
      />

    </div>
  );
}
