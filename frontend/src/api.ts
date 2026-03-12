const API_BASE = 'http://localhost:3000/api';

// ─── Schemes ────────────────────────────────────

export async function fetchSchemes(filters?: {
  region?: string;
  type?: string;
  search?: string;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.region && filters.region !== 'all') params.set('region', filters.region);
  if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);

  const res = await fetch(`${API_BASE}/schemes?${params}`);
  if (!res.ok) throw new Error('Failed to fetch schemes');
  return res.json();
}

export async function createScheme(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/schemes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create scheme');
  return res.json();
}

export async function updateScheme(id: number, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/schemes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update scheme');
  return res.json();
}

export async function deleteScheme(id: number) {
  const res = await fetch(`${API_BASE}/schemes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete scheme');
}

// ─── Recipients ─────────────────────────────────

export async function fetchRecipients(filters?: {
  recipientType?: string;
  region?: string;
  category?: string;
  product?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.recipientType) params.set('recipientType', filters.recipientType);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.product) params.set('product', filters.product);

  const res = await fetch(`${API_BASE}/recipients?${params}`);
  if (!res.ok) throw new Error('Failed to fetch recipients');
  return res.json();
}

export async function fetchFilterOptions() {
  const res = await fetch(`${API_BASE}/recipients/filter-options`);
  if (!res.ok) throw new Error('Failed to fetch filter options');
  return res.json();
}

export async function fetchFilterColumnValues(table: string, column: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/filter-values?table=${table}&column=${column}`);
  if (!res.ok) throw new Error('Failed to fetch filter column values');
  return res.json();
}

// ─── Analytics ──────────────────────────────────

export async function fetchKpis() {
  const res = await fetch(`${API_BASE}/analytics/kpis`);
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

export async function fetchChartData(period: string = 'weekly') {
  const res = await fetch(`${API_BASE}/analytics/chart?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch chart data');
  return res.json();
}

// ─── Dashboard ──────────────────────────────────

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchUpcomingSchemes() {
  const res = await fetch(`${API_BASE}/dashboard/upcoming-schemes`);
  if (!res.ok) throw new Error('Failed to fetch upcoming schemes');
  return res.json();
}

// ─── Settings ───────────────────────────────────

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

// ─── Scheme Config ───────────────────────────────

export async function saveSchemeConfig(config: Record<string, string[]>, name = 'default') {
  const res = await fetch(`${API_BASE}/scheme-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, config }),
  });
  if (!res.ok) throw new Error('Failed to save scheme config');
  return res.json();
}

export async function fetchSchemeConfig(name = 'default') {
  const res = await fetch(`${API_BASE}/scheme-config?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to fetch scheme config');
  return res.json();
}

export async function fetchAllSchemeConfigs() {
  const res = await fetch(`${API_BASE}/scheme-config/all`);
  if (!res.ok) throw new Error('Failed to fetch scheme configs');
  return res.json();
}

// ─── Schema / Datasets ───────────────────────────

export async function fetchDatasets(): Promise<{ name: string; fields: { name: string; type: string }[] }[]> {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error('Failed to fetch datasets');
  return res.json();
}