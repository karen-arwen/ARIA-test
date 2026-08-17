import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import {
  addMemory,
  adjustPreparedAction,
  advanceMission,
  applyOpening,
  approveDecision,
  approvePreparedAction,
  createMission,
  rejectDecision,
  runProactiveCycle
} from "./engine.js";
import { generateOpeningWithClaude } from "./claude.js";
import { loadState, saveState } from "./store.js";

const app = express();
const port = Number(process.env.ARIA_API_PORT ?? 8787);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "aria-api" });
});

app.get("/api/state", async (_request, response, next) => {
  try {
    response.json(await loadState());
  } catch (error) {
    next(error);
  }
});

app.post("/api/engine/tick", async (_request, response, next) => {
  try {
    const state = await loadState();
    const nextState = runProactiveCycle(state);
    await saveState(nextState);
    response.json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/opening", async (_request, response, next) => {
  try {
    const state = await loadState();
    const opening = await generateOpeningWithClaude(state);
    const nextState = applyOpening(state, opening);
    await saveState(nextState);
    response.json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/actions/:id/approve", async (request, response, next) => {
  try {
    const state = await loadState();
    const nextState = approvePreparedAction(state, request.params.id);
    await saveState(nextState);
    response.json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/actions/:id/adjust", async (request, response, next) => {
  try {
    const state = await loadState();
    const nextState = adjustPreparedAction(state, request.params.id);
    await saveState(nextState);
    response.json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/decisions/:id/approve", async (request, response, next) => {
  try {
    const state = await loadState();
    const nextState = approveDecision(state, request.params.id);
    await saveState(nextState);
    response.json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/decisions/:id/reject", async (request, response, next) => {
  try {
    const state = await loadState();
    const nextState = rejectDecision(state, request.params.id);
    await saveState(nextState);
    response.json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/memories", async (request, response, next) => {
  try {
    const schema = z.object({ content: z.string().trim().min(3).max(500) });
    const body = schema.parse(request.body);
    const state = await loadState();
    const nextState = addMemory(state, body.content);
    await saveState(nextState);
    response.status(201).json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/missions", async (request, response, next) => {
  try {
    const schema = z.object({ request: z.string().trim().min(3).max(1000) });
    const body = schema.parse(request.body);
    const state = await loadState();
    const nextState = createMission(state, body.request);
    await saveState(nextState);
    response.status(201).json(nextState);
  } catch (error) {
    next(error);
  }
});

app.post("/api/missions/:id/advance", async (request, response, next) => {
  try {
    const state = await loadState();
    const nextState = advanceMission(state, request.params.id);
    await saveState(nextState);
    response.json(nextState);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    response.status(400).json({ error: "invalid_payload", issues: error.issues });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "internal_error" });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`ARIA API listening on http://127.0.0.1:${port}`);
});
