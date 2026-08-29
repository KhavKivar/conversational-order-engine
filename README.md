# Conversational Order Engine

An agentic orchestration engine built with LangGraph and Gemini. It transforms unstructured conversations into validated order actions and coordinates customer, catalog, and order APIs.

## Highlights

- LangGraph orchestration with conditional state transitions
- Schema-guided extraction and payload validation
- Thread-scoped conversation memory
- Intent nodes for pricing, registration, ordering, cancellation, and lookup
- REST integrations isolated behind typed API modules
- Vitest coverage for graph and schema behavior

## Architecture

```text
Incoming message -> intent classifier -> domain node -> API operation
                         ^                    |
                         |-- clarification ---|
```

Graph nodes live under `src/ai/intents/nodes`; external API clients are grouped under `src/api`.

## Getting started

Requirements: Node.js 20+ and a compatible order-management API.

```bash
npm install
cp .env.example .env
npm test
npm start
```

WhatsApp pairing state is written to `auth/` and is excluded from Git. Never commit model keys, API bearer tokens, or conversation logs.
