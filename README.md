# GraphOrder Engine

An agentic orchestration engine built with **LangGraph** and **Gemini** designed to transform unstructured conversational data into validated, production-ready order payloads.

---

## 🚀 Overview

**GraphOrder Engine** is a state-aware AI layer that manages the lifecycle of a customer order. Unlike traditional linear chatbots, this project utilizes a **cyclic graph architecture** to handle the nuances of natural language, allowing the AI to loop back for missing information, validate data against strict schemas, and maintain context across multi-turn sessions.

### Key Technical Highlights:

- **Agentic Orchestration:** Built using **LangGraph** to manage complex state transitions and conditional logic.
- **Schema-Guided Extraction:** Leverages LLM function calling and JSON schemas to ensure 100% data predictability.
- **Stateful Persistence:** Implements checkpointers to maintain conversation "memory" per user thread.
- **Resilient Validation:** A specialized node-based validation logic that identifies missing fields and generates targeted follow-up questions.

---

## 🛠 Architecture & Flow

The engine operates on a directed graph to ensure data integrity:

1.  **Ingestion & Normalization:** Sanitizes raw input and prepares the state.
2.  **Intent Extraction:** The LLM maps natural language to the internal `OrderModel`.
3.  **Cyclic Validation:** \* If the payload is incomplete, the graph routes back to the user for specific missing fields.
    - If the payload is valid, it proceeds to the persistence layer.
4.  **Confirmation & Finalization:** Generates a human-readable summary and manages the transition from `draft` to `confirmed`.

---
