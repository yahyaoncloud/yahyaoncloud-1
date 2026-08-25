---
title: "HormuzWatch — Gulf Intelligence Platform"
slug: "hormuzwatch"
summary: "Real-time geospatial surveillance, multi-source news intelligence, and ensemble anomaly detection for strategic maritime regions in the Gulf. Combines AIS vessel tracking, aviation telemetry, and 16-news-source RSS pipeline with ML-powered threat scoring."
period: "2024 - 2026"
role: "Architect / Full-stack Developer"
category: "SaaS, Security, AI/ML, Observability, Infrastructure"
techStack:
  - Go 1.23 (Gin, gRPC, WebSocket, JWT)
  - Python 3.11 (FastAPI, PyTorch ROCm, XGBoost, scikit-learn, CuPy)
  - React 19 + TypeScript + React Router v8 + Tailwind CSS v4 + Leaflet
  - PostgreSQL (Supabase) + Event Hubs
  - Terraform (Azure) + Cloudflare Tunnel + GitHub Actions + systemd
featured: true
order: 1
---

## Executive Summary

HormuzWatch is a unified real-time maritime and aviation surveillance platform paired with a multi-source news intelligence engine for strategic Gulf waterways (Strait of Hormuz, Persian Gulf, Gulf of Oman). It replaces fragmented manual monitoring by combining live AIS vessel feeds, OpenSky aviation telemetry, and an automated 16-source OSINT RSS ingestion pipeline with machine learning anomaly detection and threat scoring.

```mermaid
graph TD
    subgraph Ingestion & Telemetry
        AIS[AISStream / Kystverket] --> Kinematic[Unified Kinematic Pipeline]
        Sky[OpenSky Aviation Feed] --> Kinematic
        News[16 Gulf News Sources RSS/Scraper] --> StateMachine[Article State Machine]
    end

    subgraph Go Backend & Event Streaming
        Kinematic --> GoSvc[Go Ingestion & API Service]
        StateMachine --> GoSvc
        GoSvc --> WS[WebSocket Live Streaming]
        GoSvc --> Hubs[Azure Event Hubs]
    end

    subgraph Python ML Engine
        GoSvc -->|gRPC Structured Vectors| PyML[Python ML ROCm Service]
        PyML --> Models[Ensemble: IsolationForest + LOF + XGBoost]
        Models --> ThreatScore[Threat Scoring & SHAP Calibration]
        ThreatScore -->|Confidence / Inference| GoSvc
    end

    subgraph Frontend & Storage
        WS --> UI[React 19 + Leaflet Dashboard]
        GoSvc --> DB[(Supabase PostgreSQL)]
        UI --> Map[Live Vessels, Aircraft & Geocoded News Overlay]
    end
```

---

## Key Capabilities & Features

1. **Multi-Source News Intelligence Pipeline**: Ingests from 16 pre-configured Gulf and maritime agencies (WAM, SPA, KUNA, IRNA, USNI News, UKMTO, IMO, etc.).
2. **7-Step ML Article Processing Pipeline**:
   $$\text{Clean} \longrightarrow \text{Dedup} \longrightarrow \text{Language Detect} \longrightarrow \text{NER / Entity Extract} \longrightarrow \text{Classify} \longrightarrow \text{Feature Engineering} \longrightarrow \text{Threat Score}$$
3. **Ensemble Anomaly Detection**: IsolationForest + Local Outlier Factor (LOF) + XGBoost running across 4 distinct domains (maritime vessels, aviation kinematics, geospatial heatmaps, and news event clusters).
4. **Unified Kinematic Ingestion**: Streamlined architecture eliminating code duplication across AISStream, OpenSky, Kystverket, and local simulators.
5. **Real-time Live Geospatial Dashboard**: Interactive Leaflet maps streaming real-time vessel/aircraft positions and geocoded intelligence alerts over WebSockets.
6. **State Machine Tracking**: Articles transition reliably through `QUEUED` $\rightarrow$ `SCORED` $\rightarrow$ `GEOCODED` $\rightarrow$ `STORED` $\rightarrow$ `DONE`.
7. **Unified REST API**: 15 endpoints adhering to a consistent `{ data, total }` response schema with role-based JWT access.

---

## Technical Architecture & Implementation

### Go Backend (Ingestion & APIs)
- Built with **Go 1.23**, Gin HTTP framework, and high-performance gRPC contracts.
- Handles external rate limits, kinematic normalization, coordinate projections, article HTML sanitization, and WebSocket connection pooling.

### Python ML Microservice (Inference & Scoring)
- Built with **Python 3.11** & FastAPI utilizing **PyTorch ROCm**, XGBoost, CuPy, and scikit-learn.
- Receives pre-engineered feature vectors via gRPC contracts without requiring protobuf changes across domain additions.

### Infrastructure as Code & Cloud Architecture
- **Terraform (Azure)** modules for Virtual Networks, Azure Container Apps, Event Hubs, Azure AI Services, and Key Vault.
- Fully automated **dev / test / prod** environments with GitHub Actions plan-on-PR workflows and Cloudflare Tunnel zero-trust ingress.
