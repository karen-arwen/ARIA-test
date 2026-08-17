# ARIA

ARIA e um assistente de vida autonomo: uma entidade de IA pessoal que aprende o usuario, antecipa necessidades, executa tarefas com permissao progressiva e opera como memoria, copiloto e parceiro de execucao.

Este repositorio comeca pela especificacao do produto e da arquitetura:

- [Blueprint do ARIA](docs/ARIA_BLUEPRINT.md)

## Principios

- Antecipar antes de reagir.
- Conhecer o usuario sem invadir a privacidade.
- Executar, nao apenas sugerir.
- Receber qualquer missao e transformar em plano, permissao e acao.
- Ganhar autonomia por confianca, historico e consentimento.
- Ser util em silencio e presente quando importa.

## Estado atual

Fundacao conceitual criada e primeiro MVP local iniciado: cockpit web operacional, API, memoria persistente em JSON local, fila de permissoes, sinais observados, missoes universais com progresso, autonomia e ciclo proativo.

## Desenvolvimento

```bash
npm install
npm run dev
```

Para usar a chamada real da Claude API, crie `.env` com:

```bash
ANTHROPIC_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-sonnet-4-6
```

Sem `ANTHROPIC_API_KEY`, o ARIA usa um fallback local para continuar funcionando, mas a tela indica que nao esta usando Claude.

URLs locais:

- App: http://127.0.0.1:5173
- API: http://127.0.0.1:8787/api/state

Validacoes:

```bash
npm run build
npm audit --audit-level=moderate
```
