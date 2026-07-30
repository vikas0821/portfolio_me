// All backend API calls live here.

const BASE = import.meta.env.VITE_OPTION_API_URL || import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function postForm(path, form) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method: "POST", body: form });
  } catch (e) {
    throw new Error(
      "Cannot reach the backend at " + BASE + ". Is the API server running?"
    );
  }
  if (!res.ok) {
    let detail;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function analyzeSingle(file, expiry) {
  const form = new FormData();
  form.append("file", file);
  if (expiry) form.append("expiry", expiry);
  return postForm("/analyze/single", form);
}

export async function analyzeCompare(file1, file2, expiry) {
  const form = new FormData();
  form.append("file1", file1);
  form.append("file2", file2);
  if (expiry) form.append("expiry", expiry);
  return postForm("/analyze/compare", form);
}

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function getJournalStats() {
  const res = await fetch(`${BASE}/journal/stats`);
  if (!res.ok) throw new Error("Could not load track record.");
  return res.json();
}

export async function resetJournal() {
  const res = await fetch(`${BASE}/journal`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not reset journal.");
  return res.json();
}
