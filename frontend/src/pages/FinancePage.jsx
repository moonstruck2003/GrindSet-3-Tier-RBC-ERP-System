import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ShieldCheck, RefreshCw, Download, FileSpreadsheet, Plus, CheckCircle2,
  XCircle, Clock, AlertTriangle, UserCheck, Layers, Coins, Calculator
} from 'lucide-react';
import { api } from '../config/api';
import FundReallocationModal from '../components/FundReallocationModal';
import ExpenseClaimModal from '../components/ExpenseClaimModal';

export default function FinancePage({ lightMode }) {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [reallocModalOpen, setReallocModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  // Timesheet calculator state (Employee)
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(85);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [accRes, txRes] = await Promise.all([
        api.accounts().catch(() => []),
        api.transactions().catch(() => []),
      ]);
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

  // Calculations
  const totalAllocated = accounts.reduce((s, a) => s + Number(a.AllocatedBudget || a.allocatedBudget || 0), 0);
  const totalBalance = accounts.reduce((s, a) => s + Number(a.CurrentBalance || a.currentBalance || 0), 0);
  const approvedExpenses = transactions.filter(t => (t.Status || t.status) === 'Approved').reduce((s, t) => s + Number(t.Amount || t.amount || 0), 0);
  const pendingClaims = transactions.filter(t => (t.Status || t.status) === 'PendingApproval');

  // Employee calculated earnings
  const monthlyEarnings = weeklyHours * hourlyRate * 4.33;

  // Theme tokens
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const cardBg = lightMode ? 'rgba(255,255,255,0.92)' : 'rgba(11,27,61,0.65)';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.08)';
  const sectionBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';

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
                  General Ledger & Finance Hub
                </h1>
                <span className={`pill ${isCfoScope ? 'pill-blue' : 'pill-green'}`}>
                  {isCfoScope ? 'CFO Controller Scope' : 'Employee Timesheet & Claims'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: textMut, margin: 0, marginTop: 4 }}>
                Enterprise Financial Subsystem &nbsp;·&nbsp; GAAP Accounting Ledger &nbsp;·&nbsp; Expense Management
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={api.exportCsvUrl()}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button className="btn-ghost" style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download style={{ width: 14, height: 14 }} /> Download CSV Ledger
              </button>
            </a>

            {isCfoScope && (
              <button
                onClick={() => setReallocModalOpen(true)}
                className="btn-primary"
                style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#6554C0', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw style={{ width: 14, height: 14 }} /> Reallocate Budget
              </button>
            )}

            <button
              onClick={() => setClaimModalOpen(true)}
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
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#57D9A3', letterSpacing: '0.06em' }}>Total Allocated Budget</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>${totalAllocated.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Across {accounts.length} Operating Accounts</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#4C9AFF', letterSpacing: '0.06em' }}>Current Liquidity Balance</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>${totalBalance.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Available Liquid Funds</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#BF9AFF', letterSpacing: '0.06em' }}>Total Approved Expenses</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>${approvedExpenses.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Cleared Transactions</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FFAB00', letterSpacing: '0.06em' }}>Pending Claims Queue</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: textPri, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{pendingClaims.length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Reimbursement Claims</div>
        </motion.div>
      </div>

      {/* ── PERSPECTIVE 1: CFO / COMPANY OWNER WORKSPACE ── */}
      {isCfoScope && (
        <>
          {/* Financial Accounts & Operating Budgets */}
          <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers style={{ width: 20, height: 20, color: '#4C9AFF' }} />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Project Financial Accounts & Liquidity</h2>
              </div>
              <button onClick={() => setReallocModalOpen(true)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>
                Reallocate Funds
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {accounts.map(acc => {
                const allocated = Number(acc.AllocatedBudget || acc.allocatedBudget || 1);
                const balance = Number(acc.CurrentBalance || acc.currentBalance || 0);
                const pct = Math.max(0, Math.min(100, Math.round((balance / allocated) * 100)));
                const isOverrun = pct < 20;

                return (
                  <div key={acc.AccountId || acc.accountId} style={{ padding: 18, borderRadius: 14, background: sectionBg, border: `1px solid ${isOverrun ? 'rgba(255,86,48,0.4)' : border}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: textPri }}>{acc.AccountName || acc.accountName}</div>
                      {isOverrun && (
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,86,48,0.15)', color: '#FF8F73', border: '1px solid rgba(255,86,48,0.3)' }}>
                          Low Liquidity
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: textMut, marginBottom: 6 }}>
                      <span>Liquidity Balance</span>
                      <span style={{ fontWeight: 800, color: isOverrun ? '#FF8F73' : '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>
                        ${balance.toLocaleString()} / ${allocated.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: 6, borderRadius: 99, background: lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: isOverrun ? 'linear-gradient(90deg, #FF8F73, #FF5630)' : 'linear-gradient(90deg, #0052CC, #36B37E)', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Expense Claims Approval Queue */}
          {pendingClaims.length > 0 && (
            <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Clock style={{ width: 20, height: 20, color: '#FFAB00' }} />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Pending Employee Expense Claims Queue ({pendingClaims.length})</h2>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="gs-table">
                  <thead>
                    <tr>
                      <th>Claim ID</th>
                      <th>Expense Category</th>
                      <th>Logged By</th>
                      <th>Claim Note</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingClaims.map(t => (
                      <tr key={t.TransactionId || t.transactionId}>
                        <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4C9AFF' }}>#EXP-{t.TransactionId || t.transactionId}</td>
                        <td style={{ fontWeight: 700, color: textPri }}>{t.Type || t.type}</td>
                        <td>{t.LoggedBy || 'Employee Specialist'}</td>
                        <td style={{ fontSize: 12, color: textMut }}>{t.Note || t.note || 'Operational expense claim'}</td>
                        <td style={{ fontWeight: 800, color: '#FFDA75', fontFamily: 'JetBrains Mono, monospace' }}>${Number(t.Amount || t.amount).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleApproveExpense(t.TransactionId || t.transactionId)}
                              style={{ padding: '5px 12px', borderRadius: 8, background: '#36B37E', color: 'white', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}
                            >
                              Approve Claim
                            </button>
                            <button
                              onClick={() => handleRejectExpense(t.TransactionId || t.transactionId)}
                              style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,86,48,0.15)', border: '1px solid rgba(255,86,48,0.3)', color: '#FF8F73', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                            >
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

          {/* General Ledger Transactions Audit Table */}
          <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileSpreadsheet style={{ width: 20, height: 20, color: '#57D9A3' }} />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>General Ledger Transactions Log</h2>
              </div>
              <span style={{ fontSize: 11, color: textMut }}>{transactions.length} Total Ledger Entries</span>
            </div>

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
                  {transactions.map(t => {
                    const st = t.Status || t.status || 'Approved';
                    return (
                      <tr key={t.TransactionId || t.transactionId}>
                        <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: textMut }}>#{t.TransactionId || t.transactionId}</td>
                        <td style={{ fontWeight: 700, color: textPri }}>{t.AccountName || t.Account || 'Core Account'}</td>
                        <td>{t.Type || t.type}</td>
                        <td>{t.LoggedBy || 'System'}</td>
                        <td style={{ fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>${Number(t.Amount || t.amount).toLocaleString()}</td>
                        <td>
                          <span className={`pill ${st === 'Approved' ? 'pill-green' : st === 'PendingApproval' ? 'pill-gold' : 'pill-red'}`}>
                            {st}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, color: textMut }}>{new Date(t.TransactionDate || t.transactionDate || Date.now()).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
                    <th>Category</th>
                    <th>Claim Description</th>
                    <th>Amount</th>
                    <th>Approval Status</th>
                    <th>Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => {
                    const st = t.Status || t.status || 'Approved';
                    return (
                      <tr key={t.TransactionId || t.transactionId}>
                        <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: textMut }}>#EXP-{t.TransactionId || t.transactionId}</td>
                        <td style={{ fontWeight: 700, color: textPri }}>{t.Type || t.type}</td>
                        <td style={{ fontSize: 12, color: textMut }}>{t.Note || t.note || 'Reimbursement claim'}</td>
                        <td style={{ fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace' }}>${Number(t.Amount || t.amount).toLocaleString()}</td>
                        <td>
                          <span className={`pill ${st === 'Approved' ? 'pill-green' : st === 'PendingApproval' ? 'pill-gold' : 'pill-red'}`}>
                            {st}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, color: textMut }}>{new Date(t.TransactionDate || t.transactionDate || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
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
        onReallocated={loadFinanceData}
        lightMode={lightMode}
      />

      <ExpenseClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        accounts={accounts}
        user={user}
        onClaimSubmitted={loadFinanceData}
        lightMode={lightMode}
      />

    </div>
  );
}
