# 🗺️ Roadmap: Autonomous NAO Robot with RAG & Dashboard

To build a fully autonomous NAO robot with a modern web dashboard and a RAG (Retrieval-Augmented Generation) document search console, we can design a modern **Multi-Tiered Agentic Architecture**.

---

## 🏗️ System Architecture

The proposed system utilizes a **three-tier architecture** to separate low-level hardware control, cognitive processing, and visual monitoring:

```mermaid
graph TD
    subgraph 🤖 NAO Hardware Layer
        Nao[NAO Robot] <-->|Telemetry & Controls| Py27[Bridge API: Py 2.7]
    end

    subgraph 🧠 Cognitive Backend Layer (Python 3)
        Py27 <-->|1. HTTP / WebSockets| Py3[AI Orchestrator: Py 3]
        Py3 <-->|2. Offline STT| Whisper[Whisper STT]
        Py3 <-->|3. Structured Query| RAG[RAG Engine: FAISS / Chroma]
        RAG <-->|Local Embeddings| Nomic[Nomic-Embed]
        RAG <-->|Local Documents| Docs[(Document Store: PDF/TXT)]
        Py3 <-->|4. LLM reasoning| LMS[LM Studio / Ollama: Gemma]
    end

    subgraph 💻 Monitoring & Admin Layer
        Web[React + Vite Web App] <-->|Real-Time WebSockets| Py3
        Web -->|Upload Docs| RAG
    end
```

---

## 🚀 Key Milestones & Phases

Here is the strategic execution roadmap divided into 4 clear milestones:

### 🏆 Milestone 1: Telemetry & Status APIs (Backend Extension)
*Objective: Expose robot diagnostics and health metrics from Python 2.7 up to Python 3.*
*   **Bridge Upgrades (`bridge_nao.py`)**:
    *   Implement an endpoint `/telemetry` that polls:
        *   `ALBattery` (battery percentage, charging status).
        *   `ALBodyTemperature` (joint temperatures to monitor overheating).
        *   `ALConnectionManager` (WiFi signal strength).
        *   System logs (a circular buffer of the bridge's printed outputs).
*   **Orchestrator Upgrades (`minimal_ai.py`)**:
    *   Create a background polling thread that pulls this telemetry from the bridge every 2–5 seconds and hosts it on a WebSocket server (`flask-socketio`).

---

### 🏆 Milestone 2: Modern Web Dashboard (Frontend)
*Objective: Build a premium React dashboard to visualize the robot's real-time statistics.*
*   **Tech Stack**: Vite + React + Tailwind CSS + Lucide Icons + Recharts.
*   **Core UI Panels**:
    *   **Telemetry Panel**: Gauges showing battery life, joint temperature warnings, and connection latency.
    *   **HUD Visualizer**: A 3D model representation of the robot showing its current posture (standing, sitting) and face LED states.
    *   **Live Console Log**: A scrolling, auto-updating log window that streams logs directly from the running Python scripts.
    *   **Control Panel**: Manual triggers to make the robot say things, stand up, sit down, or trigger custom gestures.

---

### 🏆 Milestone 3: Local RAG Console Integration (Knowledge Base)
*Objective: Allow the robot to answer questions based on custom uploaded documents (e.g. manuals, textbooks, rules).*
*   **Tech Stack**: `langchain` + `ChromaDB` (or `FAISS`) + local embedding model (e.g. `nomic-embed-text` in LM Studio).
*   **Web Console**:
    *   A drag-and-drop document upload interface on the React dashboard.
    *   Backend endpoint (`/upload`) in Python 3 that ingests PDFs or TXT files, splits them into semantic chunks, and creates vector embeddings locally.
*   **Cognitive Loop Update**:
    *   When the user speaks to NAO, the AI Brain will first perform a similarity search in the Vector Database.
    *   It will pull relevant excerpts and feed them to Gemma as context (e.g., *"Use this documentation context to answer the user's question..."*).

---

### 🏆 Milestone 4: True Autonomy (Proactive Agent Loop)
*Objective: Transition the robot from a reactive "question-response" loop to an active autonomous explorer.*
*   **Proactive Listening**:
    *   Move from a static 4-second record loop to an **ALSoundDetection** triggers. NAO qi detects a voice, triggers recording, pauses when you stop speaking, and feeds it to Whisper.
*   **Active Decision Loop**:
    *   Implement a state machine or agent router:
        *   NAO periodically scans its surroundings.
        *   If the battery is low, it autonomously requests a charger or sits down to conserve energy.
        *   It can walk around and proactively strike up conversations based on environmental sensors or visual detections.

---

## 🛠️ Recommended Tech Stack Summary

*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion (for sleek micro-animations), Recharts (for beautiful metrics graphs), Socket.io-client.
*   **Backend**: Python 3.10+, Flask-SocketIO (for real-time server pushing), LangChain/LlamaIndex (for RAG orchestration), ChromaDB (lightweight local vector database).
*   **Hardware Bridge**: Existing Python 2.7 Flask Bridge (running on port 5001).
*   **Inference**: LM Studio (running Gemma-4 for LLM and Nomic-Embed for RAG).
