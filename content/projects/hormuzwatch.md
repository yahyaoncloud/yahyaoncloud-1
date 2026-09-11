---
title: "HormuzWatch — Multi-Domain Maritime Intelligence & Threat Observability Platform"
slug: "hormuzwatch"
summary: "Course Thesis: Autonomous real-time maritime domain awareness and anomaly detection across contested Gulf chokepoints using Go streaming pipelines, circular manifold feature engineering, and ROCm-accelerated ensemble machine learning."
period: "2024 - 2026"
role: "Architect / Full-stack Developer"
category: "AI & Observability"
coverImage: "/images/projects/hormuzwatch-app.png"
thumbnail: "/images/projects/hormuzwatch-app.png"
techStack:
  - Go
  - Python
  - PyTorch
  - XGBoost
  - React
  - TypeScript
  - PostgreSQL
  - Terraform
  - Azure
demoUrl: "https://hormuzwatch.aburcloud.com"
githubUrl: "https://github.com/yahyaoncloud/hormuzwatch"
featured: true
order: 1
---

## Abstract

The Strait of Hormuz represents one of the world's most critical and vulnerable maritime transit chokepoints, handling roughly 21 million barrels of crude oil daily. Monitoring navigation safety, sanctions compliance, and security anomalies in this contested region is fundamentally complicated by asymmetric naval activity, intentional Automatic Identification System (AIS) transponder manipulation ("dark vessels"), and widespread Global Navigation Satellite System (GNSS) spoofing. 

This engineering thesis presents **HormuzWatch**, an end-to-end, multi-domain geospatial intelligence platform designed for high-concurrency maritime surveillance and probabilistic anomaly detection. The architecture integrates a concurrent Go telemetry ingestion engine processing live streaming AIS and OpenSky feeds, an automated 16-source Open-Source Intelligence (OSINT) natural language pipeline, a circular manifold kinematic feature engineering framework, and a ROCm-accelerated Python machine learning microservice deploying an ensemble of Isolation Forest, Local Outlier Factor (LOF), and calibrated XGBoost classifiers. Across empirical benchmarks, the platform demonstrates sustained throughput exceeding 15,000 messages per second with sub-25ms end-to-end pipeline latency and an anomaly detection AUC-ROC of 0.942.

---

## 1. Problem Formulation & Operational Threat Environment

Maritime Domain Awareness (MDA) in the Persian Gulf and Gulf of Oman faces distinct tactical and technical failure modes:

1. **Kinematic Manipulation & Dark Target Evasion**: Vessels engaged in illicit transshipments deliberately deactivate Class A/B AIS transponders or intermittently beacon coordinates to obfuscate transshipment points and territorial incursions.
2. **GNSS / AIS Spoofing**: Commercial and naval entities operating in the Gulf experience severe GPS coordinate hopping, circle-spoofing attacks, and phantom transponder emissions.
3. **Information Asymmetry in Multi-Source Reporting**: Tactical alerts reported across regional agencies (e.g., WAM, SPA, IRNA, UKMTO, USNI News) exist in unstructured, polyglot textual silos disconnected from real-time coordinate coordinates.
4. **Scale & Stream Contention**: Raw global AIS streams deliver hundreds of thousands of raw NMEA sentences per minute, demanding zero-allocation stream demultiplexing and high-efficiency spatial indexing.

```mermaid
flowchart TD
    subgraph Data Sources
        AIS[Live AIS Stream / Kystverket / Satellite]
        Sky[OpenSky Aviation Telemetry]
        News[16 Regional OSINT RSS Feeds]
    end

    subgraph Go Ingestion & Dispatch Engine
        Kinematic[Unified Kinematic Ingestor]
        NLP[OSINT State Machine]
        EventBus[Azure Event Hubs & In-Memory Ring Buffer]
    end

    subgraph ML Inference Engine
        Feat[Circular Manifold Feature Extractor]
        Ensemble[Ensemble: Isolation Forest + LOF + XGBoost]
        Calib[Isotonic Probability Calibration]
    end

    subgraph Visualization & Tactical Client
        WS[WebSocket Dispatcher]
        UI[React 19 + Leaflet Tactical Map]
    end

    AIS --> Kinematic
    Sky --> Kinematic
    News --> NLP
    Kinematic --> EventBus
    NLP --> EventBus
    EventBus --> Feat
    Feat --> Ensemble
    Ensemble --> Calib
    Calib --> WS
    EventBus --> WS
    WS --> UI
```

---

## 2. Distributed Architecture & Streaming Pipeline

The HormuzWatch architecture enforces strict separation between high-throughput concurrent I/O operations and compute-intensive scientific inference:

### 2.1 Concurrent Go Ingestion Kernel
The core ingestion tier is written in Go 1.23, leveraging goroutine worker pools and non-blocking channel architectures:
- **Zero-Allocation Stream Demultiplexing**: Custom NMEA sentence parsers unpack Type 1, 2, 3 (Position Reports), Type 4 (Base Station Reports), and Type 5 (Static and Voyage Data) packets directly into pre-allocated memory arenas.
- **Geohash & Spatial Quadtree Indexing**: Coordinate points are partitioned into hierarchical bounding boxes centered over the Strait of Hormuz ($24.0^\circ\text{N} - 28.0^\circ\text{N}$, $54.0^\circ\text{E} - 58.5^\circ\text{E}$), enabling $O(1)$ localized spatial queries.
- **OSINT Pipeline State Machine**: An automated 7-stage state machine (`QUEUED` $\rightarrow$ `FETCHED` $\rightarrow$ `NORMALIZED` $\rightarrow$ `NER_EXTRACTED` $\rightarrow$ `GEOCODED` $\rightarrow$ `SCORED` $\rightarrow$ `DISPATCHED`) ingests articles from 16 regional government and maritime security feeds.

### 2.2 Python ROCm Machine Learning Microservice
Compute-bound model training and real-time tensor transformations are decoupled into a dedicated Python 3.11 service communicating over gRPC:
- **AMD ROCm Hardware Acceleration**: Accelerated matrix math and tree tensor evaluations executed on AMD ROCm compute instances.
- **Unified Proto Contract**: Standardized vector definitions allow vessel telemetry, aircraft flight vectors, and geocoded news entities to be evaluated across an identical inference interface.

---

## 3. Kinematic Feature Engineering on the Circular Manifold

Standard Euclidean distance metrics fail when applied directly to angular navigational properties. A vessel altering course from $358^\circ$ to $002^\circ$ has undergone a delta of $4^\circ$, whereas standard linear math yields an erroneous $|358 - 2| = 356^\circ$.

HormuzWatch projects angular directional components onto a 2-dimensional continuous unit circle:

$$\sin(\theta) = \sin\left(\frac{COG \cdot \pi}{180}\right), \quad \cos(\theta) = \cos\left(\frac{COG \cdot \pi}{180}\right)$$

### 3.1 Derived Kinematic Vector Space
For each vessel trajectory $T = \{p_1, p_2, \dots, p_k\}$, the system computes a dynamic 12-dimensional feature vector $X_t$:

$$X_t = \left[ SOG_t, \; \Delta SOG_t, \; \frac{d(SOG)}{dt}, \; \sin(COG_t), \; \cos(COG_t), \; \Delta COG_t, \; ROT_t, \; \mathcal{D}_{\text{geodesic}}, \; \kappa_{\text{curvature}}, \; \Delta t_{\text{gap}}, \; \rho_{\text{traffic}}, \; \mathcal{S}_{\text{draft\_ratio}} \right]$$

Where:
- $\Delta SOG_t$: Longitudinal velocity acceleration.
- $\mathcal{D}_{\text{geodesic}}$: Great-circle distance between successive timestamps using the Vincenty inverse formula.
- $\Delta t_{\text{gap}}$: Silence metric quantifying the transponder blackout duration.
- $\rho_{\text{traffic}}$: Local vessel density within an 8-nautical-mile radius.

---

## 4. Multi-Domain Anomaly Detection Ensemble

No single unsupervised algorithm effectively captures both point outliers (erratic velocity bursts) and contextual density anomalies (drifting within a recognized separation zone). HormuzWatch constructs a hierarchical ensemble:

```
┌─────────────────────────────────────────────────────────────┐
│                    Kinematic Feature Vector                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
     │  Isolation   │   │ Local Outlier│   │ Extreme Grad │
     │    Forest    │   │ Factor (LOF) │   │ Boost (XGB)  │
     └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
            │                  │                  │
            │                  ▼                  │
            │          ┌──────────────┐           │
            │          │ Fast k-NN    │           │
            │          │ Spatial Tree │           │
            │          └──────┬───────┘           │
            │                 │                   │
            └─────────────────┼───────────────────┘
                              ▼
               ┌──────────────────────────────┐
               │ Isotonic Probability Fitting │
               └──────────────┬───────────────┘
                              ▼
               ┌──────────────────────────────┐
               │ Calibrated Threat Score ∈[0,1│
               └──────────────────────────────┘
```

1. **Isolation Forest ($S_{\text{IF}}$)**: Evaluates the number of recursive random splits $h(x)$ required to isolate sample $x$:
   $$S_{\text{IF}}(x, n) = 2^{-\frac{\mathbb{E}(h(x))}{c(n)}}$$
   Where $c(n)$ is the average path length of unsuccessful searches in a Binary Search Tree.
2. **Local Outlier Factor ($S_{\text{LOF}}$)**: Assesses local reachability density relative to the $k$-nearest vessel neighbors, identifying subtle formation abnormalities in dense traffic lanes.
3. **Calibrated Probability Output**: Raw ensemble decision boundaries are normalized using Isotonic Regression, ensuring that a reported threat score of $0.85$ strictly corresponds to an empirical 85% anomaly probability.

---

## 5. Visualizations & Tactical Map Interface

The tactical interface is built using React 19, Leaflet, and WebSockets to visualize real-time vessel vectors, flight corridors, and geocoded intelligence alerts.

![HormuzWatch Tactical Map Interface](/images/projects/hormuzwatch-tactical-map.png)

### 5.1 Real-Time Intelligence & ML Telemetry Dashboard
The platform incorporates telemetry scatter plots, anomaly score distributions, and real-time alerts:

![HormuzWatch ML Telemetry and Anomaly Charts](/images/projects/hormuzwatch-charts.png)

---

## 6. Empirical Benchmarks & Quantitative Results

Rigorous synthetic and historical replay stress tests were conducted across 4.2 million AIS messages and 18,000 aviation flight records:

| Evaluation Metric | Baseline Rule Engine | Standalone Isolation Forest | HormuzWatch Ensemble |
| :--- | :--- | :--- | :--- |
| **Detection Rate (Recall)** | 62.4% | 81.2% | **94.8%** |
| **Precision** | 54.1% | 76.5% | **89.3%** |
| **False Positive Rate (FPR)** | 18.2% | 6.8% | **2.1%** |
| **Area Under ROC (AUC-ROC)** | 0.718 | 0.865 | **0.942** |
| **Ingestion Latency (p99)** | 142 ms | 38 ms | **24.6 ms** |
| **System Throughput** | 2,400 msg/s | 8,900 msg/s | **15,200 msg/s** |

---

## 7. Infrastructure & Production Deployment

The platform is deployed using modern cloud-native declarative infrastructure:
- **Azure Container Apps**: Microservice container hosting scaled dynamically based on event queue depth.
- **Terraform IaC**: Immutable modular infrastructure across Dev, Staging, and Production environments.
- **Cloudflare Tunnel & Zero Trust**: Secure edge routing without exposing public IP addresses to direct probing.
- **Automated Health Telemetry**: Continuous drift monitoring tracking Wasserstein distance over sliding 24-hour windows, automatically triggering retraining when distribution shifts exceed threshold $\epsilon = 0.05$.

---

## 8. Conclusion & Future Research

HormuzWatch confirms that combining zero-allocation streaming architectures in Go with circular manifold kinematic feature engineering and calibrated ensemble learning dramatically outperforms traditional rule-based coastal radars. Future iterations are focused on synthetic aperture radar (SAR) satellite imagery fusion and localized transformer-based temporal trajectory prediction models.
