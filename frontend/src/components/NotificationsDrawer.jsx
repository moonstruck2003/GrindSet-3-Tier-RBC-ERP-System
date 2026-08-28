import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, X, ShieldAlert, Building2, UserPlus, AlertTriangle, CheckCircle2,
  ChevronRight, Coins, CheckSquare, Clock, XCircle, Shield, AlertCircle
} from 'lucide-react';
import { api } from '../config/api';

export default function NotificationsDrawer({ isOpen, onClose, user, lightMode, onNotificationCountChange }) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const userRole = user?.role || 'Company';
  const userId = Number(user?.userId || 0);

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      const companyId = userId || 1;
      const [tasksRes, txRes, accRes, peRes, pcRes] = await Promise.all([
        api.tasks().catch(() => []),
        api.transactions().catch(() => []),
        api.accounts().catch(() => []),
        userRole === 'Company' ? api.pendingEmployees(companyId).catch(() => []) : Promise.resolve([]),
        userRole === 'Admin' ? api.pendingCompanies().catch(() => []) : Promise.resolve([]),
      ]);

      const items = [];

      // ── EMPLOYEE NOTIFICATIONS ──
      if (userRole === 'Employee') {
        // 1. Task Assignments
        const myTasks = tasksRes.filter(t => Number(t.AssigneeId || t.assigneeId) === userId);
        myTasks.forEach(t => {
          items.push({
            id: `task-${t.TaskId || t.taskId}`,
            category: 'Task Assignment',
            title: `Assigned Task: ${t.Title || t.title}`,
            subtitle: `Project: ${t.ProjectName || t.projectName || 'Core Project'}`,
            detail: `Priority: ${t.Priority || t.priority} · Status: ${t.Status || t.status} · Points: ${t.StoryPoints || t.storyPoints}`,
            badgeType: (t.Priority || t.priority) === 'Highest' || (t.Priority || t.priority) === 'High' ? 'red' : 'blue',
            timestamp: t.CreatedAt || t.createdAt || Date.now(),
            icon: CheckSquare
          });
        });

        // 2. Personal Reimbursement Expense Claims Status
        const myClaims = txRes.filter(tx => Number(tx.LoggedByEmployeeId || tx.loggedByEmployeeId) === userId || tx.LoggedBy === user?.fullName);
        myClaims.forEach(tx => {
          const st = tx.Status || tx.status;
          const amt = Number(tx.Amount || tx.amount || 0).toLocaleString();
          const cat = tx.Type || tx.type || 'Operational Expense';

          if (st === 'Approved') {
            items.push({
              id: `claim-app-${tx.TransactionId || tx.transactionId}`,
              category: 'Reimbursement Approved',
              title: `Claim Approved: $${amt}`,
              subtitle: `Category: ${cat}`,
              detail: `Cleared by CFO. Note: ${tx.Note || tx.note || 'Approved'}`,
              badgeType: 'green',
              timestamp: tx.TransactionDate || tx.transactionDate || Date.now(),
              icon: CheckCircle2
            });
          } else if (st === 'Rejected') {
            items.push({
              id: `claim-rej-${tx.TransactionId || tx.transactionId}`,
              category: 'Reimbursement Declined',
              title: `Claim Declined: $${amt}`,
              subtitle: `Category: ${cat}`,
              detail: `Expense rejected by CFO controller.`,
              badgeType: 'red',
              timestamp: tx.TransactionDate || tx.transactionDate || Date.now(),
              icon: XCircle
            });
          } else if (st === 'PendingApproval') {
            items.push({
              id: `claim-pend-${tx.TransactionId || tx.transactionId}`,
              category: 'Reimbursement Pending',
              title: `Claim Submitted: $${amt}`,
              subtitle: `Category: ${cat}`,
              detail: `Under review by Company CFO for reimbursement.`,
              badgeType: 'gold',
              timestamp: tx.TransactionDate || tx.transactionDate || Date.now(),
              icon: Clock
            });
          }
        });

        // 3. User Identity Verification Status
        items.push({
          id: `account-verified-${userId}`,
          category: 'Identity Governance',
          title: 'Employee Portal Active',
          subtitle: `Logged in as ${user?.fullName || user?.email}`,
          detail: 'Your employee workspace credentials are full verified.',
          badgeType: 'green',
          timestamp: Date.now() - 3600000,
          icon: ShieldCheck
        });
      }

      // ── COMPANY OWNER NOTIFICATIONS ──
      if (userRole === 'Company') {
        // 1. Pending Employee Access Applications
        peRes.forEach(emp => {
          items.push({
            id: `emp-pending-${emp.EmployeeId}`,
            category: 'Employee Access Request',
            title: `Pending Application: ${emp.FullName}`,
            subtitle: `${emp.Designation} · ${emp.Email}`,
            detail: `Hourly Rate: $${emp.HourlyRate}/hr · Requires Company Access Approval`,
            badgeType: 'gold',
            actionType: 'approve_employee',
            actionId: emp.EmployeeId,
            timestamp: Date.now() - 1800000,
            icon: UserPlus
          });
        });

        // 2. Pending Employee Expense Claims Awaiting CFO Approval
        const pendingClaimsList = txRes.filter(tx => (tx.Status || tx.status) === 'PendingApproval');
        pendingClaimsList.forEach(tx => {
          const amt = Number(tx.Amount || tx.amount || 0).toLocaleString();
          items.push({
            id: `cfo-claim-${tx.TransactionId || tx.transactionId}`,
            category: 'CFO Action Required',
            title: `Pending Claim: $${amt}`,
            subtitle: `Submitted by ${tx.LoggedBy || 'Employee'} · ${tx.Type || tx.type}`,
            detail: `Account: ${tx.AccountName || tx.accountName || 'Core Account'} · Note: ${tx.Note || tx.note || 'Claim'}`,
            badgeType: 'gold',
            actionType: 'approve_claim',
            actionId: tx.TransactionId || tx.transactionId,
            timestamp: tx.TransactionDate || tx.transactionDate || Date.now(),
            icon: Coins
          });
        });

        // 3. Low Liquidity & Budget Alerts
        accRes.forEach(acc => {
          const bal = Number(acc.CurrentBalance || acc.currentBalance || 0);
          const alloc = Number(acc.AllocatedBudget || acc.allocatedBudget || 1);
          const pct = Math.round((bal / alloc) * 100);
          if (pct < 20) {
            items.push({
              id: `low-bal-${acc.AccountId || acc.accountId}`,
              category: 'Liquidity Alert',
              title: `Low Balance: ${acc.AccountName || acc.accountName}`,
              subtitle: `Project: ${acc.ProjectName || acc.projectName || 'Core Project'}`,
              detail: `Current Balance: $${bal.toLocaleString()} (${pct}% remaining of $${alloc.toLocaleString()})`,
              badgeType: 'red',
              timestamp: Date.now() - 7200000,
              icon: AlertTriangle
            });
          }
        });
      }

      // ── ADMIN GOVERNANCE NOTIFICATIONS ──
      if (userRole === 'Admin') {
        // 1. Pending Tenant Registrations
        pcRes.forEach(comp => {
          items.push({
            id: `comp-pending-${comp.companyId}`,
            category: 'Tenant Registration',
            title: `Pending Company: ${comp.companyName}`,
            subtitle: `${comp.industry} · Reg: ${comp.registrationNo}`,
            detail: `Email: ${comp.email} · Requires SuperAdmin License Approval`,
            badgeType: 'gold',
            actionType: 'approve_company',
            actionId: comp.companyId,
            timestamp: Date.now() - 3600000,
            icon: Building2
          });
        });

        // 2. System Budget Overrun Alerts
        accRes.filter(a => Number(a.CurrentBalance || a.currentBalance) < 0).forEach(a => {
          items.push({
            id: `overrun-${a.AccountId || a.accountId}`,
            category: 'System Overrun',
            title: `Negative Balance: ${a.AccountName || a.accountName}`,
            subtitle: `Overrun Amount: -$${Math.abs(Number(a.CurrentBalance || a.currentBalance)).toLocaleString()}`,
            detail: 'Requires inter-account budget reallocation.',
            badgeType: 'red',
            timestamp: Date.now() - 14400000,
            icon: ShieldAlert
          });
        });
      }

      setNotifications(items);
      if (onNotificationCountChange) {
        onNotificationCountChange(items.length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllNotifications();
    }
  }, [isOpen, userRole, userId]);

  if (!isOpen) return null;

  // Handle Quick Actions
  const handleAction = async (item) => {
    try {
      if (item.actionType === 'approve_employee') {
        await api.approveEmployee(item.actionId);
      } else if (item.actionType === 'approve_claim') {
        await api.approveExpense(item.actionId);
      } else if (item.actionType === 'approve_company') {
        await api.approveCompany(item.actionId);
      }
      fetchAllNotifications();
    } catch (err) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleDismiss = (id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      if (onNotificationCountChange) onNotificationCountChange(updated.length);
      return updated;
    });
  };

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const sectionBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          width: '100%', maxWidth: 440, height: '100vh', background: cardBg,
          borderLeft: `1px solid ${border}`, boxShadow: '-10px 0 30px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #0052CC, #6554C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bell style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Notification Hub</h3>
              <p style={{ fontSize: 11, color: textMut, margin: 0 }}>Real-Time System Events ({notifications.length})</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: 20, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: textMut, fontSize: 13 }}>
              <CheckCircle2 style={{ width: 32, height: 32, color: '#36B37E', margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 800, color: textPri, marginBottom: 4 }}>All Notifications Cleared</div>
              <div style={{ fontSize: 12 }}>Your workspace is completely up to date.</div>
            </div>
          ) : (
            notifications.map(item => {
              const IconComponent = item.icon || Bell;
              const badgeClass = item.badgeType === 'green' ? 'pill-green' : item.badgeType === 'red' ? 'pill-red' : item.badgeType === 'gold' ? 'pill-gold' : 'pill-blue';

              return (
                <div key={item.id} style={{ padding: 14, borderRadius: 14, background: sectionBg, border: `1px solid ${border}`, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconComponent style={{ width: 16, height: 16, color: item.badgeType === 'green' ? '#57D9A3' : item.badgeType === 'red' ? '#FF8F73' : '#FFDA75' }} />
                      <span className={`pill ${badgeClass}`} style={{ fontSize: 9, padding: '1px 6px' }}>
                        {item.category}
                      </span>
                    </div>

                    <button onClick={() => handleDismiss(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut, fontSize: 10 }}>
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: 13, color: textPri, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4C9AFF', marginBottom: 4 }}>{item.subtitle}</div>
                  <div style={{ fontSize: 11, color: textMut, lineHeight: 1.4 }}>{item.detail}</div>

                  {item.actionType && (
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleAction(item)}
                        className="btn-primary"
                        style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}
                      >
                        Approve Now
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {notifications.length > 0 && (
          <div style={{ padding: 16, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => { setNotifications([]); if (onNotificationCountChange) onNotificationCountChange(0); }}
              className="btn-ghost"
              style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}
            >
              Clear All Notifications
            </button>
            <span style={{ fontSize: 11, color: textMut }}>Auto-Synced</span>
          </div>
        )}

      </motion.div>
    </div>
  );
}
