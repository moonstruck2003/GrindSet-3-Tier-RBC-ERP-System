import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Building2, Users, CheckCircle2, XCircle, AlertTriangle,
  FileText, Search, Activity, Ban, Flag, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react';
import { api } from '../config/api';

export default function AdminDashboardPage({ lightMode }) {
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [reportNote, setReportNote] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingCompRes, compRes, usersRes, empRes, logsRes] = await Promise.all([
        api.pendingCompanies().catch(() => []),
        api.companies().catch(() => []),
        api.users().catch(() => []),
        api.employees().catch(() => []),
        api.auditLogs().catch(() => []),
      ]);
      setPendingCompanies(pendingCompRes);
      setAllCompanies(compRes);
      setAllUsers(usersRes);
      setEmployees(empRes);
      setAuditLogs(logsRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveCompany = async (companyId) => {
    try {
      await api.approveCompany(companyId);
      setActionMsg(`Company #${companyId} approved successfully!`);
      setTimeout(() => setActionMsg(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to reject this company registration request?')) return;
    try {
      await api.rejectCompany(companyId);
      setActionMsg(`Company #${companyId} request rejected.`);
      setTimeout(() => setActionMsg(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handleBlockEmployee = async (employeeId) => {
    try {
      const res = await api.blockEmployee(employeeId);
      setActionMsg(res.message);
      setTimeout(() => setActionMsg(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleOpenReportModal = (emp) => {
    setTargetEmployee(emp);
    setReportNote('');
    setReportModalOpen(true);
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!targetEmployee) return;
    try {
      await api.reportEmployee(targetEmployee.EmployeeId, reportNote || 'Security policy compliance notice from System Admin.');
      setActionMsg(`Official report sent to company for ${targetEmployee.FullName}.`);
      setReportModalOpen(false);
      setTimeout(() => setActionMsg(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Reporting failed');
    }
  };

  // Theme styling
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const cardBg = lightMode ? 'rgba(255,255,255,0.92)' : 'rgba(11,27,61,0.65)';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.07)';
  const tableHeaderBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';

  const filteredEmployees = employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.FullName?.toLowerCase().includes(q) || e.Email?.toLowerCase().includes(q) || e.Designation?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

      {/* Header Banner */}
      <div className="glass" style={{ padding: '24px 30px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(0,82,204,0.18), rgba(101,84,192,0.18))', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #0052CC, #6554C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,82,204,0.3)' }}>
              <Shield style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: textPri, margin: 0 }}>System Admin Control Center</h1>
                <span className="pill pill-blue">Tier 1 Authority</span>
              </div>
              <p style={{ fontSize: 13, color: textMut, margin: 0, marginTop: 4 }}>
                Platform Governance &nbsp;·&nbsp; Tenant Approval Queue &nbsp;·&nbsp; Security Audit Enforcement
              </p>
            </div>
          </div>

          <button onClick={loadData} className="btn-ghost" style={{ padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700 }}>
            <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Alert Notification Message */}
      {actionMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(54,179,126,0.15)', border: '1px solid rgba(54,179,126,0.3)', color: '#57D9A3', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          {actionMsg}
        </motion.div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FFAB00', letterSpacing: '0.06em' }}>Pending Companies</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{pendingCompanies.length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Awaiting Admin Approval</div>
        </div>

        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#4C9AFF', letterSpacing: '0.06em' }}>Active Companies</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{allCompanies.filter(c => c.licenseStatus === 'Active' || c.approvalStatus === 'Approved').length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Approved Enterprise Tenants</div>
        </div>

        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#57D9A3', letterSpacing: '0.06em' }}>Total Platform Users</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{allUsers.length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Registered Accounts</div>
        </div>

        <div className="glass metric-card" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#BF9AFF', letterSpacing: '0.06em' }}>Audit Logs Recorded</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: textPri, marginTop: 6 }}>{auditLogs.length}</div>
          <div style={{ fontSize: 11, color: textMut, marginTop: 4 }}>Security Action Events</div>
        </div>
      </div>

      {/* ── SECTION 1: Company Signup Approval Queue ── */}
      <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 style={{ width: 20, height: 20, color: '#FFAB00' }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Company Approval Queue (Pending Admin Review)</h2>
            <span className="pill pill-gold">{pendingCompanies.length} Requests</span>
          </div>
        </div>

        {pendingCompanies.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: textMut, fontSize: 13, background: tableHeaderBg, borderRadius: 12 }}>
            <CheckCircle2 style={{ width: 28, height: 28, color: '#57D9A3', margin: '0 auto 8px' }} />
            No pending company approval requests at this time.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="gs-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Reg Number</th>
                  <th>Owner Email</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingCompanies.map(c => (
                  <tr key={c.companyId}>
                    <td style={{ fontWeight: 700, color: textPri }}>{c.companyName}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{c.registrationNo}</td>
                    <td>{c.email}</td>
                    <td>{c.industry}</td>
                    <td><span className="pill pill-gold">Pending Admin</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => handleApproveCompany(c.companyId)}
                          style={{ padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #36B37E, #00875A)', color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <CheckCircle2 style={{ width: 14, height: 14 }} /> Approve Company
                        </button>
                        <button
                          onClick={() => handleRejectCompany(c.companyId)}
                          style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,86,48,0.15)', color: '#FF5630', fontWeight: 700, fontSize: 12, border: '1px solid rgba(255,86,48,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <XCircle style={{ width: 14, height: 14 }} /> Reject
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

      {/* ── SECTION 2: Global Employee Oversight & Incident Controls ── */}
      <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users style={{ width: 20, height: 20, color: '#4C9AFF' }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Cross-Tenant Employee Oversight & Security Enforcement</h2>
            </div>
            <p style={{ fontSize: 12, color: textMut, margin: 0, marginTop: 4 }}>
              <strong>Admin Scope Rule:</strong> Admin can block accounts or report issues to the employer, but direct employee registration approval is managed by Company Owners.
            </p>
          </div>

          <div style={{ position: 'relative', width: 240 }}>
            <Search style={{ width: 14, height: 14, position: 'absolute', left: 12, top: 11, color: textMut }} />
            <input
              type="text"
              placeholder="Search employee..."
              className="gs-input"
              style={{ paddingLeft: 34, fontSize: 12 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="gs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Rate ($/hr)</th>
                <th>Status</th>
                <th>Admin Notice</th>
                <th style={{ textAlign: 'right' }}>Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => {
                const u = allUsers.find(x => x.userId === emp.EmployeeId);
                const isActive = u ? u.isActive : true;
                const appStatus = u ? u.approvalStatus : 'Approved';
                const reportedNote = u ? u.reportedNote : null;

                return (
                  <tr key={emp.EmployeeId}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>#{emp.EmployeeId}</td>
                    <td style={{ fontWeight: 700, color: textPri }}>{emp.FullName}</td>
                    <td style={{ fontSize: 12 }}>{emp.Email}</td>
                    <td>{emp.Designation}</td>
                    <td style={{ fontWeight: 700, color: '#4C9AFF' }}>${emp.HourlyRate}/hr</td>
                    <td>
                      {!isActive ? (
                        <span className="pill pill-red">Blocked</span>
                      ) : appStatus === 'Approved' ? (
                        <span className="pill pill-green">Approved</span>
                      ) : (
                        <span className="pill pill-gold">{appStatus}</span>
                      )}
                    </td>
                    <td>
                      {reportedNote ? (
                        <span style={{ fontSize: 11, color: '#FFAB00', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Flag style={{ width: 12, height: 12 }} /> {reportedNote.substring(0, 30)}...
                        </span>
                      ) : (
                        <span style={{ color: textMut, fontSize: 11 }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          onClick={() => handleBlockEmployee(emp.EmployeeId)}
                          style={{
                            padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                            background: isActive ? 'rgba(255,86,48,0.15)' : 'rgba(54,179,126,0.15)',
                            color: isActive ? '#FF5630' : '#57D9A3',
                            display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          <Ban style={{ width: 12, height: 12 }} /> {isActive ? 'Block' : 'Unblock'}
                        </button>

                        <button
                          onClick={() => handleOpenReportModal(emp)}
                          style={{
                            padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            background: 'rgba(255,171,0,0.15)', color: '#FFDA75', border: '1px solid rgba(255,171,0,0.3)',
                            display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          <Flag style={{ width: 12, height: 12 }} /> Report to Company
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 3: All Companies Directory ── */}
      <div className="glass" style={{ padding: 24, borderRadius: 16, background: cardBg, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 style={{ width: 20, height: 20, color: '#BF9AFF' }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Registered Enterprise Tenants</h2>
            <span className="pill pill-purple">{allCompanies.length} Companies</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="gs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Registration No</th>
                <th>Industry</th>
                <th>License Status</th>
                <th>Employees</th>
                <th>Projects</th>
              </tr>
            </thead>
            <tbody>
              {allCompanies.map(comp => (
                <tr key={comp.companyId}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>#{comp.companyId}</td>
                  <td style={{ fontWeight: 700, color: textPri }}>{comp.companyName}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{comp.registrationNo}</td>
                  <td>{comp.industry}</td>
                  <td>
                    {comp.licenseStatus === 'Active' ? (
                      <span className="pill pill-green">Active</span>
                    ) : comp.licenseStatus === 'Rejected' ? (
                      <span className="pill pill-red">Rejected</span>
                    ) : (
                      <span className="pill pill-gold">{comp.licenseStatus || 'Pending'}</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>{comp.employeeCount || 0}</td>
                  <td style={{ fontWeight: 700 }}>{comp.projectCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && targetEmployee && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
          <div style={{ width: '100%', maxWidth: 440, background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: '0 0 12px' }}>Report Employee to Company</h3>
            <p style={{ fontSize: 12, color: textMut, marginBottom: 16 }}>
              Issue an official security/compliance notice regarding <strong>{targetEmployee.FullName}</strong> to their Company Owner.
            </p>
            <form onSubmit={handleSendReport}>
              <label className="gs-label" style={{ color: textMut }}>Report Reason / Note</label>
              <textarea
                required
                rows={4}
                className="gs-input"
                style={{ resize: 'none', marginBottom: 16 }}
                placeholder="e.g. Audit log anomaly detected; request internal compliance verification."
                value={reportNote}
                onChange={e => setReportNote(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setReportModalOpen(false)} className="btn-ghost" style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Submit Official Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
