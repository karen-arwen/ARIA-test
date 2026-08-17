import type { AriaState } from "../shared/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getState(): Promise<AriaState> {
  return request<AriaState>("/api/state");
}

export function runCycle(): Promise<AriaState> {
  return request<AriaState>("/api/engine/tick", { method: "POST" });
}

export function generateOpening(): Promise<AriaState> {
  return request<AriaState>("/api/opening", { method: "POST" });
}

export function approvePreparedAction(id: string): Promise<AriaState> {
  return request<AriaState>(`/api/actions/${id}/approve`, { method: "POST" });
}

export function adjustPreparedAction(id: string): Promise<AriaState> {
  return request<AriaState>(`/api/actions/${id}/adjust`, { method: "POST" });
}

export function approveDecision(id: string): Promise<AriaState> {
  return request<AriaState>(`/api/decisions/${id}/approve`, { method: "POST" });
}

export function rejectDecision(id: string): Promise<AriaState> {
  return request<AriaState>(`/api/decisions/${id}/reject`, { method: "POST" });
}

export function addMemory(content: string): Promise<AriaState> {
  return request<AriaState>("/api/memories", {
    method: "POST",
    body: JSON.stringify({ content })
  });
}

export function createMission(missionRequest: string): Promise<AriaState> {
  return request<AriaState>("/api/missions", {
    method: "POST",
    body: JSON.stringify({ request: missionRequest })
  });
}

export function advanceMission(id: string): Promise<AriaState> {
  return request<AriaState>(`/api/missions/${id}/advance`, { method: "POST" });
}
