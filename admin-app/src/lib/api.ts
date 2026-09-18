const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://jurisshorts-backend.onrender.com/api/v1";
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "juris_admin_secret_key_2026";

const headers = {
  "Content-Type": "application/json",
  "X-Admin-Key": ADMIN_KEY
};

export async function fetchTriageQueue(status: string = "IN_REVIEW") {
  try {
    const res = await fetch(`${API_BASE}/admin/triage?status=${status}`, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch triage items");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function processTriageAction(
  cardId: string,
  action: "APPROVE" | "UPDATE_AND_APPROVE" | "REJECT",
  data?: { headline?: string; advocate_summary?: string; citizen_summary?: string; broadcast_push?: boolean }
) {
  const res = await fetch(`${API_BASE}/admin/triage/${cardId}/action`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      action,
      ...data
    })
  });
  if (!res.ok) throw new Error("Action failed");
  return await res.json();
}

export async function fetchEngineStatus() {
  try {
    const res = await fetch(`${API_BASE}/admin/engine`, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch engine status");
    return await res.json();
  } catch {
    return {
      auto_publish_enabled: true,
      confidence_threshold: 0.95,
      scraper_status: {
        sc_scraper: { status: "HEALTHY", last_run: "10m ago", cases_parsed: 18 },
        delhi_hc_scraper: { status: "HEALTHY", last_run: "25m ago", cases_parsed: 34 },
        gazette_scraper: { status: "HEALTHY", last_run: "1h ago", notifications: 4 }
      }
    };
  }
}

export async function updateEngineConfig(autoPublishEnabled?: boolean, confidenceThreshold?: number) {
  const res = await fetch(`${API_BASE}/admin/engine`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      auto_publish_enabled: autoPublishEnabled,
      confidence_threshold: confidenceThreshold
    })
  });
  if (!res.ok) throw new Error("Failed to update engine config");
  return await res.json();
}

export async function broadcastPush(
  title: string,
  body: string,
  cardId?: string,
  targetRole: string = "all",
  isBreaking: boolean = true
) {
  const res = await fetch(`${API_BASE}/admin/broadcast`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title,
      body,
      card_id: cardId,
      target_role: targetRole,
      is_breaking: isBreaking
    })
  });
  if (!res.ok) throw new Error("Failed to broadcast push notification");
  return await res.json();
}

export async function fetchBroadcastHistory() {
  try {
    const res = await fetch(`${API_BASE}/admin/broadcast/history`, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch history");
    return await res.json();
  } catch {
    return [];
  }
}

export async function aiAssistDraft(rawText: string, courtName: string = "Supreme Court of India") {
  const res = await fetch(`${API_BASE}/admin/manual/ai-assist`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      raw_text: rawText,
      court_name: courtName
    })
  });
  if (!res.ok) throw new Error("AI Co-pilot failed");
  return await res.json();
}

export async function createCardManual(payload: any) {
  const res = await fetch(`${API_BASE}/admin/manual/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create card");
  return await res.json();
}
