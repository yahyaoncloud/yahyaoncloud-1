---
title: "Zero-Trust Network Topologies in Hybrid Multi-Cloud Architectures"
slug: "zero-trust-hybrid-multicloud"
authors:
  - "Yahya"
venue: "Technical Research Report & Architecture Whitepaper"
year: "2024"
pdfUrl: "/papers/zero-trust-hybrid-multicloud.pdf"
doi: "10.1145/yoc.2024.01"
tags:
  - Network Infrastructure
  - Hybrid Cloud
  - Zero Trust
  - SDN
abstract: "An analytical investigation into minimizing latency overhead while enforcing cryptographic identity verification and microsegmentation across distributed on-premises and multi-cloud environments. The paper evaluates eBPF kernel-level routing against legacy IPsec overlays in production-grade throughput benchmarks."
featured: true
order: 1
---

## Executive Abstract

Modern enterprise cloud adoption necessitates interconnecting legacy on-premises data centers with dynamic containerized multi-cloud infrastructure. Traditional perimeter-based network models ("castle-and-moat") fail to mitigate lateral attack vectors once the perimeter is breached.

This research paper proposes a hybrid Zero-Trust Network Architecture (ZTNA) model that replaces static IP-based perimeter firewalls with cryptographic identity verification, dynamic Mutual TLS (mTLS), and kernel-level eBPF packet filtering.

---

## Core Findings & Benchmark Summary

1. **Kernel Bypass & Efficiency**: eBPF-based socket-level packet redirection reduces TCP handshaking latency by 28.4% compared to standard userspace sidecar proxies.
2. **Dynamic Identity Binding**: Cryptographic SPIFFE/SPIRE identity tokens bound to ephemeral Kubernetes workloads eliminate reliance on static CIDR whitelist blocks.
3. **Resilience under Network Partitioning**: Decentralized policy enforcement engines on each node ensure that temporary control-plane disconnections do not degrade existing data-plane throughput.

---

## Methodology & Experimental Setup

- **Physical Topologies**: 10Gbps AWS Direct Connect redundant link connected to dual Juniper edge routers.
- **Compute Cluster**: 48-node Kubernetes cluster running Linux kernel 6.6 with Cilium CNI.
- **Traffic Load Testing**: Sustained synthetic loads generated using `wrk2` and `iperf3` measuring throughput, jitter, and p99.9 latency under simulated DDoS and line-rate conditions.
