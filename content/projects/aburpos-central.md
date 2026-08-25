---
title: "AburPOS Central System — Tenant & License Management Platform"
slug: "aburpos-central"
summary: "Cloud-based central management platform for distributed AburPOS tenants. Handles tenant onboarding/provisioning, license generation/validation/renewal with tier-based limits (Small/Medium/Enterprise), and server health monitoring via Kafka event-driven architecture."
period: "2025"
role: "Architect / Backend Developer"
category: "SaaS, Infrastructure, Automation"
techStack:
  - Go 1.24+ (Gin Framework, REST APIs)
  - Apache Kafka 2.8+ (Event-Driven Broker)
  - MongoDB (Tenants & License Storage)
  - Swagger / OpenAPI (API Specifications)
  - Systemd + AWS EC2 Deployment
featured: true
order: 4
---

## Executive Summary

AburPOS Central System is a high-availability cloud control plane designed to manage distributed point-of-sale (POS) deployments across multi-branch enterprise networks. Built with Go 1.24, Apache Kafka, and MongoDB, it centralizes tenant lifecycle orchestration, cryptographic license validation, remote server health monitoring, and asynchronous state synchronization.

```mermaid
graph TD
    subgraph Central Control Plane
        Admin[System Administrator] -->|REST / Swagger UI| CentralAPI[Go 1.24 Central Server]
        CentralAPI --> MongoDB[(MongoDB Central DB)]
        CentralAPI --> Producer[Kafka Event Producer]
        Consumer[Kafka Event Consumer] --> CentralAPI
    end

    subgraph Kafka Event Bus
        Producer -->|Publish| Topics[Topics: tenant.events, license.events, status.updates]
        Topics -->|Subscribe| Consumer
    end

    subgraph Distributed Remote Tenants
        Topics -->|Consume License State| Tenant1[Branch A Remote POS Server]
        Topics -->|Consume License State| Tenant2[Branch B Remote POS Server]
        Tenant1 -->|Heartbeats & Metrics| Consumer
        Tenant2 -->|Heartbeats & Metrics| Consumer
    end
```

---

## Key Features & Capabilities

- **Tenant Lifecycle Provisioning**: Automated onboarding workflows for new tenant accounts, provisioning isolated remote POS instance bindings and tenant status state machines.
- **Tier-Based License Management**:
  - **Small Tier**: 1 branch, up to 5 concurrent cashier/staff users.
  - **Medium Tier**: Up to 5 branches, up to 25 concurrent users.
  - **Enterprise Tier**: Unlimited branches, unrestricted users, priority telemetry streaming.
- **Event-Driven Asynchronous Synchronization**:
  - **Emitted Events**: `tenant.created`, `tenant.status.changed`, `license.updated`, `license.expired`.
  - **Ingested Events**: `server.heartbeat`, `tenant.metrics`, `error.report`.
- **Remote Server Health Telemetry**: Live heartbeat ingestion monitoring remote node uptime, database connectivity, and transaction processing latency.
- **Comprehensive API Documentation**: Fully interactive Swagger/OpenAPI documentation served natively at `/swagger/index.html`.
- **Resilient Cloud Infrastructure**: Systemd unit configuration optimized for production deployment on cost-effective AWS EC2 instances with automatic self-healing.

---

## Technical Highlights

1. **Decoupled Event Architecture**: Implements a hexagonal architectural pattern allowing Kafka event streaming to operate in full cluster mode or transparently fall back to direct synchronization during local development.
2. **Cryptographic License Enforcement**: Digital signatures and periodic heartbeat re-validation preventing unauthorized offline usage or branch quota violations.
3. **Structured JSON Configuration**: Centralized, environment-aware configuration controlling MongoDB connection pools, Kafka cluster broker topics, and JWT signing keys.
