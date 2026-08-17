import type { AriaOpening, AriaState, PreparedAction } from "../shared/types.js";

interface ClaudeAction {
  kind: PreparedAction["kind"];
  title: string;
  context: string;
  preparedText: string;
  approveLabel: string;
  adjustLabel: string;
  risk: PreparedAction["risk"];
}

interface ClaudeOpeningPayload {
  voiceMessage: string;
  telemetryLine: string;
  actions: ClaudeAction[];
}

const claudeModel = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

export async function generateOpeningWithClaude(state: AriaState): Promise<AriaOpening> {
  const fallback = createLocalOpening(state);

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ...fallback,
      voiceMessage: `${fallback.voiceMessage} Configure ANTHROPIC_API_KEY para eu trocar este fallback por uma chamada real ao Claude.`,
      provider: "local"
    };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 1600,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: buildContextPrompt(state)
          }
        ]
      })
    });

    if (!response.ok) {
      return {
        ...fallback,
        voiceMessage: `${fallback.voiceMessage} Claude API retornou ${response.status}; mantive o modo local para nao travar sua manha.`,
        provider: "local"
      };
    }

    const raw = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = raw.content?.find((block) => block.type === "text")?.text ?? "";
    const payload = parseClaudeJson(text);

    return toOpening(payload, "claude", claudeModel);
  } catch {
    return {
      ...fallback,
      voiceMessage: `${fallback.voiceMessage} Nao consegui chegar na Claude API agora; continuei operando localmente.`,
      provider: "local"
    };
  }
}

function buildSystemPrompt(): string {
  return [
    "Voce e ARIA, um assistente de vida autonomo. Nao soe como chatbot.",
    "Abra o dia falando com presenca: direto, inteligente, especifico e humano.",
    "Nao liste features. Mostre o que voce ja percebeu, preparou e vai fazer.",
    "Crie 2 ou 3 acoes prontas para aprovacao. Pelo menos uma deve ser um rascunho de email para Joao sobre prazo do projeto.",
    "Responda somente JSON valido, sem markdown.",
    "Schema:",
    "{",
    "  \"voiceMessage\": \"fala curta e personalizada em portugues\",",
    "  \"telemetryLine\": \"linha curta do que esta monitorando agora\",",
    "  \"actions\": [",
    "    {",
    "      \"kind\": \"email_draft|agenda_adjustment|meeting_prep|memory_confirmation\",",
    "      \"title\": \"acao concreta\",",
    "      \"context\": \"por que isso importa agora\",",
    "      \"preparedText\": \"entrega pronta: rascunho, pauta, ajuste ou confirmacao\",",
    "      \"approveLabel\": \"verbo de aprovacao\",",
    "      \"adjustLabel\": \"verbo de ajuste\",",
    "      \"risk\": \"low|medium|high\"",
    "    }",
    "  ]",
    "}"
  ].join("\n");
}

function buildContextPrompt(state: AriaState): string {
  const now = new Date();
  const memories = state.memories
    .slice(0, 8)
    .map((memory) => `- ${memory.type}: ${memory.content}`)
    .join("\n");

  return [
    `Data/hora local aproximada: ${now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    `Usuario: ${state.profile.userName}`,
    `Tom preferido: ${state.profile.ariaTone}`,
    `Principio operacional: ${state.profile.focusPrinciple}`,
    "Contexto simulado autorizado para este MVP:",
    "- Email critico: Joao perguntou se o prazo do projeto continua sexta. Ainda sem resposta.",
    "- Reuniao: alinhamento de produto em 40 minutos, sem pauta definida.",
    "- Sono: noite curta, 5h40 registradas.",
    "- Agenda: tarde com espaco para um bloco de foco se uma tarefa menor for movida.",
    "Memorias conhecidas:",
    memories || "- Nenhuma memoria relevante ainda.",
    "Objetivo da resposta: gerar a abertura do ARIA e acoes prontas. Nao explique o schema."
  ].join("\n");
}

function parseClaudeJson(text: string): ClaudeOpeningPayload {
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  const json = firstBrace >= 0 && lastBrace >= 0 ? trimmed.slice(firstBrace, lastBrace + 1) : trimmed;
  const parsed = JSON.parse(json) as ClaudeOpeningPayload;

  if (!parsed.voiceMessage || !Array.isArray(parsed.actions)) {
    throw new Error("invalid_claude_opening_payload");
  }

  return parsed;
}

function toOpening(payload: ClaudeOpeningPayload, provider: AriaOpening["provider"], model: string): AriaOpening {
  const generatedAt = new Date().toISOString();

  return {
    id: id("open"),
    voiceMessage: payload.voiceMessage,
    telemetryLine: payload.telemetryLine,
    provider,
    model,
    generatedAt,
    actions: payload.actions.slice(0, 3).map((action) => ({
      id: id("act"),
      kind: action.kind,
      title: action.title,
      context: action.context,
      preparedText: action.preparedText,
      approveLabel: action.approveLabel,
      adjustLabel: action.adjustLabel,
      risk: action.risk,
      status: "prepared",
      createdAt: generatedAt,
      updatedAt: generatedAt
    }))
  };
}

function createLocalOpening(state: AriaState): AriaOpening {
  return toOpening(
    {
      voiceMessage:
        `Bom dia, ${state.profile.userName}. Eu ja encontrei uma coisa que merece acao agora: o email do Joao sobre o prazo do projeto ainda esta sem resposta. Tambem vi uma reuniao em 40 minutos sem pauta e uma noite curta de sono; por isso preparei respostas e uma agenda mais leve antes de te pedir qualquer coisa.`,
      telemetryLine: "Monitorando email critico, reuniao sem pauta e janela de foco da tarde.",
      actions: [
        {
          kind: "email_draft",
          title: "Rascunhar resposta para o Joao sobre o prazo",
          context: "Ele pediu confirmacao do prazo de sexta e a falta de resposta pode virar ruido no projeto.",
          preparedText:
            "Oi, Joao. Sim, seguimos mirando sexta como prazo. Hoje vou fechar os pontos pendentes e te mando um update mais objetivo ate o fim da tarde. Se eu identificar algum risco real no caminho, te aviso antes para ajustarmos sem surpresa.",
          approveLabel: "Aprovar rascunho",
          adjustLabel: "Ajustar tom",
          risk: "medium"
        },
        {
          kind: "meeting_prep",
          title: "Preparar pauta da reuniao de produto",
          context: "A reuniao esta proxima e ainda nao tem pauta, entao preparei uma estrutura de 15 minutos.",
          preparedText:
            "Pauta sugerida: 1. Decisao que precisa sair hoje. 2. Bloqueios do prazo de sexta. 3. Responsavel por cada pendencia. 4. Proximo checkpoint.",
          approveLabel: "Usar pauta",
          adjustLabel: "Editar pauta",
          risk: "low"
        },
        {
          kind: "agenda_adjustment",
          title: "Proteger bloco de foco depois do almoco",
          context: "Com sono curto, o melhor e reduzir troca de contexto e guardar energia para execucao profunda.",
          preparedText:
            "Mover tarefa administrativa para amanha cedo e reservar 14:00-15:30 para fechar os pontos do projeto antes do update ao Joao.",
          approveLabel: "Aplicar ajuste",
          adjustLabel: "Mudar horario",
          risk: "low"
        }
      ]
    },
    "local",
    "local-fallback"
  );
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}
