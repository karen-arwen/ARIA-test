export type AriaTone = "executive" | "companion" | "guardian" | "silent";

export type Sensitivity = "low" | "medium" | "high";

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type DecisionStatus = "pending" | "approved" | "rejected";

export type PreparedActionStatus = "prepared" | "executed" | "adjusting";

export type PreparedActionKind = "email_draft" | "agenda_adjustment" | "meeting_prep" | "memory_confirmation";

export type MissionStatus = "intake" | "planned" | "waiting_permission" | "executing" | "done";

export type MissionDomain =
  | "communication"
  | "calendar"
  | "finance"
  | "health"
  | "travel"
  | "content"
  | "research"
  | "personal_ops"
  | "development"
  | "unknown";

export type SignalSource =
  | "calendar"
  | "email"
  | "health"
  | "finance"
  | "notes"
  | "manual";

export interface AriaProfile {
  userName: string;
  ariaTone: AriaTone;
  operatingMode: "first_week" | "trusted" | "autonomous";
  focusPrinciple: string;
  quietHours: string;
}

export interface Memory {
  id: string;
  type: "fact" | "preference" | "pattern" | "goal" | "relationship";
  content: string;
  source: string;
  confidence: number;
  sensitivity: Sensitivity;
  createdAt: string;
  updatedAt: string;
  userEditable: boolean;
}

export interface Goal {
  id: string;
  title: string;
  horizon: "week" | "month" | "quarter" | "year";
  progress: number;
  nextAction: string;
}

export interface Signal {
  id: string;
  source: SignalSource;
  title: string;
  detail: string;
  impact: number;
  urgency: number;
  detectedAt: string;
  linkedGoalId?: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  proposedAction: string;
  evidence: string[];
  risk: "low" | "medium" | "high";
  autonomyLevel: AutonomyLevel;
  status: DecisionStatus;
  createdAt: string;
}

export interface PreparedAction {
  id: string;
  kind: PreparedActionKind;
  title: string;
  context: string;
  preparedText: string;
  approveLabel: string;
  adjustLabel: string;
  risk: "low" | "medium" | "high";
  status: PreparedActionStatus;
  result?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AriaOpening {
  id: string;
  voiceMessage: string;
  telemetryLine: string;
  provider: "claude" | "local";
  model: string;
  generatedAt: string;
  actions: PreparedAction[];
}

export interface Mission {
  id: string;
  title: string;
  originalRequest: string;
  domain: MissionDomain;
  status: MissionStatus;
  risk: "low" | "medium" | "high";
  requiredAutonomy: AutonomyLevel;
  steps: string[];
  completedSteps: number;
  nextAction: string;
  blockers: string[];
  output?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutonomyGrant {
  id: string;
  domain: string;
  actionPattern: string;
  level: AutonomyLevel;
  guardrail: string;
  successCount: number;
}

export interface DailyBrief {
  greeting: string;
  primaryRisk: string;
  prepared: string[];
  recommendation: string;
}

export interface AuditLog {
  id: string;
  event: string;
  detail: string;
  createdAt: string;
}

export interface AriaState {
  profile: AriaProfile;
  brief: DailyBrief;
  memories: Memory[];
  goals: Goal[];
  signals: Signal[];
  decisions: Decision[];
  missions: Mission[];
  opening?: AriaOpening;
  preparedActions: PreparedAction[];
  autonomy: AutonomyGrant[];
  audit: AuditLog[];
}
