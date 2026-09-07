import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, Users, FolderKanban, Coins, ShieldAlert,
  CheckCircle2, ArrowRight, Sparkles,
  TrendingUp, Clock, Send, Plus, MessageSquare,
  Sun, Moon, ShieldCheck, Check,
  DollarSign, BarChart3, UserPlus
} from 'lucide-react';
import GrindsetLogoNodes from '../components/GrindsetLogoNodes';
import AuthModal from '../components/AuthModal';

// ── 100% DUMMY DATA FOR COMPANY OWNER PERSPECTIVE ─────────────────────────────
const DUMMY_OWNER_DATA = {
  company: {
    name: 'Apex Dynamics Technologies Inc.',
    tier: 'Enterprise Scale Tier',
    headquarters: 'San Francisco, CA',
    totalStaff: 38,
    activeProjects: 8,
    monthlyBudget: 145000,
    budgetSpent: 108200,
    cashReserves: 425800,
  },
  pendingSignups: [
    { id: 101, name: 'Liam Vance', email: 'liam.vance@apexdynamics.io', designation: 'Senior DevOps Architect', dept: 'Cloud & Infrastructure', rate: 95 },
    { id: 102, name: 'Sofia Chen', email: 'sofia.chen@apexdynamics.io', designation: 'Staff UI/UX Designer', dept: 'Product Design', rate: 85 },
    { id: 103, name: 'Daniel Kim', email: 'daniel.kim@apexdynamics.io', designation: 'Full-Stack Engineer', dept: 'Platform Engineering', rate: 90 },
  ],
  workforce: [
    { id: 1, name: 'Sarah Lin', role: 'VP of Engineering', dept: 'Engineering', rate: 120, status: 'Active', projects: 3 },
    { id: 2, name: 'Marcus Wright', role: 'Principal Architect', dept: 'Engineering', rate: 110, status: 'Active', projects: 2 },
    { id: 3, name: 'Elena Rostova', role: 'Head of Product', dept: 'Product', rate: 105, status: 'Active', projects: 4 },
    { id: 4, name: 'Alex Rivera', role: 'Senior Frontend Developer', dept: 'Engineering', rate: 65, status: 'Active', projects: 2 },
    { id: 5, name: 'Tariq Al-Mansoor', role: 'Financial Controller', dept: 'Finance', rate: 95, status: 'Active', projects: 1 },
    { id: 6, name: 'Chloe Bennett', role: 'Marketing Director', dept: 'Marketing', rate: 80, status: 'Active', projects: 2 },
  ],
  projects: [
    { id: 'PRJ-1', name: 'Titan Cloud ERP Migration', budget: 180000, spent: 147600, progress: 82, lead: 'Marcus Wright', status: 'On Track', tasks: 42, completedTasks: 35 },
    { id: 'PRJ-2', name: 'Global Payment Gateway v2', budget: 95000, spent: 60800, progress: 64, lead: 'Sarah Lin', status: 'In Review', tasks: 28, completedTasks: 18 },
    { id: 'PRJ-3', name: 'AI Document Intelligence Engine', budget: 120000, spent: 42000, progress: 35, lead: 'Daniel Kim', status: 'In Progress', tasks: 34, completedTasks: 12 },
    { id: 'PRJ-4', name: 'Mobile Companion App iOS & Android', budget: 65000, spent: 65000, progress: 100, lead: 'Sofia Chen', status: 'Delivered', tasks: 22, completedTasks: 22 },
  ],
  accounts: [
    { id: 'ACC-1', name: 'Core Platform Engineering', budget: 180000, balance: 32400, health: 'Healthy' },
    { id: 'ACC-2', name: 'Cloud Infrastructure & AWS', budget: 90000, balance: 21800, health: 'Healthy' },
    { id: 'ACC-3', name: 'Product Design & Research', budget: 50000, balance: 14200, health: 'Healthy' },
    { id: 'ACC-4', name: 'Corporate Operations & Admin', budget: 60000, balance: 18900, health: 'Healthy' },
  ],
  claimsQueue: [
    { id: 'CLM-801', employee: 'Alex Rivera', category: 'AWS Cloud Certification Exam', amount: 300, date: 'Yesterday', status: 'Pending Review' },
    { id: 'CLM-802', employee: 'Elena Rostova', category: 'Executive Client Dinner - Tokyo Q3', amount: 420, date: '2 days ago', status: 'Pending Review' },
    { id: 'CLM-803', employee: 'Chloe Bennett', category: 'Enterprise Figma Team Seats', amount: 280, date: '3 days ago', status: 'Approved' },
  ],
  auditTrail: [
    { id: 'AUD-991', actor: 'Company Owner', event: 'REALLOCATE_FUNDS', details: 'Transferred $15,000 from Operations to Cloud Infrastructure', time: '12 mins ago', hash: '8f4c21...a78e' },
    { id: 'AUD-990', actor: 'Company Owner', event: 'APPROVE_EMPLOYEE', details: 'Approved employee profile for Sofia Chen (#102)', time: '45 mins ago', hash: '4b1a99...c01f' },
    { id: 'AUD-989', actor: 'System Daemon', event: 'AUTOMATED_BACKUP', details: 'PostgreSQL encrypted snapshot successfully replicated', time: '2 hours ago', hash: 'e39b71...02a3' },
    { id: 'AUD-988', actor: 'Tariq Al-Mansoor', event: 'EXPENSE_APPROVED', details: 'Reimbursement batch #84 signed and scheduled for payout', time: '5 hours ago', hash: '11ce80...99d4' },
  ]
};

// ── 100% DUMMY DATA FOR EMPLOYEE PERSPECTIVE ─────────────────────────────────
const DUMMY_EMPLOYEE_DATA = {
  profile: {
    name: 'Alex Rivera',
    designation: 'Senior Frontend Developer',
    department: 'Platform Engineering',
    company: 'Apex Dynamics Technologies Inc.',
    hourlyRate: 65,
    manager: 'Sarah Lin (VP of Engineering)',
    hoursThisWeek: 38.5,
    pendingClaimsTotal: 420,
    estimatedGrossPay: 2502.50,
  },
  tasks: [
    { id: 'TSK-201', title: 'Implement Real-Time WebSocket Channel for Project Chat', project: 'Titan Cloud ERP', priority: 'Urgent', status: 'In Progress', deadline: 'Today, 5:00 PM' },
    { id: 'TSK-202', title: 'Polish Timesheet Date-Range Picker and UI Polish', project: 'Titan Cloud ERP', priority: 'High', status: 'To Do', deadline: 'Tomorrow' },
    { id: 'TSK-203', title: 'Refactor Stripe Payment Webhook Exception Handlers', project: 'Payment Gateway v2', priority: 'Normal', status: 'In Review', deadline: 'Sep 11' },
    { id: 'TSK-204', title: 'Optimize Mobile Navigation Drawer Animation FPS', project: 'Mobile Companion', priority: 'Normal', status: 'Done', deadline: 'Delivered' },
    { id: 'TSK-205', title: 'Run End-to-End Regression Tests on Role Guarding', project: 'Titan Cloud ERP', priority: 'High', status: 'Done', deadline: 'Delivered' },
  ],
  timesheets: [
    { day: 'Mon', project: 'Titan Cloud ERP', task: 'Component Architecture & State Machine', hours: 8.0, status: 'Approved' },
    { day: 'Tue', project: 'Titan Cloud ERP', task: 'SignalR Integration & Realtime Sync', hours: 8.5, status: 'Approved' },
    { day: 'Wed', project: 'Payment Gateway v2', task: 'Checkout Flow Refactor & Test Mocks', hours: 7.5, status: 'Approved' },
    { day: 'Thu', project: 'Titan Cloud ERP', task: 'Role Guard Permission Layer Audit', hours: 8.0, status: 'Pending Review' },
    { day: 'Fri (Today)', project: 'Titan Cloud ERP', task: 'Live Workspace Interactive Showcase', hours: 6.5, status: 'In Progress' },
  ],
  expenses: [
    { id: 'EXP-101', category: 'AWS Solutions Architect Exam Fee', amount: 300.00, date: 'Sep 06, 2026', status: 'Under Review', receipt: 'aws_invoice_88192.pdf' },
    { id: 'EXP-102', category: 'Ergonomic Desk Accessories & Cable Hub', amount: 120.00, date: 'Aug 28, 2026', status: 'Approved & Paid', receipt: 'amazon_receipt_9921.pdf' },
    { id: 'EXP-103', category: 'Team Sprint Retrospective Lunch', amount: 84.50, date: 'Aug 21, 2026', status: 'Approved & Paid', receipt: 'bistro_receipt_442.pdf' },
  ],
  chatMessages: [
    { id: 1, sender: 'Sarah Lin (VP Eng)', avatar: 'SL', text: 'Hey team, the Cloud ERP v3 rollout sprint finishes this Friday. How are we looking on the chat integration?', time: '10:15 AM' },
    { id: 2, sender: 'Marcus Wright (Lead Arch)', avatar: 'MW', text: 'Architecture is locked in and SignalR hub throughput tested at 10,000 msg/sec without drops.', time: '10:18 AM' },
    { id: 3, sender: 'Alex Rivera (You)', avatar: 'AR', text: 'Frontend real-time state sync is connected! Testing edge cases now.', time: '10:21 AM', isMe: true },
    { id: 4, sender: 'Sarah Lin (VP Eng)', avatar: 'SL', text: 'Fantastic progress. Once verified, submit your weekly timesheet and expense claims by 4 PM.', time: '10:24 AM' },
  ]
};

export default function ExploreWorkspacePage({ lightMode, setLightMode }) {
  const navigate = useNavigate();

  // State: role selection ('owner' | 'employee' | null)
  const [selectedRole, setSelectedRole] = useState(null);

  // Active sub-tab inside selected role view
  const [ownerTab, setOwnerTab] = useState('overview'); // overview, workforce, projects, finance, audit
  const [employeeTab, setEmployeeTab] = useState('overview'); // overview, tasks, timesheet, expenses, chat, payroll

  // Interactive dummy state for Company Owner actions
  const [ownerPendingSignups, setOwnerPendingSignups] = useState(DUMMY_OWNER_DATA.pendingSignups);
  const [ownerWorkforce, setOwnerWorkforce] = useState(DUMMY_OWNER_DATA.workforce);
  const [ownerClaims, setOwnerClaims] = useState(DUMMY_OWNER_DATA.claimsQueue);
  const [ownerFeedback, setOwnerFeedback] = useState('');

  // Interactive dummy state for Employee actions
  const [employeeTasks, setEmployeeTasks] = useState(DUMMY_EMPLOYEE_DATA.tasks);
  const [employeeTimesheets, setEmployeeTimesheets] = useState(DUMMY_EMPLOYEE_DATA.timesheets);
  const [employeeExpenses, setEmployeeExpenses] = useState(DUMMY_EMPLOYEE_DATA.expenses);
  const [chatMessages, setChatMessages] = useState(DUMMY_EMPLOYEE_DATA.chatMessages);
  const [chatInput, setChatInput] = useState('');
  const [employeeFeedback, setEmployeeFeedback] = useState('');

  // Modals inside dummy tours
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);
  const [newLogHours, setNewLogHours] = useState({ project: 'Titan Cloud ERP', task: '', hours: '4.0' });
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', notes: '' });

  // Theme colors
  const isDark = !lightMode;
  const bg = isDark ? '#070F1F' : '#F0F2F5';
  const textPrimary = isDark ? '#F4F5F7' : '#091E42';
  const textMuted = isDark ? '#8993A4' : '#5E6C84';
  const cardBg = isDark ? 'rgba(11, 27, 61, 0.75)' : 'rgba(255, 255, 255, 0.95)';
  const border = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.09)';
  const topbarBg = isDark ? 'rgba(7, 15, 31, 0.92)' : 'rgba(255, 255, 255, 0.94)';

  // Owner dummy action handlers
  const handleApproveSignup = (id, name) => {
    const approved = ownerPendingSignups.find(s => s.id === id);
    if (!approved) return;
    setOwnerPendingSignups(prev => prev.filter(s => s.id !== id));
    setOwnerWorkforce(prev => [
      { id: Date.now(), name: approved.name, role: approved.designation, dept: approved.dept, rate: approved.rate, status: 'Active', projects: 1 },
      ...prev
    ]);
    setOwnerFeedback(`✓ Approved onboarding for ${name}! Account added to active company staff.`);
    setTimeout(() => setOwnerFeedback(''), 4500);
  };

  const handleRejectSignup = (id, name) => {
    setOwnerPendingSignups(prev => prev.filter(s => s.id !== id));
    setOwnerFeedback(`✕ Rejected registration request for ${name}.`);
    setTimeout(() => setOwnerFeedback(''), 4500);
  };

  const handleApproveClaim = (id) => {
    setOwnerClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    setOwnerFeedback(`✓ Expense Claim #${id} approved for reimbursement payout.`);
    setTimeout(() => setOwnerFeedback(''), 4500);
  };

  // Employee dummy action handlers
  const handleMoveTaskStatus = (taskId, newStatus) => {
    setEmployeeTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setEmployeeFeedback(`Task ${taskId} moved to "${newStatus}"!`);
    setTimeout(() => setEmployeeFeedback(''), 3500);
  };

  const handleAddTimesheetLog = (e) => {
    e.preventDefault();
    if (!newLogHours.task) return;
    const logItem = {
      day: 'Extra Log',
      project: newLogHours.project,
      task: newLogHours.task,
      hours: parseFloat(newLogHours.hours) || 2.0,
      status: 'Submitted'
    };
    setEmployeeTimesheets(prev => [...prev, logItem]);
    setShowLogHoursModal(false);
    setNewLogHours({ project: 'Titan Cloud ERP', task: '', hours: '4.0' });
    setEmployeeFeedback(`✓ Successfully logged ${logItem.hours} hrs for ${logItem.project}!`);
    setTimeout(() => setEmployeeFeedback(''), 4000);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;
    const expItem = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount) || 50,
      date: 'Just now',
      status: 'Under Review',
      receipt: 'digital_receipt.pdf'
    };
    setEmployeeExpenses(prev => [expItem, ...prev]);
    setShowNewExpenseModal(false);
    setNewExpense({ category: '', amount: '', notes: '' });
    setEmployeeFeedback(`✓ Expense claim of $${expItem.amount} submitted to Company Owner for sign-off!`);
    setTimeout(() => setEmployeeFeedback(''), 4500);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = {
      id: Date.now(),
      sender: 'Alex Rivera (You)',
      avatar: 'AR',
      text: chatInput,
      time: 'Just now',
      isMe: true
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate smart team response
    setTimeout(() => {
      const replies = [
        "Received! I'll update the project sprint board accordingly.",
        "Nice work Alex! Let's sync on this at tomorrow's standup.",
        "Got it, reviewing the PR right now."
      ];
      const botMsg = {
        id: Date.now() + 1,
        sender: 'Sarah Lin (VP Eng)',
        avatar: 'SL',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: 'Just now',
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  return (
    <div style={{ background: bg, color: textPrimary, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── AMBIENT BACKGROUND GLOW ── */}
      {isDark && (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -150, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #0052CC 0%, transparent 70%)', opacity: 0.12 }} />
          <div style={{ position: 'absolute', bottom: -150, left: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #6554C0 0%, transparent 70%)', opacity: 0.12 }} />
        </div>
      )}

      {/* ── TOP HEADER / PERSONA NAVIGATION BAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: topbarBg, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${border}`, height: 72,
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Left: Brand + Demo Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <GrindsetLogoNodes isDark={isDark} className="w-32 h-auto" />
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99,
            background: 'rgba(76,154,255,0.14)', border: '1px solid rgba(76,154,255,0.3)',
            fontSize: 11, fontWeight: 700, color: '#4C9AFF'
          }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Simulation · Dummy Enterprise Data</span>
          </div>
        </div>

        {/* Center: Role Switcher (Visible once a role is selected) */}
        {selectedRole && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDark ? 'rgba(255,255,255,0.05)' : '#EAECEF', padding: 4, borderRadius: 12, border: `1px solid ${border}` }}>
            <button
              onClick={() => setSelectedRole('owner')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 800,
                background: selectedRole === 'owner' ? '#0052CC' : 'transparent',
                color: selectedRole === 'owner' ? '#FFFFFF' : textMuted,
                border: 'none', cursor: 'pointer', transition: 'all .2s'
              }}>
              <Building2 className="w-4 h-4" /> Company Owner
            </button>
            <button
              onClick={() => setSelectedRole('employee')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 800,
                background: selectedRole === 'employee' ? '#36B37E' : 'transparent',
                color: selectedRole === 'employee' ? '#FFFFFF' : textMuted,
                border: 'none', cursor: 'pointer', transition: 'all .2s'
              }}>
              <Briefcase className="w-4 h-4" /> Employee
            </button>
          </div>
        )}

        {/* Right: Actions (Change Role, Theme, Sign Up, Exit) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedRole && (
            <button
              onClick={() => setSelectedRole(null)}
              style={{
                padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, color: textMuted,
                background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer'
              }}
              title="Return to Persona Selection Screen">
              Switch Persona
            </button>
          )}

          <button
            onClick={() => setLightMode(l => !l)}
            style={{
              padding: 8, borderRadius: 9, background: isDark ? 'rgba(255,255,255,0.06)' : '#EAECEF',
              border: `1px solid ${border}`, color: isDark ? '#FFDA75' : '#0052CC', cursor: 'pointer'
            }}
            title="Toggle theme">
            {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
            className="btn-primary" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserPlus className="w-4 h-4" /> Sign Up Free
          </button>

          <Link to="/" style={{ fontSize: 13, fontWeight: 600, color: textMuted, textDecoration: 'none', marginLeft: 6 }}>
            Exit Demo
          </Link>
        </div>
      </header>

      {/* ── BODY CONTENT CONTAINER ── */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ═══════════════════════════════════════════════════════════════════════
            STEP 1: PERSONA CHOOSER (FIRST ASKING COMPANY OWNER OR EMPLOYEE)
           ═══════════════════════════════════════════════════════════════════════ */}
        {!selectedRole && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 1040, margin: '40px auto 0', textAlign: 'center' }}>
            
            {/* Header Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', borderRadius: 99,
              background: 'rgba(0, 82, 204, 0.12)', border: '1px solid rgba(0, 82, 204, 0.3)', marginBottom: 20
            }}>
              <Sparkles className="w-4 h-4 text-blue-400" style={{ color: '#4C9AFF' }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#4C9AFF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Select a Workspace Persona to Explore
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, color: textPrimary, letterSpacing: '-0.02em', marginBottom: 18 }}>
              Experience GrindSet from Both Perspectives
            </h1>
            <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: textMuted, maxWidth: 680, margin: '0 auto 48px', lineHeight: 1.6 }}>
              Our platform provides dedicated, role-tailored capabilities for enterprise leadership and team contributors. Select a role below to explore the exact features we have built for them.
            </p>

            {/* Persona Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28, textAlign: 'left' }}>
              
              {/* ── CARD 1: COMPANY OWNER ── */}
              <motion.div
                whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(0, 82, 204, 0.28)' }}
                onClick={() => setSelectedRole('owner')}
                style={{
                  borderRadius: 24, padding: '36px 32px', background: cardBg,
                  border: `2px solid ${isDark ? 'rgba(0, 82, 204, 0.4)' : '#C0D5FF'}`,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 20px', borderBottomLeftRadius: 18, background: '#0052CC', color: 'white', fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Executive Governance
                </div>

                <div>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(0, 82, 204, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Building2 className="w-8 h-8" style={{ color: '#4C9AFF' }} />
                  </div>

                  <h3 style={{ fontSize: 26, fontWeight: 900, color: textPrimary, marginBottom: 8 }}>
                    Company Owner
                  </h3>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#4C9AFF', marginBottom: 14 }}>
                    Executive & Organization Command Suite
                  </p>
                  <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.6, marginBottom: 24 }}>
                    Oversee company-wide operations, approve staff signups, manage departmental budgets, track project delivery, and inspect cryptographic audit trails.
                  </p>

                  <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, marginBottom: 28 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted, marginBottom: 12 }}>
                      Implemented Features You Will Explore:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        'Employee Signup Review & Approval Queue',
                        'Organization Workforce Directory & Hourly Pay Rates',
                        'Project Portfolio, Budget Caps & Sprint Milestones',
                        'Financial Treasury, Ledger Accounts & Reallocations',
                        'Employee Expense Claim Approvals & Payouts',
                        'Immutable Cryptographic Audit Trails (SHA-256)',
                      ].map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: textPrimary, fontWeight: 500 }}>
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#4C9AFF' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', borderRadius: 14, background: '#0052CC', color: 'white', fontWeight: 800, fontSize: 15
                }}>
                  <span>Explore as Company Owner</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.div>

              {/* ── CARD 2: EMPLOYEE ── */}
              <motion.div
                whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(54, 179, 126, 0.28)' }}
                onClick={() => setSelectedRole('employee')}
                style={{
                  borderRadius: 24, padding: '36px 32px', background: cardBg,
                  border: `2px solid ${isDark ? 'rgba(54, 179, 126, 0.4)' : '#B8F0D6'}`,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 20px', borderBottomLeftRadius: 18, background: '#36B37E', color: 'white', fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Workforce Operations
                </div>

                <div>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(54, 179, 126, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Briefcase className="w-8 h-8" style={{ color: '#57D9A3' }} />
                  </div>

                  <h3 style={{ fontSize: 26, fontWeight: 900, color: textPrimary, marginBottom: 8 }}>
                    Employee / Contributor
                  </h3>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#57D9A3', marginBottom: 14 }}>
                    Sprint Execution & Daily Work Portal
                  </p>
                  <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.6, marginBottom: 24 }}>
                    Manage assigned tasks on agile Kanban boards, log billable daily timesheets, submit expense reimbursement receipts, and collaborate in real-time project chat.
                  </p>

                  <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, marginBottom: 28 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted, marginBottom: 12 }}>
                      Implemented Features You Will Explore:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        'Personal Sprint Dashboard & Active Task Board',
                        'Daily Billable Timesheet Hours Logger',
                        'Expense Claim Submission with Receipt Attachments',
                        'Real-Time Team Project Chat (SignalR Simulation)',
                        'Hourly Compensation & Weekly Pay Slip Breakdown',
                        'Automated Notification Feeds for Tasks & Sign-offs',
                      ].map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: textPrimary, fontWeight: 500 }}>
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#57D9A3' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', borderRadius: 14, background: '#36B37E', color: 'white', fontWeight: 800, fontSize: 15
                }}>
                  <span>Explore as Employee</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.div>

            </div>

            {/* Privacy & Safety Note */}
            <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 10, color: textMuted, fontSize: 13 }}>
              <ShieldCheck className="w-4 h-4 text-green-400" style={{ color: '#57D9A3' }} />
              <span>100% Isolated Sandbox: All actions run on realistic simulated data. No real database records or credentials are accessed.</span>
            </div>

          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STEP 2A: COMPANY OWNER WORKSPACE VIEW (WHAT WE IMPLEMENTED FOR THEM)
           ═══════════════════════════════════════════════════════════════════════ */}
        {selectedRole === 'owner' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {/* Owner Header Info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className="pill pill-blue"><Building2 className="w-3.5 h-3.5" /> Company Owner Perspective</span>
                  <span className="pill pill-gold">{DUMMY_OWNER_DATA.company.tier}</span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: textPrimary, margin: 0 }}>
                  {DUMMY_OWNER_DATA.company.name} Command Center
                </h2>
                <p style={{ fontSize: 14, color: textMuted, marginTop: 4 }}>
                  Comprehensive overview of company workforce, project portfolio, treasury allocations, and approval queues.
                </p>
              </div>

              {/* Feedback toast */}
              {ownerFeedback && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
                  padding: '10px 18px', borderRadius: 12, background: 'rgba(54,179,126,0.18)', border: '1px solid rgba(54,179,126,0.35)',
                  color: '#57D9A3', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {ownerFeedback}
                </motion.div>
              )}
            </div>

            {/* Owner Navigation Tabs */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', borderBottom: `1px solid ${border}`, paddingBottom: 12, marginBottom: 28 }}>
              {[
                { id: 'overview', label: 'Executive KPIs', icon: BarChart3, count: null },
                { id: 'workforce', label: 'Workforce & Approvals', icon: Users, count: ownerPendingSignups.length },
                { id: 'projects', label: 'Projects & Sprints', icon: FolderKanban, count: DUMMY_OWNER_DATA.projects.length },
                { id: 'finance', label: 'Treasury & Claims', icon: Coins, count: ownerClaims.filter(c => c.status === 'Pending Review').length },
                { id: 'audit', label: 'Security Audit Logs', icon: ShieldAlert, count: null },
              ].map(tab => {
                const isActive = ownerTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setOwnerTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                      background: isActive ? '#0052CC' : 'transparent',
                      color: isActive ? '#FFFFFF' : textMuted,
                      border: isActive ? 'none' : `1px solid ${border}`,
                      cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap'
                    }}>
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span style={{
                        fontSize: 11, fontWeight: 900, padding: '2px 7px', borderRadius: 99,
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,171,0,0.15)',
                        color: isActive ? 'white' : '#FFAB00'
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── TAB 1: EXECUTIVE KPIS OVERVIEW ── */}
            {ownerTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
                  {[
                    { label: 'Active Workforce', val: `${ownerWorkforce.length + 32} Staff`, sub: '6 Depts, 98% Allocated', icon: Users, color: '#4C9AFF' },
                    { label: 'Pending Registrations', val: `${ownerPendingSignups.length} Signups`, sub: 'Awaiting Company Approval', icon: UserPlus, color: '#FFAB00' },
                    { label: 'Active Projects', val: '8 Projects', sub: '92% Sprint Milestone Health', icon: FolderKanban, color: '#FFDA75' },
                    { label: 'Operating Budget', val: `$${DUMMY_OWNER_DATA.company.monthlyBudget.toLocaleString()}`, sub: '74.6% Spent ($108.2k)', icon: TrendingUp, color: '#57D9A3' },
                    { label: 'Treasury Reserves', val: `$${DUMMY_OWNER_DATA.company.cashReserves.toLocaleString()}`, sub: 'Enterprise Liquidity', icon: Coins, color: '#BF9AFF' },
                  ].map((s, i) => (
                    <motion.div key={i} whileHover={{ y: -4 }} style={{ padding: 22, borderRadius: 16, background: cardBg, border: `1px solid ${border}`, borderTop: `3px solid ${s.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMuted }}>{s.label}</span>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <s.icon className="w-4 h-4" style={{ color: s.color }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: 0 }}>{s.val}</p>
                      <p style={{ fontSize: 12, color: textMuted, margin: '6px 0 0' }}>{s.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Split Section: Approvals + Project Health */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
                  
                  {/* Pending Employee Queue Preview */}
                  <div style={{ padding: 24, borderRadius: 18, background: cardBg, border: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserPlus className="w-4.5 h-4.5" style={{ color: '#FFAB00' }} />
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Pending Employee Signups</h4>
                      </div>
                      <button onClick={() => setOwnerTab('workforce')} style={{ background: 'transparent', border: 'none', color: '#4C9AFF', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        View All ({ownerPendingSignups.length}) →
                      </button>
                    </div>

                    {ownerPendingSignups.length === 0 ? (
                      <div style={{ padding: 30, textAlign: 'center', color: textMuted, fontSize: 13 }}>
                        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" style={{ color: '#57D9A3', marginBottom: 8 }} />
                        All employee registration requests have been reviewed!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {ownerPendingSignups.map(s => (
                          <div key={s.id} style={{ padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                              <p style={{ fontWeight: 800, fontSize: 14, margin: 0 }}>{s.name}</p>
                              <p style={{ fontSize: 12, color: textMuted, margin: '2px 0 0' }}>{s.designation} · <span style={{ color: '#4C9AFF', fontWeight: 700 }}>${s.rate}/hr</span></p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => handleApproveSignup(s.id, s.name)}
                                style={{ padding: '6px 12px', borderRadius: 8, background: '#36B37E', color: 'white', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectSignup(s.id, s.name)}
                                style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,86,48,0.15)', color: '#FF5630', border: '1px solid rgba(255,86,48,0.3)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Projects Sprint Health */}
                  <div style={{ padding: 24, borderRadius: 18, background: cardBg, border: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FolderKanban className="w-4.5 h-4.5" style={{ color: '#FFDA75' }} />
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Key Project Sprints</h4>
                      </div>
                      <button onClick={() => setOwnerTab('projects')} style={{ background: 'transparent', border: 'none', color: '#4C9AFF', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        View All →
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {DUMMY_OWNER_DATA.projects.slice(0, 3).map(p => (
                        <div key={p.id} style={{ padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: p.progress === 100 ? '#57D9A3' : '#4C9AFF' }}>{p.progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: 6, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.1)' : '#EAECEF', overflow: 'hidden', marginBottom: 8 }}>
                            <div style={{ width: `${p.progress}%`, height: '100%', background: p.progress === 100 ? '#36B37E' : '#0052CC', borderRadius: 99 }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: textMuted }}>
                            <span>Lead: {p.lead}</span>
                            <span>Budget: ${p.spent.toLocaleString()} / ${p.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── TAB 2: WORKFORCE & SIGNUP APPROVALS ── */}
            {ownerTab === 'workforce' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Pending Signups Table */}
                <div style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Company Employee Signup Approval Queue</h3>
                      <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>Company Owners have full authority to approve or reject employee accounts joining this tenant.</p>
                    </div>
                    <span className="pill pill-gold">{ownerPendingSignups.length} Pending Review</span>
                  </div>

                  {ownerPendingSignups.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: textMuted, fontSize: 13, background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFBFC', borderRadius: 14 }}>
                      <CheckCircle2 className="w-8 h-8 mx-auto text-green-400" style={{ color: '#57D9A3', marginBottom: 8 }} />
                      Zero pending employee registrations. Your team is up to date!
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="gs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: `1px solid ${border}`, fontSize: 12, color: textMuted }}>
                            <th style={{ padding: '12px 16px' }}>Applicant Name</th>
                            <th style={{ padding: '12px 16px' }}>Email Address</th>
                            <th style={{ padding: '12px 16px' }}>Designation</th>
                            <th style={{ padding: '12px 16px' }}>Department</th>
                            <th style={{ padding: '12px 16px' }}>Hourly Rate</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Owner Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ownerPendingSignups.map(s => (
                            <tr key={s.id} style={{ borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                              <td style={{ padding: '14px 16px', fontWeight: 800, color: textPrimary }}>{s.name}</td>
                              <td style={{ padding: '14px 16px', color: textMuted, fontFamily: 'monospace' }}>{s.email}</td>
                              <td style={{ padding: '14px 16px' }}>{s.designation}</td>
                              <td style={{ padding: '14px 16px' }}><span className="pill pill-blue">{s.dept}</span></td>
                              <td style={{ padding: '14px 16px', fontWeight: 800, color: '#4C9AFF' }}>${s.rate}/hr</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                  <button
                                    onClick={() => handleApproveSignup(s.id, s.name)}
                                    style={{ padding: '6px 14px', borderRadius: 8, background: '#36B37E', color: 'white', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Check className="w-3.5 h-3.5" /> Approve Access
                                  </button>
                                  <button
                                    onClick={() => handleRejectSignup(s.id, s.name)}
                                    style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,86,48,0.15)', color: '#FF5630', border: '1px solid rgba(255,86,48,0.3)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Active Workforce Table */}
                <div style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Active Company Workforce Directory</h3>
                      <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>All active personnel, department allocations, and contracted hourly compensation.</p>
                    </div>
                    <span className="pill pill-green"><CheckCircle2 className="w-3 h-3" /> {ownerWorkforce.length + 32} Active Staff</span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="gs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: `1px solid ${border}`, fontSize: 12, color: textMuted }}>
                          <th style={{ padding: '12px 16px' }}>Staff Name</th>
                          <th style={{ padding: '12px 16px' }}>Title</th>
                          <th style={{ padding: '12px 16px' }}>Department</th>
                          <th style={{ padding: '12px 16px' }}>Billing Rate</th>
                          <th style={{ padding: '12px 16px' }}>Assigned Projects</th>
                          <th style={{ padding: '12px 16px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ownerWorkforce.map(w => (
                          <tr key={w.id} style={{ borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                            <td style={{ padding: '14px 16px', fontWeight: 800, color: textPrimary }}>{w.name}</td>
                            <td style={{ padding: '14px 16px' }}>{w.role}</td>
                            <td style={{ padding: '14px 16px' }}><span className="pill pill-blue">{w.dept}</span></td>
                            <td style={{ padding: '14px 16px', fontWeight: 800, color: '#4C9AFF' }}>${w.rate}/hr</td>
                            <td style={{ padding: '14px 16px' }}>{w.projects} Active</td>
                            <td style={{ padding: '14px 16px' }}><span className="pill pill-green">Verified</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB 3: PROJECTS & SPRINTS ── */}
            {ownerTab === 'projects' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                {DUMMY_OWNER_DATA.projects.map(p => (
                  <div key={p.id} style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: '#FFDA75', background: 'rgba(255,218,117,0.15)', padding: '3px 9px', borderRadius: 6 }}>{p.id}</span>
                        <span className={p.status === 'Delivered' ? 'pill pill-green' : p.status === 'On Track' ? 'pill pill-blue' : 'pill pill-gold'}>{p.status}</span>
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: textPrimary, margin: '0 0 8px' }}>{p.name}</h3>
                      <p style={{ fontSize: 13, color: textMuted, margin: '0 0 18px' }}>Project Manager: <strong style={{ color: textPrimary }}>{p.lead}</strong></p>
                      
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                          <span>Sprint Completion</span>
                          <span style={{ color: '#4C9AFF' }}>{p.progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: 8, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.08)' : '#EAECEF', overflow: 'hidden' }}>
                          <div style={{ width: `${p.progress}%`, height: '100%', background: p.progress === 100 ? '#36B37E' : '#0052CC', borderRadius: 99 }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}`, marginBottom: 18 }}>
                        <div>
                          <p style={{ fontSize: 11, color: textMuted, margin: 0, textTransform: 'uppercase' }}>Budget Allocated</p>
                          <p style={{ fontSize: 16, fontWeight: 900, color: textPrimary, margin: '4px 0 0' }}>${p.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: textMuted, margin: 0, textTransform: 'uppercase' }}>Spent to Date</p>
                          <p style={{ fontSize: 16, fontWeight: 900, color: '#57D9A3', margin: '4px 0 0' }}>${p.spent.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${border}`, paddingTop: 14, fontSize: 12, color: textMuted }}>
                      <span>{p.completedTasks} / {p.tasks} Tasks Closed</span>
                      <span style={{ color: '#4C9AFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare className="w-3.5 h-3.5" /> SignalR Chat Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TAB 4: TREASURY & EXPENSE CLAIMS ── */}
            {ownerTab === 'finance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Departmental Ledgers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {DUMMY_OWNER_DATA.accounts.map(acc => (
                    <div key={acc.id} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#BF9AFF' }}>{acc.id}</span>
                        <span className="pill pill-green">{acc.health}</span>
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px' }}>{acc.name}</h4>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', color: textMuted, margin: 0 }}>Available Balance</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: '#57D9A3', margin: '2px 0 6px' }}>${acc.balance.toLocaleString()}</p>
                      <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>Cap: ${acc.budget.toLocaleString()} Total</p>
                    </div>
                  ))}
                </div>

                {/* Submitted Employee Claims Waiting for Sign-off */}
                <div style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Employee Expense Claims & Reimbursements</h3>
                      <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>Review and authorize employee expenditures and travel claims before payroll processing.</p>
                    </div>
                    <span className="pill pill-gold">{ownerClaims.filter(c => c.status === 'Pending Review').length} Awaiting Authorization</span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="gs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: `1px solid ${border}`, fontSize: 12, color: textMuted }}>
                          <th style={{ padding: '12px 16px' }}>Claim ID</th>
                          <th style={{ padding: '12px 16px' }}>Claimant Staff</th>
                          <th style={{ padding: '12px 16px' }}>Expenditure Category</th>
                          <th style={{ padding: '12px 16px' }}>Claim Amount</th>
                          <th style={{ padding: '12px 16px' }}>Submission Date</th>
                          <th style={{ padding: '12px 16px' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Owner Approval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ownerClaims.map(c => (
                          <tr key={c.id} style={{ borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                            <td style={{ padding: '14px 16px', fontWeight: 800, color: '#BF9AFF' }}>{c.id}</td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: textPrimary }}>{c.employee}</td>
                            <td style={{ padding: '14px 16px' }}>{c.category}</td>
                            <td style={{ padding: '14px 16px', fontWeight: 900, color: '#57D9A3' }}>${c.amount.toFixed(2)}</td>
                            <td style={{ padding: '14px 16px', color: textMuted }}>{c.date}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span className={c.status === 'Approved' ? 'pill pill-green' : 'pill pill-gold'}>{c.status}</span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              {c.status === 'Pending Review' ? (
                                <button
                                  onClick={() => handleApproveClaim(c.id)}
                                  style={{ padding: '6px 14px', borderRadius: 8, background: '#36B37E', color: 'white', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                  Sign & Approve
                                </button>
                              ) : (
                                <span style={{ fontSize: 12, color: '#57D9A3', fontWeight: 700 }}>✓ Reimbursed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB 5: SECURITY AUDIT LEDGER ── */}
            {ownerTab === 'audit' && (
              <div style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Immutable Cryptographic Audit Trail</h3>
                    <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>All financial movements, employee status changes, and administrative actions are hashed with SHA-256.</p>
                  </div>
                  <span className="pill pill-green"><ShieldCheck className="w-3.5 h-3.5" /> 100% Tamper Proof</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {DUMMY_OWNER_DATA.auditTrail.map(log => (
                    <div key={log.id} style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: '#FF8F73', background: 'rgba(255,143,115,0.15)', padding: '2px 8px', borderRadius: 6 }}>{log.event}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: textPrimary }}>{log.actor}</span>
                          <span style={{ fontSize: 11, color: textMuted }}>· {log.time}</span>
                        </div>
                        <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>{log.details}</p>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: textMuted, background: isDark ? 'rgba(0,0,0,0.3)' : '#EAECEF', padding: '4px 10px', borderRadius: 6 }}>
                        SHA-256: {log.hash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STEP 2B: EMPLOYEE WORKSPACE VIEW (WHAT WE IMPLEMENTED FOR THEM)
           ═══════════════════════════════════════════════════════════════════════ */}
        {selectedRole === 'employee' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {/* Employee Header Profile */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className="pill pill-green"><Briefcase className="w-3.5 h-3.5" /> Employee Contributor Portal</span>
                  <span className="pill pill-blue">{DUMMY_EMPLOYEE_DATA.profile.department}</span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: textPrimary, margin: 0 }}>
                  Welcome, {DUMMY_EMPLOYEE_DATA.profile.name} 👋
                </h2>
                <p style={{ fontSize: 14, color: textMuted, marginTop: 4 }}>
                  {DUMMY_EMPLOYEE_DATA.profile.designation} · Reporting to {DUMMY_EMPLOYEE_DATA.profile.manager}
                </p>
              </div>

              {/* Feedback toast */}
              {employeeFeedback && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
                  padding: '10px 18px', borderRadius: 12, background: 'rgba(54,179,126,0.18)', border: '1px solid rgba(54,179,126,0.35)',
                  color: '#57D9A3', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {employeeFeedback}
                </motion.div>
              )}
            </div>

            {/* Employee Navigation Tabs */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', borderBottom: `1px solid ${border}`, paddingBottom: 12, marginBottom: 28 }}>
              {[
                { id: 'overview', label: 'My Sprint Dashboard', icon: BarChart3, count: null },
                { id: 'tasks', label: 'Kanban Task Board', icon: FolderKanban, count: employeeTasks.filter(t => t.status !== 'Done').length },
                { id: 'timesheet', label: 'Timesheet & Work Logs', icon: Clock, count: `${DUMMY_EMPLOYEE_DATA.profile.hoursThisWeek}h` },
                { id: 'expenses', label: 'Expense Reimbursements', icon: Coins, count: `$${DUMMY_EMPLOYEE_DATA.profile.pendingClaimsTotal}` },
                { id: 'chat', label: 'Team Project Chat', icon: MessageSquare, count: 'Live' },
                { id: 'payroll', label: 'Compensation & Pay Stub', icon: DollarSign, count: null },
              ].map(tab => {
                const isActive = employeeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEmployeeTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                      background: isActive ? '#36B37E' : 'transparent',
                      color: isActive ? '#FFFFFF' : textMuted,
                      border: isActive ? 'none' : `1px solid ${border}`,
                      cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap'
                    }}>
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span style={{
                        fontSize: 11, fontWeight: 900, padding: '2px 7px', borderRadius: 99,
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(54,179,126,0.15)',
                        color: isActive ? 'white' : '#57D9A3'
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── TAB 1: EMPLOYEE SPRINT DASHBOARD ── */}
            {employeeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
                  {[
                    { label: 'Assigned Sprint Tasks', val: `${employeeTasks.filter(t => t.status !== 'Done').length} Active`, sub: '2 High Priority Deadlines', icon: FolderKanban, color: '#4C9AFF' },
                    { label: 'Logged Hours This Week', val: `${DUMMY_EMPLOYEE_DATA.profile.hoursThisWeek} hrs`, sub: 'Target: 40.0 hrs / week', icon: Clock, color: '#57D9A3' },
                    { label: 'Pending Reimbursements', val: `$${DUMMY_EMPLOYEE_DATA.profile.pendingClaimsTotal}`, sub: 'Submitted to Company Owner', icon: Coins, color: '#FFAB00' },
                    { label: 'Agreed Hourly Compensation', val: `$${DUMMY_EMPLOYEE_DATA.profile.hourlyRate}/hr`, sub: 'Direct Deposit Verified', icon: DollarSign, color: '#BF9AFF' },
                    { label: 'Sprint Estimated Earnings', val: `$${DUMMY_EMPLOYEE_DATA.profile.estimatedGrossPay.toLocaleString()}`, sub: 'Gross Pay (Before Tax)', icon: TrendingUp, color: '#FFDA75' },
                  ].map((s, i) => (
                    <motion.div key={i} whileHover={{ y: -4 }} style={{ padding: 22, borderRadius: 16, background: cardBg, border: `1px solid ${border}`, borderTop: `3px solid ${s.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMuted }}>{s.label}</span>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <s.icon className="w-4 h-4" style={{ color: s.color }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: 0 }}>{s.val}</p>
                      <p style={{ fontSize: 12, color: textMuted, margin: '6px 0 0' }}>{s.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Split Action Grid: My Immediate Tasks & Quick Timesheet */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
                  
                  {/* Immediate Sprint Tasks */}
                  <div style={{ padding: 24, borderRadius: 18, background: cardBg, border: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FolderKanban className="w-4.5 h-4.5" style={{ color: '#4C9AFF' }} />
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>My Immediate Sprint Tasks</h4>
                      </div>
                      <button onClick={() => setEmployeeTab('tasks')} style={{ background: 'transparent', border: 'none', color: '#57D9A3', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Open Kanban Board →
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {employeeTasks.slice(0, 3).map(t => (
                        <div key={t.id} style={{ padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#4C9AFF' }}>{t.id}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: t.priority === 'Urgent' ? 'rgba(255,86,48,0.15)' : 'rgba(255,171,0,0.15)', color: t.priority === 'Urgent' ? '#FF5630' : '#FFAB00' }}>{t.priority}</span>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: textPrimary }}>{t.title}</p>
                            <p style={{ fontSize: 11, color: textMuted, margin: '2px 0 0' }}>Due: {t.deadline}</p>
                          </div>
                          <button
                            onClick={() => handleMoveTaskStatus(t.id, t.status === 'Done' ? 'In Progress' : 'Done')}
                            style={{ padding: '6px 12px', borderRadius: 8, background: t.status === 'Done' ? 'rgba(54,179,126,0.15)' : '#0052CC', color: t.status === 'Done' ? '#57D9A3' : 'white', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {t.status === 'Done' ? '✓ Completed' : 'Mark Done'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Timesheet Hours Breakdown */}
                  <div style={{ padding: 24, borderRadius: 18, background: cardBg, border: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock className="w-4.5 h-4.5" style={{ color: '#57D9A3' }} />
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Weekly Billable Hours Breakdown</h4>
                      </div>
                      <button onClick={() => setShowLogHoursModal(true)} style={{ background: '#36B37E', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Plus className="w-3.5 h-3.5" /> Log Hours
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {employeeTimesheets.map((ts, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}`, fontSize: 13 }}>
                          <div>
                            <span style={{ fontWeight: 800, color: textPrimary, marginRight: 10 }}>{ts.day}</span>
                            <span style={{ color: textMuted }}>{ts.task}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontWeight: 900, color: '#57D9A3' }}>{ts.hours} hrs</span>
                            <span className={ts.status === 'Approved' ? 'pill pill-green' : 'pill pill-gold'}>{ts.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── TAB 2: KANBAN TASK BOARD ── */}
            {employeeTab === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Assigned Sprint Tasks Board</h3>
                    <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>Drag or click status tags to transition deliverables through your workflow.</p>
                  </div>
                  <span className="pill pill-blue">Sprint 24 · Active</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {['To Do', 'In Progress', 'In Review', 'Done'].map(columnStatus => {
                    const colTasks = employeeTasks.filter(t => t.status === columnStatus);
                    return (
                      <div key={columnStatus} style={{ padding: 18, borderRadius: 18, background: cardBg, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: textPrimary }}>{columnStatus}</span>
                          <span style={{ fontSize: 11, fontWeight: 900, background: isDark ? 'rgba(255,255,255,0.1)' : '#EAECEF', padding: '2px 8px', borderRadius: 99 }}>{colTasks.length}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {colTasks.length === 0 ? (
                            <div style={{ padding: 24, textAlign: 'center', color: textMuted, fontSize: 12, border: `1px dashed ${border}`, borderRadius: 12 }}>
                              No tasks in {columnStatus}
                            </div>
                          ) : (
                            colTasks.map(task => (
                              <div key={task.id} style={{ padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF', border: `1px solid ${border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: '#4C9AFF' }}>{task.id}</span>
                                  <span style={{ fontSize: 10, fontWeight: 800, color: task.priority === 'Urgent' ? '#FF5630' : '#FFAB00' }}>{task.priority}</span>
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: textPrimary, margin: '0 0 6px' }}>{task.title}</p>
                                <p style={{ fontSize: 11, color: textMuted, margin: '0 0 12px' }}>{task.project} · {task.deadline}</p>

                                <div style={{ display: 'flex', gap: 6 }}>
                                  {columnStatus !== 'In Progress' && (
                                    <button
                                      onClick={() => handleMoveTaskStatus(task.id, 'In Progress')}
                                      style={{ flex: 1, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,82,204,0.15)', color: '#4C9AFF', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                      Start
                                    </button>
                                  )}
                                  {columnStatus !== 'Done' && (
                                    <button
                                      onClick={() => handleMoveTaskStatus(task.id, 'Done')}
                                      style={{ flex: 1, padding: '4px 8px', borderRadius: 6, background: 'rgba(54,179,126,0.15)', color: '#57D9A3', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                      Done ✓
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 3: TIMESHEET & WORK LOGS ── */}
            {employeeTab === 'timesheet' && (
              <div style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Daily Timesheet Logger & Billable Hours</h3>
                    <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>Log daily sprint hours against assigned project milestones for automatic compensation calculation.</p>
                  </div>
                  <button onClick={() => setShowLogHoursModal(true)} style={{ background: '#36B37E', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus className="w-4 h-4" /> Log Daily Hours
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="gs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: `1px solid ${border}`, fontSize: 12, color: textMuted }}>
                        <th style={{ padding: '12px 16px' }}>Work Day</th>
                        <th style={{ padding: '12px 16px' }}>Project Allocation</th>
                        <th style={{ padding: '12px 16px' }}>Sprint Task Description</th>
                        <th style={{ padding: '12px 16px' }}>Hours Logged</th>
                        <th style={{ padding: '12px 16px' }}>Rate</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeTimesheets.map((ts, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: textPrimary }}>{ts.day}</td>
                          <td style={{ padding: '14px 16px' }}><span className="pill pill-blue">{ts.project}</span></td>
                          <td style={{ padding: '14px 16px' }}>{ts.task}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 900, color: '#57D9A3' }}>{ts.hours} hrs</td>
                          <td style={{ padding: '14px 16px', color: textMuted }}>$65/hr</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={ts.status === 'Approved' ? 'pill pill-green' : 'pill pill-gold'}>{ts.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 4: EXPENSE REIMBURSEMENTS ── */}
            {employeeTab === 'expenses' && (
              <div style={{ padding: 26, borderRadius: 20, background: cardBg, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>My Expense Reimbursement Claims</h3>
                    <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>Submit receipts for travel, client dinners, equipment, and professional software certifications.</p>
                  </div>
                  <button onClick={() => setShowNewExpenseModal(true)} style={{ background: '#0052CC', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus className="w-4 h-4" /> Submit New Claim
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="gs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: `1px solid ${border}`, fontSize: 12, color: textMuted }}>
                        <th style={{ padding: '12px 16px' }}>Claim ID</th>
                        <th style={{ padding: '12px 16px' }}>Expense Purpose</th>
                        <th style={{ padding: '12px 16px' }}>Claim Amount</th>
                        <th style={{ padding: '12px 16px' }}>Date Filed</th>
                        <th style={{ padding: '12px 16px' }}>Receipt File</th>
                        <th style={{ padding: '12px 16px' }}>Approval Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeExpenses.map(exp => (
                        <tr key={exp.id} style={{ borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: '#BF9AFF' }}>{exp.id}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: textPrimary }}>{exp.category}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 900, color: '#57D9A3' }}>${exp.amount.toFixed(2)}</td>
                          <td style={{ padding: '14px 16px', color: textMuted }}>{exp.date}</td>
                          <td style={{ padding: '14px 16px', color: '#4C9AFF', fontFamily: 'monospace', fontSize: 11 }}>{exp.receipt}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={exp.status.includes('Approved') ? 'pill pill-green' : 'pill pill-gold'}>{exp.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 5: REAL-TIME TEAM CHAT ── */}
            {employeeTab === 'chat' && (
              <div style={{ maxWidth: 880, margin: '0 auto', borderRadius: 20, background: cardBg, border: `1px solid ${border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 560 }}>
                {/* Chat Channel Header */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? 'rgba(0,0,0,0.25)' : '#FAFBFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#36B37E', boxShadow: '0 0 8px #36B37E' }} />
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}># titan-cloud-erp-sprint</h4>
                      <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>SignalR Real-Time Channel · Project Team (Sarah, Marcus, Alex)</p>
                    </div>
                  </div>
                  <span className="pill pill-green">Live Connected</span>
                </div>

                {/* Chat Messages Stream */}
                <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: msg.isMe ? '#57D9A3' : '#4C9AFF' }}>{msg.sender}</span>
                        <span style={{ fontSize: 10, color: textMuted }}>{msg.time}</span>
                      </div>
                      <div style={{
                        maxWidth: '75%', padding: '12px 16px', borderRadius: 14,
                        background: msg.isMe ? '#0052CC' : (isDark ? 'rgba(255,255,255,0.06)' : '#EAECEF'),
                        color: msg.isMe ? 'white' : textPrimary, fontSize: 13, lineHeight: 1.5
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input Box */}
                <form onSubmit={handleSendChat} style={{ padding: 14, borderTop: `1px solid ${border}`, display: 'flex', gap: 10, background: isDark ? 'rgba(0,0,0,0.2)' : '#FAFBFC' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message to your project team..."
                    style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', color: textPrimary, fontSize: 13, outline: 'none' }}
                  />
                  <button type="submit" style={{ padding: '10px 20px', borderRadius: 10, background: '#36B37E', color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Send className="w-4 h-4" /> Send
                  </button>
                </form>
              </div>
            )}

            {/* ── TAB 6: COMPENSATION & PAYROLL BREAKDOWN ── */}
            {employeeTab === 'payroll' && (
              <div style={{ maxWidth: 840, margin: '0 auto', padding: 32, borderRadius: 24, background: cardBg, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${border}`, paddingBottom: 20, marginBottom: 24 }}>
                  <div>
                    <span className="pill pill-blue" style={{ marginBottom: 8, display: 'inline-block' }}>Bi-Weekly Pay Statement</span>
                    <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Earnings & Compensation Statement</h3>
                    <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>Period: Aug 25 - Sep 07, 2026 · Apex Dynamics Technologies Inc.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="pill pill-green">Direct Deposit Scheduled</span>
                    <p style={{ fontSize: 12, color: textMuted, margin: '6px 0 0' }}>Payout Date: Upcoming Friday</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <div style={{ padding: 18, borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: textMuted, textTransform: 'uppercase' }}>Hourly Rate</span>
                    <p style={{ fontSize: 24, fontWeight: 900, color: '#4C9AFF', margin: '6px 0 0' }}>${DUMMY_EMPLOYEE_DATA.profile.hourlyRate}.00</p>
                  </div>
                  <div style={{ padding: 18, borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: textMuted, textTransform: 'uppercase' }}>Billable Hours</span>
                    <p style={{ fontSize: 24, fontWeight: 900, color: '#57D9A3', margin: '6px 0 0' }}>{DUMMY_EMPLOYEE_DATA.profile.hoursThisWeek} hrs</p>
                  </div>
                  <div style={{ padding: 18, borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC', border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: textMuted, textTransform: 'uppercase' }}>Gross Earnings</span>
                    <p style={{ fontSize: 24, fontWeight: 900, color: '#FFDA75', margin: '6px 0 0' }}>${DUMMY_EMPLOYEE_DATA.profile.estimatedGrossPay.toFixed(2)}</p>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Deductions & Net Pay Estimate</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: textMuted }}>
                      <span>Gross Compensation (38.5 hrs @ $65/hr)</span>
                      <span style={{ fontWeight: 700, color: textPrimary }}>${DUMMY_EMPLOYEE_DATA.profile.estimatedGrossPay.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: textMuted }}>
                      <span>Federal & State Withholding (Est. 18%)</span>
                      <span style={{ color: '#FF5630' }}>-$450.45</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: textMuted }}>
                      <span>FICA & Medicare (7.65%)</span>
                      <span style={{ color: '#FF5630' }}>-$191.44</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${border}`, paddingTop: 12, fontSize: 16, fontWeight: 900 }}>
                      <span>Estimated Net Take-Home</span>
                      <span style={{ color: '#57D9A3' }}>$1,860.61</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

      </div>

      {/* ── MODAL: DUMMY LOG HOURS ── */}
      <AnimatePresence>
        {showLogHoursModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: '100%', maxWidth: 460, background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Log Daily Work Hours</h3>
                <button onClick={() => setShowLogHoursModal(false)} style={{ background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              <form onSubmit={handleAddTimesheetLog} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Project Allocation</label>
                  <select
                    value={newLogHours.project}
                    onChange={e => setNewLogHours({ ...newLogHours, project: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: isDark ? '#070F1F' : '#FFFFFF', border: `1px solid ${border}`, color: textPrimary, fontSize: 13 }}>
                    <option>Titan Cloud ERP</option>
                    <option>Payment Gateway v2</option>
                    <option>AI Document Intelligence</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Task / Work Performed</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit tests & API error handling"
                    value={newLogHours.task}
                    onChange={e => setNewLogHours({ ...newLogHours, task: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: isDark ? '#070F1F' : '#FFFFFF', border: `1px solid ${border}`, color: textPrimary, fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Hours Spent (1 - 8 hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    required
                    value={newLogHours.hours}
                    onChange={e => setNewLogHours({ ...newLogHours, hours: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: isDark ? '#070F1F' : '#FFFFFF', border: `1px solid ${border}`, color: textPrimary, fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button type="button" onClick={() => setShowLogHoursModal(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#36B37E', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                    Save Timesheet Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: DUMMY SUBMIT EXPENSE ── */}
      <AnimatePresence>
        {showNewExpenseModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: '100%', maxWidth: 460, background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Submit Expense Claim</h3>
                <button onClick={() => setShowNewExpenseModal(false)} style={{ background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Expense Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Travel Taxi, Client Meal, Software Subscription"
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: isDark ? '#070F1F' : '#FFFFFF', border: `1px solid ${border}`, color: textPrimary, fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: isDark ? '#070F1F' : '#FFFFFF', border: `1px solid ${border}`, color: textPrimary, fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button type="button" onClick={() => setShowNewExpenseModal(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#0052CC', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                    Submit for Approval
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── AUTH MODAL FOR FULL SIGNUP ── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        isDark={isDark}
        onAuthSuccess={() => navigate('/dashboard')}
      />

    </div>
  );
}
