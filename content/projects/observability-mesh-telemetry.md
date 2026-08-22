---
title: "Unified Distributed Observability & Telemetry Mesh"
slug: "observability-mesh-telemetry"
summary: "Engineered high-cardinality distributed tracing, metrics aggregation, and dynamic alerting across 50+ cloud microservices using OpenTelemetry, Prometheus, Grafana, and Loki."
period: "2024"
role: "Cloud DevOps Engineer"
category: "Observability & Site Reliability"
techStack:
  - OpenTelemetry (OTel Collector)
  - Prometheus & Thanos
  - Grafana & Tempo
  - Grafana Loki & Vector
  - Alertmanager & PagerDuty
  - Python & Go Instrumentation
demoUrl: "https://demo.yahyaoncloud.com/telemetry"
githubUrl: "https://github.com/yahyaoncloud/observability-mesh"
coverImage: "/images/projects/observability-cover.webp"
featured: true
order: 3
---

## Executive Summary

As microservices scaled to hundreds of container replicas, troubleshooting cascading latency spikes across asynchronous message brokers and RPC calls became increasingly opaque. This project unified logs, metrics, and distributed traces into a vendor-neutral observability pipeline using the **OpenTelemetry standard**, **Vector log streaming**, and **Grafana / Thanos** distributed storage.

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Client
    participant Gateway as API Gateway
    participant ServiceA as Order Service
    participant ServiceB as Payment Service
    participant OTel as OTel Daemon Collector
    participant Storage as Prometheus & Loki & Tempo

    Client->>Gateway: HTTP POST /checkout (TraceID: a1b2c3)
    Gateway->>ServiceA: gRPC ProcessOrder (Context Propagated)
    ServiceA->>ServiceB: gRPC AuthorizeCharge (TraceID: a1b2c3)
    ServiceB-->>ServiceA: Success (Duration: 24ms)
    ServiceA-->>Gateway: Order Created (Duration: 48ms)
    Gateway-->>Client: 201 Created

    par Async Telemetry Export
        Gateway-->>OTel: Spans & Latency Metrics
        ServiceA-->>OTel: Spans & Structured Logs
        ServiceB-->>OTel: Spans & Structured Logs
    end

    OTel->>Storage: Batch Ingest Spans, Metrics & Logs
```

---

## Technical Highlights

### 1. Vendor-Neutral Telemetry Aggregation
- Deployed daemonset **OpenTelemetry Collectors** on every Kubernetes node with memory-limiter and batch processors to minimize resource footprint (< 50MB RAM per node).
- Enforced strict trace context propagation (`traceparent` header) across all REST, gRPC, and RabbitMQ message payloads.

### 2. High-Efficiency Log Pipeline with Vector
- Streamed structured JSON logs through Vector agents with automatic PII sanitization (redacting tokens, emails, and credentials) prior to ingestion into Grafana Loki.

---

## Results & Operational Improvements

- **MTTD Reduced by 60%**: Cut mean time to detect service degradations from 15 minutes to under 6 minutes.
- **Trace Sampling Optimization**: Saved over $14,000/year in cloud storage costs using tail-based intelligent sampling (capturing 100% of 5xx errors and slow p95 requests, and 5% of healthy 200 OK traffic).
