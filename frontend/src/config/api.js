// Shared API endpoints configuration for GrindSet ERP
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('API offline');
    return await response.json();
  } catch (error) {
    return { Status: 'Offline', Error: error.message };
  }
}

export async function fetchErdSummary() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/erd-summary`);
    if (!response.ok) throw new Error('Network response error');
    return await response.json();
  } catch (error) {
    return null;
  }
}
