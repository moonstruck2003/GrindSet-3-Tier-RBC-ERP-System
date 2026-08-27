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

  addEmployee: (data) => apiFetch('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  addTransaction: (data) => apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
};

// Legacy helpers kept for App.jsx compatibility
export async function fetchApiHealth() {
  try { return await api.health(); } catch { return { Status: 'Offline' }; }
}
export async function fetchErdSummary() {
  try { return await api.erdSummary(); } catch { return null; }
}
