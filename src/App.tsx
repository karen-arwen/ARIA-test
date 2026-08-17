import {
  Activity,
  Brain,
  Check,
  Cpu,
  Gauge,
  Loader2,
  PenLine,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Terminal,
  X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AriaState, PreparedAction } from "../shared/types";
import {
  addMemory,
  adjustPreparedAction,
  approvePreparedAction,
  generateOpening,
  runCycle
} from "./api";

const actionIcons: Record<PreparedAction["kind"], React.ReactNode> = {
  email_draft: <Send size={20} />,
  agenda_adjustment: <Gauge size={20} />,
  meeting_prep: <Terminal size={20} />,
  memory_confirmation: <Brain size={20} />
};

export function App() {
  const [state, setState] = useState<AriaState | null>(null);
  const [memoryInput, setMemoryInput] = useState("");
  const [loadingOpening, setLoadingOpening] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootOpening();
  }, []);

  const actions = state?.preparedActions ?? [];
  const executedCount = useMemo(() => actions.filter((action) => action.status === "executed").length, [actions]);

  async function bootOpening() {
    setLoadingOpening(true);
    setError(null);

    try {
      setState(await generateOpening());
    } catch (reason) {
      setError(String(reason));
    } finally {
      setLoadingOpening(false);
    }
  }

  async function mutate(action: () => Promise<AriaState>) {
    setBusy(true);
    setError(null);

    try {
      setState(await action());
    } catch (reason) {
      setError(String(reason));
    } finally {
      setBusy(false);
    }
  }

  async function submitMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = memoryInput.trim();

    if (!content) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await addMemory(content);
      setMemoryInput("");
      setState(await generateOpening());
    } catch (reason) {
      setError(String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (!state || loadingOpening) {
    return (
      <main className="aria-boot">
        <div className="boot-core">
          <Loader2 size={38} />
        </div>
        <p>ARIA esta lendo contexto, memoria e prioridades...</p>
      </main>
    );
  }

  return (
    <main className="aria-shell">
      <div className="background-grid" />
      <section className="cockpit">
        <header className="topline">
          <div className="identity">
            <div className="sigil">ARIA</div>
            <div>
              <span>autonomous life intelligence</span>
              <strong>{state.opening?.provider === "claude" ? state.opening.model : "modo local"}</strong>
            </div>
          </div>
          <div className="status-strip">
            <span />
            <p>{state.opening?.telemetryLine}</p>
          </div>
          <button type="button" className="icon-button" onClick={bootOpening} disabled={busy || loadingOpening}>
            <RefreshCw size={18} />
          </button>
        </header>

        {error ? <div className="error">{error}</div> : null}

        <section className="voice-stage">
          <div className="voice-orbit">
            <Radio size={22} />
            <span>ARIA falando agora</span>
          </div>
          <h1>{state.opening?.voiceMessage}</h1>
          <div className="voice-meta">
            <span>{actions.length} acoes preparadas</span>
            <span>{executedCount} executadas</span>
            <span>{new Date(state.opening?.generatedAt ?? Date.now()).toLocaleTimeString("pt-BR")}</span>
          </div>
        </section>

        <section className="prepared-zone">
          <div className="zone-title">
            <Sparkles size={20} />
            <span>Pronto para sua aprovacao</span>
          </div>

          <div className="action-grid">
            {actions.map((action) => (
              <article className={`action-unit action-${action.status}`} key={action.id}>
                <div className="action-head">
                  <div className="action-kind">
                    {actionIcons[action.kind]}
                    <span>{action.kind.replace("_", " ")}</span>
                  </div>
                  <span className={`risk risk-${action.risk}`}>{action.risk}</span>
                </div>
                <h2>{action.title}</h2>
                <p className="action-context">{action.context}</p>
                <div className="prepared-text">
                  <PenLine size={18} />
                  <p>{action.preparedText}</p>
                </div>
                {action.result ? (
                  <div className="result-line">
                    <Check size={18} />
                    <p>{action.result}</p>
                  </div>
                ) : null}
                <div className="action-controls">
                  <button
                    type="button"
                    onClick={() => mutate(() => approvePreparedAction(action.id))}
                    disabled={busy || action.status === "executed"}
                  >
                    <Check size={17} />
                    {action.approveLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => mutate(() => adjustPreparedAction(action.id))}
                    disabled={busy || action.status === "executed"}
                  >
                    <X size={17} />
                    {action.adjustLabel}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="underlay">
          <div className="memory-console">
            <div>
              <Brain size={18} />
              <span>Memoria de personalidade</span>
            </div>
            <form onSubmit={submitMemory}>
              <input
                value={memoryInput}
                onChange={(event) => setMemoryInput(event.target.value)}
                placeholder="Ex: prefiro reunioes de manha, odeio cold call..."
              />
              <button type="submit" disabled={busy || !memoryInput.trim()}>
                Guardar
              </button>
            </form>
          </div>

          <button className="secondary-run" type="button" onClick={() => mutate(runCycle)} disabled={busy}>
            <Activity size={18} />
            Rodar verificacao silenciosa
          </button>

          <div className="audit-console">
            <div>
              <Cpu size={18} />
              <span>Ultimas operacoes</span>
            </div>
            {state.audit.slice(0, 4).map((log) => (
              <p key={log.id}>
                <strong>{log.event}</strong> {log.detail}
              </p>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
