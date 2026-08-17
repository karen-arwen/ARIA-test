# ARIA: Blueprint de Produto e Arquitetura

## 1. Tese

ARIA nao e um chatbot, nem uma lista de tarefas com IA. ARIA e uma camada pessoal de inteligencia que vive ao redor do usuario, observa sinais autorizados da vida digital, entende contexto, forma memoria duradoura, antecipa problemas e executa acoes reais com autonomia progressiva.

A promessa central:

> ARIA percebe o que importa, decide o que merece atencao e age no nivel de autonomia que o usuario ja confiou a ela.

O sistema deve parecer menos uma ferramenta aberta sob demanda e mais uma presenca confiavel: discreta quando tudo esta bem, assertiva quando ha risco, proativa quando pode economizar tempo, humana no tom quando o usuario precisa de apoio.

## 2. Principios De Design

1. Antecipacao sobre reacao  
   ARIA deve detectar mudancas, atrasos, oportunidades e riscos antes que o usuario formule uma pergunta.

2. Autonomia conquistada  
   No inicio, ARIA pergunta. Depois de padroes repetidos de aprovacao, passa a sugerir uma regra. So entao age sozinha em escopos definidos.

3. Memoria com governanca  
   ARIA lembra fatos, preferencias, relacionamentos, objetivos e padroes, mas cada memoria tem origem, confianca, escopo e possibilidade de edicao.

4. Execucao real  
   Respostas sao secundarias. O produto existe para concluir tarefas: enviar, agendar, reservar, resumir, monitorar, cobrar, reorganizar, preparar.

5. Presenca, nao ruido  
   A IA nao deve transformar a vida do usuario em um feed de notificacoes. Ela deve priorizar, agrupar e escolher o momento certo.

6. Personalidade adaptativa  
   ARIA deve ter identidade propria, mas calibrada ao usuario: direta para quem prefere eficiencia, calorosa para quem precisa de motivacao, mais silenciosa em dias de sobrecarga.

## 3. Modelo Mental Do Produto

ARIA opera como cinco sistemas combinados:

- Sensor: acompanha eventos autorizados da vida digital e fisica.
- Memoria: transforma interacoes e sinais em conhecimento persistente.
- Juizo: decide o que importa, o que pode esperar e o que exige acao.
- Executor: usa ferramentas conectadas para agir.
- Relacao: se comunica com personalidade, continuidade e contexto emocional.
- Orquestrador universal: recebe qualquer missao, entende dominio, quebra em passos, busca ferramentas e conduz ate o limite permitido.

## 4. Arquitetura De Alto Nivel

```text
                         +----------------------+
                         |   Interfaces ARIA    |
                         | mobile, desktop, voz |
                         +----------+-----------+
                                    |
                                    v
+----------------+       +----------+-----------+       +------------------+
| Event Sources  | ----> | Context & Perception | ----> | Priority Engine  |
| email calendar |       | signal normalization |       | risk/opportunity |
| files finance  |       +----------+-----------+       +---------+--------+
| health web     |                  |                             |
+----------------+                  v                             v
                         +----------+-----------+       +---------+--------+
                         | Persistent Memory    | <---- | Reflection Loop  |
                         | facts, prefs, goals  |       | learning/update  |
                         +----------+-----------+       +---------+--------+
                                    |                             |
                                    v                             v
                         +----------+-----------+       +---------+--------+
                         | Planning Agent       | ----> | Permission Layer |
                         | tasks, plans, checks |       | autonomy policy  |
                         +----------+-----------+       +---------+--------+
                                    |                             |
                                    v                             v
                         +----------+-----------+       +---------+--------+
                         | Action Runtime       | ----> | Audit & Recovery |
                         | tools/connectors     |       | logs, rollback   |
                         +----------------------+       +------------------+
```

## 5. Nucleos Do Sistema

### 5.1 Identity Core

Responsavel por manter a identidade do usuario e da propria ARIA.

Dados principais:

- Nome, idioma, fuso, rotina e contexto familiar/profissional.
- Preferencias de comunicacao.
- Estilo de decisao: rapido, cauteloso, analitico, emocional, executivo.
- Objetivos de longo prazo.
- Limites explicitos: temas sensiveis, horarios de silencio, areas onde ARIA nunca age sozinha.

### 5.2 Persistent Memory

A memoria deve ser estruturada em camadas:

- Fatos: "o usuario trabalha com X", "a mae se chama Y".
- Preferencias: "prefere voos de manha", "nao gosta de reunioes apos 17h".
- Padroes: "costuma atrasar respostas de email na sexta".
- Compromissos: "quer treinar 3x por semana".
- Relacionamentos: pessoas, papeis, tom adequado, importancia.
- Historico de decisoes: sugestoes aprovadas, rejeitadas e corrigidas.
- Estado atual: projetos ativos, preocupacoes recentes, energia, agenda.

Cada memoria deve ter:

- `id`
- `type`
- `content`
- `source`
- `created_at`
- `updated_at`
- `confidence`
- `sensitivity`
- `expires_at`, quando aplicavel
- `user_editable`

Exemplo:

```json
{
  "type": "preference",
  "content": "Prefere reunioes profundas no periodo da manha.",
  "source": "calendar_pattern_analysis",
  "confidence": 0.82,
  "sensitivity": "low",
  "user_editable": true
}
```

### 5.3 Context & Perception Engine

Transforma sinais brutos em contexto acionavel.

Entradas:

- Emails, mensagens, agenda, tarefas, notas, arquivos.
- Localizacao autorizada, clima, trafego, viagens.
- Dados financeiros permitidos.
- Dados de saude e sono autorizados.
- Navegacao ou pesquisas somente se explicitamente habilitadas.

Saidas:

- Eventos normalizados.
- Mudancas de estado.
- Alertas potenciais.
- Oportunidades.
- Conflitos.
- Lacunas.

Exemplos:

- "Reuniao importante em 35 minutos e o material ainda nao foi aberto."
- "Fatura acima do padrao historico."
- "Contato importante enviou segunda mensagem sem resposta."
- "Agenda tem 6h30 de reunioes e nenhum bloco de foco."
- "O usuario dormiu mal e tem decisoes de alto impacto hoje."

### 5.4 Priority Engine

Decide o que merece a atencao do usuario.

Criterios:

- Urgencia.
- Impacto.
- Reversibilidade.
- Confianca da IA.
- Preferencias do usuario.
- Custo de interrupcao.
- Estado emocional ou energetico inferido.
- Historico de aprovacoes anteriores.

Resultado possivel:

- Ignorar.
- Guardar para resumo.
- Sugerir.
- Pedir aprovacao imediata.
- Executar autonomamente.
- Escalar como alerta critico.

### 5.5 Planning Agent

Cria planos executaveis com verificacoes.

Responsabilidades:

- Quebrar objetivos em tarefas.
- Escolher ferramentas.
- Sequenciar acoes.
- Estimar risco.
- Checar dependencias.
- Preparar alternativas.
- Gerar plano de rollback quando possivel.

Exemplo:

Objetivo: "reorganizar semana sobrecarregada".

Plano:

1. Identificar reunioes moviveis.
2. Preservar compromissos fixos e prioridades altas.
3. Criar blocos de foco.
4. Gerar sugestoes de novos horarios.
5. Rascunhar mensagens para reagendamento.
6. Pedir aprovacao ou executar conforme politica de autonomia.

### 5.6 Permission & Autonomy Layer

ARIA deve ter niveis claros de autonomia:

| Nivel | Nome | Comportamento |
| --- | --- | --- |
| 0 | Observa | Apenas coleta sinais autorizados e responde quando chamada. |
| 1 | Sugere | Detecta oportunidades e sugere acoes. |
| 2 | Prepara | Cria rascunhos, planos e eventos pendentes de aprovacao. |
| 3 | Executa com confirmacao leve | Acoes conhecidas pedem uma confirmacao simples. |
| 4 | Executa autonomamente | Acoes previamente aprovadas sao feitas sem perguntar. |
| 5 | Opera por objetivo | Usuario define limites e ARIA conduz um dominio inteiro. |

Autonomia nunca e global por padrao. Ela e concedida por dominio, acao, risco e contexto.

Exemplos:

- Email para familia: nivel 3.
- Pagamento financeiro: nivel 1 ou 2.
- Reagendar reuniao interna recorrente: nivel 4.
- Enviar mensagem sensivel a chefe: nivel 2.
- Comprar passagem acima de um limite: nivel 1.

### 5.7 Action Runtime

Camada que executa tarefas no mundo real.

Conectores iniciais:

- Gmail/Outlook.
- Google Calendar/Outlook Calendar.
- Google Drive/OneDrive/Notion.
- WhatsApp/Slack/Teams, conforme disponibilidade.
- Bancos/cartoes via agregadores financeiros.
- Apple Health/Google Fit/Oura/Garmin.
- Navegador controlado.
- APIs de viagem, mapas, clima, compras e pesquisa.

Toda acao deve registrar:

- Intencao.
- Ferramenta usada.
- Dados enviados.
- Nivel de autonomia.
- Evidencia que justificou a acao.
- Resultado.
- Possibilidade de desfazer.

### 5.8 Reflection Loop

ARIA aprende depois de cada ciclo.

Fontes de aprendizado:

- Aprovacoes.
- Rejeicoes.
- Edicoes feitas pelo usuario.
- Silencios repetidos.
- Horarios de resposta.
- Mudancas na agenda.
- Linguagem emocional.
- Resultado de acoes executadas.

Perguntas internas:

- A previsao foi correta?
- Interrompi no momento certo?
- O tom foi adequado?
- A acao economizou tempo?
- O usuario corrigiu algo?
- Isso deve virar memoria, regra ou preferencia temporaria?

### 5.9 Universal Mission Layer

ARIA tambem deve ser um sistema "faz tudo". Isso nao significa agir sem limites; significa que qualquer pedido do usuario deve virar uma missao operacional, nao uma conversa perdida.

Entrada:

- "Organize minha semana."
- "Resolva essa pendencia com o cliente."
- "Ache uma viagem barata para julho."
- "Me ajude a criar um produto novo."
- "Cuide desse problema ate estar resolvido."

Saida obrigatoria:

- Dominio provavel.
- Resultado esperado.
- Plano em passos.
- Ferramentas necessarias.
- Risco e nivel de permissao.
- O que ARIA pode fazer agora.
- O que precisa de confirmacao.
- Proxima acao rastreavel.

Fluxo:

```text
pedido livre -> classificar dominio -> consultar memoria -> montar plano -> checar permissoes -> preparar/agir -> registrar -> aprender
```

O diferencial e que o usuario pode falar com ARIA de forma ampla, mas o sistema responde como operador: transforma ambiguidade em execucao.

Regras:

- Se for reversivel e dentro do ambiente local, ARIA pode preparar ou executar conforme autonomia.
- Se envolver dinheiro, saude, comunicacao sensivel, compra, cancelamento ou dados externos, ARIA prepara e pede permissao.
- Se faltar conector, ARIA cria um plano e identifica exatamente qual integracao desbloqueia a missao.
- Se a missao for grande, ARIA cria submissoes e acompanha progresso.

## 6. Modulos De Vida

### 6.1 Comunicacao

Capacidades:

- Detectar emails e mensagens importantes.
- Criar resumos de conversas.
- Rascunhar respostas no tom do usuario.
- Cobrar respostas pendentes.
- Proteger tempo do usuario filtrando ruido.
- Alertar sobre mensagens emocionalmente sensiveis.

Comportamento autonomo:

- Nivel baixo: "Voce quer responder agora?"
- Nivel medio: "Preparei uma resposta."
- Nivel alto: "Respondi confirmando o horario, como voce costuma fazer."

### 6.2 Agenda E Tempo

Capacidades:

- Identificar conflitos.
- Defender blocos de foco.
- Reorganizar semana.
- Sugerir horarios com base em energia.
- Preparar materiais antes de reunioes.
- Criar buffer entre compromissos.

Sinal proativo:

- "Sua quarta-feira ficou com 7 horas de reuniao. Movi dois blocos flexiveis para quinta e deixei o treino preservado. Quer aprovar?"

### 6.3 Financas

Capacidades:

- Monitorar gastos fora do padrao.
- Alertar vencimentos.
- Projetar fluxo de caixa pessoal.
- Detectar assinaturas esquecidas.
- Pesquisar melhores opcoes antes de compras.

Limites:

- Nenhum pagamento ou transferencia sem politica explicita.
- Acoes financeiras devem ter logs reforcados.
- Recomendacoes financeiras devem ser tratadas como suporte organizacional, nao aconselhamento profissional.

### 6.4 Saude, Sono E Habitos

Capacidades:

- Correlacionar sono, agenda, humor e produtividade.
- Sugerir ajustes de rotina.
- Proteger horarios de descanso.
- Detectar queda de habitos importantes.
- Preparar check-ins.

Tom:

- Sem moralismo.
- Sem diagnostico medico.
- Foco em padroes e suporte.

### 6.5 Foco E Trabalho Profundo

Capacidades:

- Bloquear interrupcoes.
- Agrupar mensagens.
- Preparar ambiente de foco.
- Transformar objetivos em sessoes.
- Retomar contexto de projetos.

Exemplo:

- "Voce tem 90 minutos livres. O melhor uso, pelo seu prazo de sexta, e continuar o documento de estrategia. Ja abri os materiais relevantes."

### 6.6 Carreira E Aprendizado

Capacidades:

- Mapear objetivos profissionais.
- Recomendar estudos com base em lacunas reais.
- Preparar portfolio e conteudo.
- Acompanhar vagas, oportunidades e networking.
- Revisar comunicacoes importantes.

### 6.7 Criacao De Conteudo

Capacidades:

- Capturar ideias soltas.
- Manter banco de temas.
- Transformar notas em posts, roteiros ou artigos.
- Aprender voz autoral.
- Sugerir publicacoes no momento certo.

### 6.8 Viagens

Capacidades:

- Monitorar passagens e hoteis.
- Preparar itinerarios.
- Checar documentos.
- Reorganizar agenda ao redor da viagem.
- Antecipar deslocamentos, clima, fuso e imprevistos.

### 6.9 Relacionamentos

Capacidades:

- Lembrar datas importantes.
- Sugerir mensagens pessoais.
- Detectar relacoes que o usuario quer cultivar.
- Ajudar a manter contato sem parecer artificial.

Regra essencial:

- ARIA deve apoiar intencoes reais do usuario, nao automatizar afeto de forma enganosa.

## 7. Experiencia Do Usuario

### 7.1 Superficies

ARIA nao deve viver em uma unica tela.

Superficies principais:

- App mobile: centro de controle, permissoes, memoria, notificacoes.
- Desktop command center: trabalho profundo, arquivos, agenda, execucao.
- Widget de contexto: presenca pequena sempre disponivel.
- Voz: interacoes rapidas e naturais.
- Inbox ARIA: fila de decisoes, aprovacoes e resumos.
- Daily Brief: resumo inteligente do dia.
- Night Reflection: fechamento do dia e ajustes para amanha.

### 7.2 Tela Principal

A primeira tela nao deve ser um chat. Deve ser um painel vivo:

- Agora: o que esta acontecendo.
- Proximas horas: riscos, preparos e oportunidades.
- Decisoes pendentes: aprovar, editar, negar.
- Memorias novas: fatos que ARIA quer guardar.
- Objetivos ativos: progresso real.
- Autonomias concedidas: o que ARIA pode fazer sozinha.

O chat existe, mas como uma das superficies, nao como o produto inteiro.

Regra de produto: a tela principal tambem nao pode ser um dashboard decorativo. Cada elemento visivel deve responder a uma pergunta operacional:

- O que ARIA esta tentando resolver agora?
- Qual e a proxima acao?
- O que ja foi executado?
- O que esta bloqueado por permissao, conector ou risco?
- O que o usuario precisa decidir?
- Que memoria ou regra foi aprendida?

Se um card nao leva a decisao, execucao, memoria ou progresso, ele deve sair da tela principal.

### 7.2.1 Abertura Proativa

A tela inicial do ARIA deve nascer de uma fala, nao de um formulario. Ao abrir o app, o backend monta o contexto atual e chama a Claude API para gerar:

- Uma saudacao personalizada.
- Uma linha de monitoramento em tempo real.
- Duas ou tres acoes prontas para aprovacao.
- Texto ja preparado para cada acao.
- Risco e tipo de confirmacao.

Input manual e secundario. A primeira experiencia deve responder: "o que ARIA ja esta fazendo por mim agora?"

No MVP, o contexto pode ser simulado, mas precisa ser concreto:

- Email do Joao sobre prazo do projeto.
- Reuniao proxima sem pauta.
- Sono curto.
- Janela de foco que ARIA pode proteger.

O fluxo correto:

```text
abrir app -> montar contexto -> chamar Claude -> ARIA fala -> mostrar acoes prontas -> aprovar/ajustar -> executar simulado -> registrar auditoria
```

### 7.3 Inbox De Decisoes

Toda sugestao acionavel aparece como um card curto:

- Contexto.
- Acao proposta.
- Evidencia.
- Risco.
- Botoes: aprovar, editar, negar, nunca fazer isso, fazer sempre assim.

Exemplo:

```text
Email sem resposta: Mariana, proposta comercial
ARIA percebeu que voce costuma responder propostas em ate 24h. Ja se passaram 46h.

Acao proposta:
Enviar resposta pedindo mais detalhes e sugerindo uma chamada quinta.

[Aprovar] [Editar] [Agora nao] [Sempre fazer assim]
```

### 7.4 Briefing Diario

Formato:

- O que exige atencao.
- O que ARIA ja preparou.
- O que pode dar errado.
- Uma recomendacao principal.
- Um detalhe humano: energia, humor ou conquista recente.

Exemplo:

```text
Bom dia. Hoje o ponto critico e a reuniao das 14h: voce ainda nao revisou o documento.
Eu separei os tres trechos mais importantes e bloqueei 25 minutos as 11h.
Sua agenda esta pesada depois das 16h, entao deixei tarefas criativas para amanha.
```

## 8. Personalidade

ARIA deve ter personalidade consistente:

- Inteligente sem exibicionismo.
- Proativa sem ser invasiva.
- Calma em crise.
- Direta quando o usuario esta ocupado.
- Calorosa quando ha conquista, frustracao ou cansaco.
- Capaz de humor leve, mas nunca deslocado.

Dimensoes ajustaveis:

- Formalidade.
- Energia.
- Nivel de detalhe.
- Frequencia de proatividade.
- Grau de incentivo emocional.
- Estilo de cobranca.

Estados de tom:

- Executivo: curto, objetivo, orientado a decisao.
- Companheiro: mais humano, encorajador, contextual.
- Guardiao: firme em riscos, prazos, saude e limites.
- Silencioso: quase invisivel, resume em lotes.

## 9. Onboarding

O onboarding deve criar confianca rapidamente sem exigir configuracao exaustiva.

### Etapa 1: Pacto Inicial

ARIA explica:

- O que pode observar.
- O que nunca fara sem permissao.
- Como a memoria funciona.
- Como editar ou apagar qualquer coisa.
- Como a autonomia cresce.

### Etapa 2: Mapa De Vida

Perguntas essenciais:

- Quem e voce hoje?
- Quais sao seus tres objetivos mais importantes?
- O que esta consumindo sua energia?
- Que areas voce quer que ARIA ajude primeiro?
- Em que areas ARIA deve ser cautelosa?
- Que tipo de tom voce prefere?

### Etapa 3: Conexoes

Conectar de forma incremental:

1. Agenda.
2. Email.
3. Notas/arquivos.
4. Tarefas.
5. Saude.
6. Financas.
7. Mensagens.

Cada conexao deve mostrar exemplos concretos de valor antes de pedir mais acesso.

### Etapa 4: Primeira Semana Assistida

ARIA opera em modo sugestao/preparacao:

- Resume o dia.
- Detecta 3 a 5 oportunidades.
- Pede aprovacao para acoes pequenas.
- Aprende com correcoes.
- Mostra memorias novas antes de salvar.

### Etapa 5: Primeiras Autonomias

Depois de padroes consistentes:

- "Voce aprovou esse tipo de reagendamento 6 vezes. Posso fazer sozinho quando envolver reunioes internas de baixa prioridade?"

## 10. Como ARIA Aprende

ARIA usa tres tipos de aprendizado.

### 10.1 Aprendizado Explicito

O usuario diz:

- "Guarde isso."
- "Nao faca mais assim."
- "Sempre responda nesse tom."
- "Esse tipo de reuniao e importante."

### 10.2 Aprendizado Implicito

ARIA observa:

- O usuario sempre edita a saudacao.
- Sempre rejeita notificacoes de certo tipo.
- Sempre aceita reagendamentos parecidos.
- Responde melhor em certos horarios.

### 10.3 Aprendizado Reflexivo

ARIA revisa eventos:

- O que eu previ?
- O que aconteceu?
- Minha acao ajudou?
- Devo atualizar uma memoria, regra ou preferencia?

Importante: inferencias devem ser tratadas como hipoteses ate haver evidencia suficiente.

## 11. Como ARIA Age

Fluxo padrao:

1. Detectar sinal.
2. Enriquecer com contexto.
3. Comparar com memoria e objetivos.
4. Calcular prioridade e risco.
5. Escolher nivel de autonomia permitido.
6. Planejar acao.
7. Pedir aprovacao, preparar ou executar.
8. Registrar resultado.
9. Aprender com feedback.

Exemplo completo:

```text
Sinal:
Email de cliente importante sem resposta ha 36 horas.

Contexto:
Cliente esta ligado a projeto ativo. Usuario tem reuniao com ele em 2 dias.

Prioridade:
Alta.

Autonomia:
ARIA pode preparar respostas, mas nao enviar emails externos sem confirmacao.

Acao:
Rascunha resposta, sugere dois horarios, anexa documento relevante.

Feedback:
Usuario edita o tom para mais informal.

Aprendizado:
Atualizar preferencia de tom para esse cliente.
```

## 12. Modelo Tecnico Inicial

### 12.1 Servicos

- `identity-service`: perfil, preferencias e limites.
- `memory-service`: memoria vetorial e relacional.
- `event-ingestion-service`: conectores e normalizacao.
- `context-service`: enriquecimento e deteccao de padroes.
- `priority-service`: scoring de urgencia, impacto e interrupcao.
- `planner-service`: decomposicao e plano de acoes.
- `permission-service`: politicas de autonomia.
- `action-runtime`: execucao de ferramentas.
- `audit-service`: logs, evidencias e recuperacao.
- `notification-service`: roteamento de comunicacao.
- `ui-api`: API para apps e superficies.

### 12.2 Armazenamento

- Relacional: usuarios, permissoes, eventos, tarefas, acoes, logs.
- Vetorial: memorias semanticas, notas, documentos, historico resumido.
- Grafo: pessoas, projetos, compromissos, dependencias.
- Time-series: sono, habitos, energia, eventos recorrentes.
- Object storage: anexos, documentos processados, snapshots.

### 12.3 Entidades Principais

```text
User
ARIAProfile
Memory
Goal
Relationship
Signal
Event
Opportunity
Task
Plan
Action
PermissionPolicy
AutonomyGrant
AuditLog
Feedback
```

### 12.4 Politica De Risco

Dimensoes:

- Reversibilidade.
- Sensibilidade.
- Impacto financeiro.
- Impacto social.
- Impacto profissional.
- Confianca da inferencia.
- Historico de aprovacoes.

Acoes de alto risco exigem confirmacao, mesmo com autonomia elevada.

## 13. Privacidade, Seguranca E Confianca

Requisitos inegociaveis:

- Memoria editavel e apagavel.
- Explicacao de por que ARIA sabe algo.
- Logs de toda acao.
- Permissoes granulares.
- Modo privado temporario.
- Criptografia em repouso e em transito.
- Separacao entre dados pessoais e telemetria de produto.
- Nenhum treinamento global com dados pessoais sem consentimento explicito.
- Exportacao de dados.
- Botao de pausa total.

## 14. MVP Ambicioso Mas Realista

O primeiro MVP deve provar antecipacao e execucao, nao cobrir todos os dominios.

Escopo recomendado:

1. Agenda.
2. Email.
3. Memoria pessoal.
4. Objetivos.
5. Inbox de decisoes.
6. Autonomia niveis 0 a 3.

Funcionalidades:

- Daily Brief.
- Deteccao de emails importantes sem resposta.
- Preparacao de respostas.
- Reorganizacao sugerida da agenda.
- Captura e revisao de memorias.
- Blocos de foco automaticos com aprovacao.
- Aprendizado de preferencias basicas.
- Logs de acoes.

## 15. Roadmap

### Fase 1: Fundacao

- Perfil do usuario.
- Memoria persistente.
- UI de chat + painel.
- Conexao com agenda.
- Conexao com email.
- Logs e permissoes.

### Fase 2: Proatividade

- Motor de eventos.
- Briefing diario.
- Inbox de decisoes.
- Deteccao de conflitos e pendencias.
- Rascunhos e planos.

### Fase 3: Execucao

- Action runtime.
- Envio de emails com aprovacao.
- Criacao e edicao de eventos.
- Reagendamentos.
- Templates de autonomia.

### Fase 4: Aprendizado

- Reflexao automatica.
- Memorias inferidas.
- Preferencias por pessoa/projeto.
- Evolucao de autonomia por padrao.

### Fase 5: Expansao De Vida

- Saude e sono.
- Financas.
- Viagens.
- Conteudo.
- Relacionamentos.
- Automacoes cross-domain.

## 16. Diferenca Contra Produtos Existentes

ARIA vence quando:

- Detecta antes do usuario pedir.
- Executa tarefas reais.
- Lembra com continuidade.
- Explica suas acoes.
- Aprende o modo de vida do usuario.
- Opera com autonomia graduada.
- Une dominios que hoje ficam separados.

Nao basta ser "ChatGPT com calendario". O produto precisa ter um loop continuo:

```text
observar -> entender -> priorizar -> agir -> registrar -> aprender
```

## 17. Norte De Produto

A pergunta diaria para avaliar o ARIA:

> O usuario terminou o dia com menos carga mental, menos pontas soltas e mais progresso real?

Se a resposta for sim, ARIA esta cumprindo sua promessa.
