// Shared API endpoints configuration for GrindSet ERP
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    let msg = `API Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.message) msg = errJson.message;
    } catch {
      const txt = await res.text();
      if (txt) msg = txt;
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  health:       () => apiFetch('/api/health'),
  erdSummary:   () => apiFetch('/api/erd-summary'),
  subsystems:   () => apiFetch('/api/subsystems'),
  projects:     () => apiFetch('/api/projects'),
  users:        () => apiFetch('/api/users'),
  employees:    () => apiFetch('/api/employees'),
  accounts:     () => apiFetch('/api/accounts'),
  transactions: () => apiFetch('/api/transactions'),
  auditLogs:    () => apiFetch('/api/audit-logs'),
  assignments:  () => apiFetch('/api/assignments'),

  signup:       (data) => apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login:        (data) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me:           (userId) => apiFetch(`/api/auth/me?userId=${userId}`),

  companies:        () => apiFetch('/api/companies'),
  pendingCompanies: () => apiFetch('/api/admin/pending-companies'),
  approveCompany:   (companyId) => apiFetch(`/api/admin/approve-company/${companyId}`, { method: 'POST' }),
  rejectCompany:    (companyId) => apiFetch(`/api/admin/reject-company/${companyId}`, { method: 'POST' }),
  blockEmployee:    (employeeId) => apiFetch(`/api/admin/block-employee/${employeeId}`, { method: 'POST' }),
  reportEmployee:   (employeeId, note) => apiFetch(`/api/admin/report-employee/${employeeId}`, { method: 'POST', body: JSON.stringify({ note }) }),

  pendingEmployees: (companyId) => apiFetch(`/api/company/pending-employees/${companyId}`),
  approveEmployee:  (employeeId) => apiFetch(`/api/company/approve-employee/${employeeId}`, { method: 'POST' }),
  rejectEmployee:   (employeeId) => apiFetch(`/api/company/reject-employee/${employeeId}`, { method: 'POST' }),

  tasks:         () => apiFetch('/api/tasks'),
  createTask:    (data) => apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask:    (id, data) => apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask:    (id) => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }),
  createProject: (data) => apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(data) }),

  addEmployee: (data) => apiFetch('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  addTransaction: (data) => apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),

  createAccount:      (data) => apiFetch('/api/finance/accounts', { method: 'POST', body: JSON.stringify(data) }),
  reallocateFunds:    (data) => apiFetch('/api/finance/reallocate', { method: 'POST', body: JSON.stringify(data) }),
  submitExpenseClaim: (data) => apiFetch('/api/finance/expense-claim', { method: 'POST', body: JSON.stringify(data) }),
  approveExpense:     (id) => apiFetch(`/api/finance/approve-expense/${id}`, { method: 'POST' }),
  rejectExpense:      (id) => apiFetch(`/api/finance/reject-expense/${id}`, { method: 'POST' }),
  exportCsvUrl:       () => `${API_BASE_URL}/api/finance/export/csv`,
};

// Legacy helpers kept for App.jsx compatibility
export async function fetchApiHealth() {
  try { return await api.health(); } catch { return { Status: 'Offline' }; }
}
export async function fetchErdSummary() {
  try { return await api.erdSummary(); } catch { return null; }
}
