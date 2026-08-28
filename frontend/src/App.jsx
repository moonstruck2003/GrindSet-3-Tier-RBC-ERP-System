import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import WorkforcePage from './pages/WorkforcePage';
import ProjectsPage from './pages/ProjectsPage';
import FinancePage from './pages/FinancePage';
import AuditPage from './pages/AuditPage';

// Helper component for role-specific dashboard routing
function RoleBasedDashboard({ lightMode }) {
  try {
    const raw = localStorage.getItem('grindset_user');
    const u = raw ? JSON.parse(raw) : null;
    if (u?.role === 'Admin') {
      return <AdminDashboardPage lightMode={lightMode} />;
    }
    if (u?.role === 'Employee') {
      return <EmployeeDashboardPage lightMode={lightMode} />;
    }
  } catch {}
  return <DashboardPage lightMode={lightMode} />;
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  // REQUIREMENT: Default theme is Day Mode (lightMode = true)
  const [lightMode, setLightMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('light', lightMode);
  }, [lightMode]);

  return (
    <AppShell lightMode={lightMode} setLightMode={setLightMode}>
      <Routes>
        <Route path="/" element={<LandingPage lightMode={lightMode} setLightMode={setLightMode} />} />
        <Route path="/dashboard" element={<RoleBasedDashboard lightMode={lightMode} />} />
        <Route path="/workforce" element={<WorkforcePage lightMode={lightMode} />} />
        <Route path="/projects"  element={<ProjectsPage lightMode={lightMode} />} />
        <Route path="/finance"   element={<FinancePage lightMode={lightMode} />} />
        <Route path="/audit"     element={<AuditPage lightMode={lightMode} />} />
        <Route path="*"          element={<LandingPage lightMode={lightMode} setLightMode={setLightMode} />} />
      </Routes>
    </AppShell>
  );
}
