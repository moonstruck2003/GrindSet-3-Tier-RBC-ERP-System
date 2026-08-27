import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import WorkforcePage from './pages/WorkforcePage';
import ProjectsPage from './pages/ProjectsPage';
import FinancePage from './pages/FinancePage';
import AuditPage from './pages/AuditPage';

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light', lightMode);
  }, [lightMode]);

  return (
    <AppShell lightMode={lightMode} setLightMode={setLightMode}>
      <Routes>
        <Route path="/" element={<LandingPage lightMode={lightMode} setLightMode={setLightMode} />} />
        <Route path="/dashboard" element={<DashboardPage lightMode={lightMode} />} />
        <Route path="/workforce" element={<WorkforcePage lightMode={lightMode} />} />
        <Route path="/projects"  element={<ProjectsPage lightMode={lightMode} />} />
        <Route path="/finance"   element={<FinancePage lightMode={lightMode} />} />
        <Route path="/audit"     element={<AuditPage lightMode={lightMode} />} />
        <Route path="*"          element={<LandingPage lightMode={lightMode} setLightMode={setLightMode} />} />
      </Routes>
    </AppShell>
  );
}
