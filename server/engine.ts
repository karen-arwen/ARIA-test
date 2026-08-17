import type {
  AriaOpening,
  AriaState,
  AuditLog,
  Decision,
  Memory,
  Mission,
  MissionDomain,
  PreparedAction,
  Signal
} from "../shared/types.js";

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export function runProactiveCycle(state: AriaState): AriaState {
  const next: AriaState = structuredClone(state);
  const unresolved = next.signals
    .filter((signal) => signal.impact + signal.urgency >= 15)
    .filter((signal) => !next.decisions.some((decision) => decision.context.includes(signal.title)));

  for (const signal of unresolved) {
    next.decisions.unshift(createDecisionFromSignal(signal));
  }

  const approvedDecisions = next.decisions.filter((decision) => decision.status === "approved").length;
  const existingPattern = next.memories.some((memory) => memory.id === "mem_execution_bias");

  if (approvedDecisions >= 2 && !existingPattern) {
    next.memories.unshift({
      id: "mem_execution_bias",
      type: "pattern",
      content: "Quando ARIA transforma visao em artefatos executaveis, o usuario tende a aprovar o caminho.",
      source: "reflection_loop",
      confidence: 0.74,
      sensitivity: "low",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      userEditable: true
    });
  }

  next.brief = buildBrief(next);
  next.audit.unshift(createLog("proactive_cycle", `Ciclo executado. ${unresolved.length} decisao criada.`));
  return next;
}

export function approveDecision(state: AriaState, decisionId: string): AriaState {
  const next: AriaState = structuredClone(state);
  const decision = next.decisions.find((item) => item.id === decisionId);

  if (!decision) {
    return next;
  }

  decision.status = "approved";
  next.audit.unshift(createLog("decision_approved", decision.title));
  next.brief = buildBrief(next);
  return next;
}

export function rejectDecision(state: AriaState, decisionId: string): AriaState {
  const next: AriaState = structuredClone(state);
  const decision = next.decisions.find((item) => item.id === decisionId);

  if (!decision) {
    return next;
  }

  decision.status = "rejected";
  next.audit.unshift(createLog("decision_rejected", decision.title));
  next.brief = buildBrief(next);
  return next;
}

export function addMemory(state: AriaState, content: string): AriaState {
  const next: AriaState = structuredClone(state);
  const lower = content.toLowerCase();
  const memory: Memory = {
    id: id("mem"),
    type: lower.includes("prefiro") || lower.includes("odeio") || lower.includes("gosto") ? "preference" : "fact",
    content,
    source: "user_direct_input",
    confidence: 1,
    sensitivity: "medium",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userEditable: true
  };

  next.memories.unshift(memory);
  next.audit.unshift(createLog("memory_added", content));
  next.preparedActions.unshift(createMemoryConfirmationAction(content));
  next.brief = buildBrief(next);
  return next;
}

export function applyOpening(state: AriaState, opening: AriaOpening): AriaState {
  const next: AriaState = structuredClone(state);
  next.opening = opening;
  next.preparedActions = opening.actions;
  next.audit.unshift(createLog("opening_generated", `Provider: ${opening.provider}; modelo: ${opening.model}`));
  next.brief = buildBrief(next);
  return next;
}

export function approvePreparedAction(state: AriaState, actionId: string): AriaState {
  const next: AriaState = structuredClone(state);
  const action = next.preparedActions.find((item) => item.id === actionId);

  if (!action) {
    return next;
  }

  action.status = "executed";
  action.result = simulateActionExecution(action);
  action.updatedAt = nowIso();

  if (next.opening) {
    next.opening.actions = next.preparedActions;
  }

  next.audit.unshift(createLog("prepared_action_executed", `${action.title}: ${action.result}`));
  next.brief = buildBrief(next);
  return next;
}

export function adjustPreparedAction(state: AriaState, actionId: string): AriaState {
  const next: AriaState = structuredClone(state);
  const action = next.preparedActions.find((item) => item.id === actionId);

  if (!action) {
    return next;
  }

  action.status = "adjusting";
  action.result = "Separei para ajuste. Na proxima versao, isso abre um editor fino de tom, horario e escopo.";
  action.updatedAt = nowIso();

  if (next.opening) {
    next.opening.actions = next.preparedActions;
  }

  next.audit.unshift(createLog("prepared_action_adjusting", action.title));
  next.brief = buildBrief(next);
  return next;
}

export function createMission(state: AriaState, request: string): AriaState {
  const next: AriaState = structuredClone(state);
  const mission = planMission(request);

  next.missions.unshift(mission);
  next.audit.unshift(createLog("mission_created", mission.title));

  if (mission.requiredAutonomy > 2 || mission.risk !== "low") {
    next.decisions.unshift({
      id: id("dec"),
      title: `Permitir missao: ${mission.title}`,
      context: `ARIA recebeu uma missao faz-tudo no dominio ${mission.domain}.`,
      proposedAction: mission.nextAction,
      evidence: [
        `Pedido original: ${mission.originalRequest}`,
        `Risco estimado: ${mission.risk}`,
        `Autonomia necessaria: N${mission.requiredAutonomy}`
      ],
      risk: mission.risk,
      autonomyLevel: mission.requiredAutonomy,
      status: "pending",
      createdAt: nowIso()
    });
  }

  next.brief = buildBrief(next);
  return next;
}

export function advanceMission(state: AriaState, missionId: string): AriaState {
  const next: AriaState = structuredClone(state);
  const mission = next.missions.find((item) => item.id === missionId);

  if (!mission) {
    return next;
  }

  if (mission.blockers.length > 0 && mission.completedSteps >= 3) {
    mission.status = "waiting_permission";
    mission.nextAction = "Resolver bloqueios de permissao antes de continuar.";
    mission.updatedAt = nowIso();
    next.decisions.unshift({
      id: id("dec"),
      title: `Desbloquear missao: ${mission.title}`,
      context: `A missao chegou no limite do que posso preparar sem permissao ou conector.`,
      proposedAction: `Autorizar o proximo passo: ${mission.blockers[0]}`,
      evidence: [
        `Missao: ${mission.originalRequest}`,
        `Passos concluidos: ${mission.completedSteps}/${mission.steps.length}`,
        `Bloqueio principal: ${mission.blockers[0]}`
      ],
      risk: mission.risk,
      autonomyLevel: mission.requiredAutonomy,
      status: "pending",
      createdAt: nowIso()
    });
    next.audit.unshift(createLog("mission_waiting_permission", mission.title));
    next.brief = buildBrief(next);
    return next;
  }

  mission.completedSteps = Math.min(mission.completedSteps + 1, mission.steps.length);
  mission.status = mission.completedSteps >= mission.steps.length ? "done" : "executing";
  mission.nextAction = mission.status === "done" ? "Missao concluida." : mission.steps[mission.completedSteps];
  mission.output = buildMissionOutput(mission);
  mission.updatedAt = nowIso();

  next.audit.unshift(createLog("mission_advanced", `${mission.title}: ${mission.completedSteps}/${mission.steps.length}`));
  next.brief = buildBrief(next);
  return next;
}

function createDecisionFromSignal(signal: Signal): Decision {
  return {
    id: id("dec"),
    title: `Responder ao sinal: ${signal.title}`,
    context: `ARIA detectou o sinal "${signal.title}" com impacto ${signal.impact}/10 e urgencia ${signal.urgency}/10.`,
    proposedAction: `Transformar o sinal em uma proxima acao concreta: ${signal.detail}`,
    evidence: [
      signal.detail,
      "A soma de impacto e urgencia passou do limiar de intervencao proativa."
    ],
    risk: signal.impact >= 9 ? "medium" : "low",
    autonomyLevel: 2,
    status: "pending",
    createdAt: nowIso()
  };
}

function planMission(request: string): Mission {
  const normalized = request.toLowerCase();
  const domain = detectMissionDomain(normalized);
  const risk = detectMissionRisk(normalized, domain);
  const requiredAutonomy = risk === "high" ? 4 : risk === "medium" ? 3 : 2;
  const title = summarizeMission(request, domain);

  return {
    id: id("mis"),
    title,
    originalRequest: request,
    domain,
    status: requiredAutonomy > 2 ? "waiting_permission" : "planned",
    risk,
    requiredAutonomy,
    steps: buildMissionSteps(domain, request),
    completedSteps: 0,
    nextAction: buildMissionNextAction(domain, risk),
    blockers: buildMissionBlockers(domain, risk),
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

function detectMissionDomain(text: string): MissionDomain {
  if (hasAny(text, ["email", "mensagem", "responder", "whatsapp", "slack", "cliente"])) {
    return "communication";
  }

  if (hasAny(text, ["agenda", "reuniao", "calendario", "horario", "evento"])) {
    return "calendar";
  }

  if (hasAny(text, ["dinheiro", "pagamento", "cartao", "fatura", "invest", "comprar", "preco"])) {
    return "finance";
  }

  if (hasAny(text, ["sono", "saude", "treino", "habito", "remedio", "consulta"])) {
    return "health";
  }

  if (hasAny(text, ["viagem", "voo", "hotel", "passagem", "roteiro"])) {
    return "travel";
  }

  if (hasAny(text, ["post", "conteudo", "video", "roteiro", "artigo", "copy"])) {
    return "content";
  }

  if (hasAny(text, ["pesquise", "pesquisar", "descubra", "analise", "compare"])) {
    return "research";
  }

  if (hasAny(text, ["codigo", "app", "site", "sistema", "desenvolv", "bug", "repo"])) {
    return "development";
  }

  if (hasAny(text, ["organize", "resolver", "planeje", "cuide", "faz", "faca"])) {
    return "personal_ops";
  }

  return "unknown";
}

function detectMissionRisk(text: string, domain: MissionDomain): "low" | "medium" | "high" {
  if (hasAny(text, ["pagar", "transferir", "comprar", "enviar", "cancelar", "assinar", "demitir"])) {
    return "high";
  }

  if (["finance", "health", "communication", "travel"].includes(domain)) {
    return "medium";
  }

  return "low";
}

function summarizeMission(request: string, domain: MissionDomain): string {
  const trimmed = request.trim();
  const short = trimmed.length > 72 ? `${trimmed.slice(0, 69)}...` : trimmed;
  const labels: Record<MissionDomain, string> = {
    communication: "Comunicacao",
    calendar: "Agenda",
    finance: "Financas",
    health: "Saude",
    travel: "Viagem",
    content: "Conteudo",
    research: "Pesquisa",
    personal_ops: "Operacao pessoal",
    development: "Desenvolvimento",
    unknown: "Missao geral"
  };

  return `${labels[domain]}: ${short}`;
}

function buildMissionOutput(mission: Mission): string {
  const currentStep = mission.steps[Math.max(0, mission.completedSteps - 1)];
  const prefix = mission.status === "done" ? "Entrega final" : "Progresso";

  return `${prefix}: ${currentStep}`;
}

function createMemoryConfirmationAction(content: string): PreparedAction {
  const timestamp = nowIso();

  return {
    id: id("act"),
    kind: "memory_confirmation",
    title: "Memoria incorporada ao comportamento",
    context: "Eu nao guardei isso como nota solta; vou usar como criterio nas proximas sugestoes.",
    preparedText: `Guardado: "${content}". Vou considerar isso quando sugerir agenda, respostas e prioridades.`,
    approveLabel: "Confirmar",
    adjustLabel: "Corrigir",
    risk: "low",
    status: "prepared",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function simulateActionExecution(action: PreparedAction): string {
  if (action.kind === "email_draft") {
    return "Rascunho aprovado e marcado como pronto para envio simulado. Conector de email real ainda nao esta habilitado.";
  }

  if (action.kind === "meeting_prep") {
    return "Pauta preparada e fixada como material principal da proxima reuniao.";
  }

  if (action.kind === "agenda_adjustment") {
    return "Ajuste aplicado em modo simulado: bloco de foco protegido e tarefa menor movida.";
  }

  return "Memoria confirmada e ativa nas proximas recomendacoes.";
}

function buildMissionSteps(domain: MissionDomain, request: string): string[] {
  const common = [
    "Entender o resultado desejado e restricoes implicitas.",
    "Buscar contexto nas memorias, objetivos, sinais e permissoes.",
    "Separar o que posso preparar agora do que exige aprovacao."
  ];

  const domainSteps: Record<MissionDomain, string[]> = {
    communication: ["Rascunhar mensagem no tom adequado.", "Identificar destinatario, canal e risco social."],
    calendar: ["Encontrar conflitos e janelas possiveis.", "Preparar mudancas de agenda com justificativa."],
    finance: ["Classificar impacto financeiro.", "Preparar analise sem executar pagamento ou compra sozinho."],
    health: ["Tratar como suporte de rotina, nao diagnostico.", "Sugerir proxima acao segura e reversivel."],
    travel: ["Mapear datas, preferencias, documentos e limites de preco.", "Preparar opcoes antes de reservar."],
    content: ["Definir formato, voz e publico.", "Gerar primeiro artefato editavel."],
    research: ["Definir perguntas, fontes e criterios.", "Produzir sintese acionavel."],
    personal_ops: ["Criar plano operacional.", "Converter em checklist com responsavel e prazo."],
    development: ["Ler o estado do projeto.", "Implementar em passos pequenos e validar build/testes."],
    unknown: ["Pedir ou inferir dominio provavel.", "Criar plano inicial reversivel."]
  };

  return [...common, ...domainSteps[domain], `Pedido recebido: ${request}`];
}

function buildMissionNextAction(domain: MissionDomain, risk: "low" | "medium" | "high"): string {
  if (risk === "high") {
    return "Preparar plano e pedir aprovacao explicita antes de qualquer acao externa.";
  }

  if (risk === "medium") {
    return "Preparar a execucao e pedir confirmacao leve antes de agir fora do ARIA.";
  }

  const actions: Record<MissionDomain, string> = {
    communication: "Criar rascunho e deixar pronto para revisao.",
    calendar: "Criar proposta de reorganizacao.",
    finance: "Criar analise preliminar.",
    health: "Criar ajuste de rotina seguro.",
    travel: "Criar lista de opcoes e criterios.",
    content: "Gerar primeira versao do material.",
    research: "Criar sintese inicial com proximas perguntas.",
    personal_ops: "Criar plano de execucao.",
    development: "Implementar a primeira fatia tecnica validavel.",
    unknown: "Criar plano inicial e solicitar confirmacao de escopo."
  };

  return actions[domain];
}

function buildMissionBlockers(domain: MissionDomain, risk: "low" | "medium" | "high"): string[] {
  const blockers: string[] = [];

  if (risk !== "low") {
    blockers.push("Permissao explicita necessaria antes de acao externa.");
  }

  if (["communication", "calendar", "finance", "health", "travel"].includes(domain)) {
    blockers.push("Conector real ainda nao configurado para esse dominio.");
  }

  return blockers;
}

function buildBrief(state: AriaState) {
  const pending = state.decisions.filter((decision) => decision.status === "pending");
  const activeMissions = state.missions.filter((mission) => mission.status !== "done");
  const topSignal = [...state.signals].sort((a, b) => b.impact + b.urgency - (a.impact + a.urgency))[0];
  const activeGoal = [...state.goals].sort((a, b) => a.progress - b.progress)[0];

  return {
    greeting: state.opening?.voiceMessage ?? `Ola, ${state.profile.userName}. Estou acompanhando ${state.signals.length} sinais, ${state.goals.length} objetivos e ${activeMissions.length} missoes.`,
    primaryRisk: topSignal
      ? `${topSignal.title}: ${topSignal.detail}`
      : "Nenhum risco relevante detectado no momento.",
    prepared: [
      `${pending.length} decisao pendente na inbox.`,
      `${activeMissions.length} missao faz-tudo ativa.`,
      `${state.memories.length} memorias ativas orientando meu julgamento.`,
      activeGoal ? `Proximo foco recomendado: ${activeGoal.nextAction}` : "Nenhum objetivo ativo configurado."
    ],
    recommendation: pending[0]
      ? `Revise "${pending[0].title}" para eu calibrar minha autonomia.`
      : "Execute um novo ciclo proativo quando houver novos sinais."
  };
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function createLog(event: string, detail: string): AuditLog {
  return {
    id: id("log"),
    event,
    detail,
    createdAt: nowIso()
  };
}
