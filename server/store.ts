import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { AriaState } from "../shared/types.js";

const dataFile = resolve("data/aria.local.json");
const seedFile = resolve("data/aria.seed.json");

export async function loadState(): Promise<AriaState> {
  await ensureLocalDataFile();
  const raw = await readFile(dataFile, "utf-8");
  const state = normalizeState(JSON.parse(raw.replace(/^\uFEFF/, "")) as Partial<AriaState>);
  await saveState(state);
  return state;
}

export async function saveState(state: AriaState): Promise<void> {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
}

async function ensureLocalDataFile(): Promise<void> {
  try {
    await readFile(dataFile, "utf-8");
  } catch {
    await mkdir(dirname(dataFile), { recursive: true });
    await copyFile(seedFile, dataFile);
  }
}

function normalizeState(state: Partial<AriaState>): AriaState {
  const normalized: AriaState = {
    profile: state.profile ?? {
      userName: "Arwen",
      ariaTone: "companion",
      operatingMode: "first_week",
      focusPrinciple: "Transformar intencoes em execucao real.",
      quietHours: "22:30-07:30"
    },
    brief: state.brief ?? {
      greeting: "ARIA esta inicializando.",
      primaryRisk: "Estado local incompleto.",
      prepared: [],
      recommendation: "Rode um ciclo proativo."
    },
    memories: state.memories ?? [],
    goals: state.goals ?? [],
    signals: state.signals ?? [],
    decisions: state.decisions ?? [],
    missions: state.missions ?? [],
    opening: state.opening,
    preparedActions: state.preparedActions ?? state.opening?.actions ?? [],
    autonomy: state.autonomy ?? [],
    audit: state.audit ?? []
  };

  if (!normalized.missions.some((mission) => mission.id === "mis_001")) {
    normalized.missions.push({
      id: "mis_001",
      title: "Desenvolvimento: Criar o ARIA como produto faz-tudo",
      originalRequest: "Construir um assistente autonomo que tambem consiga receber qualquer missao e transformar em execucao.",
      domain: "development",
      status: "planned",
      risk: "low",
      requiredAutonomy: 2,
      steps: [
        "Entender o resultado desejado e restricoes implicitas.",
        "Buscar contexto nas memorias, objetivos, sinais e permissoes.",
        "Separar o que posso preparar agora do que exige aprovacao.",
        "Implementar uma camada de missoes universais.",
        "Validar build e registrar a decisao no cockpit."
      ],
      completedSteps: 0,
      nextAction: "Implementar a primeira fatia tecnica validavel.",
      blockers: [],
      createdAt: "2026-06-15T21:36:00.000Z",
      updatedAt: "2026-06-15T21:36:00.000Z"
    });
  }

  normalized.missions = normalized.missions.map((mission) => ({
    ...mission,
    completedSteps: mission.completedSteps ?? 0
  }));

  if (!normalized.autonomy.some((grant) => grant.id === "aut_004")) {
    normalized.autonomy.push({
      id: "aut_004",
      domain: "Missoes universais",
      actionPattern: "Receber qualquer pedido, classificar dominio, quebrar em passos e preparar execucao",
      level: 2,
      guardrail: "Acoes externas, financeiras, medicas ou sociais exigem aprovacao explicita.",
      successCount: 0
    });
  }

  return normalized;
}
