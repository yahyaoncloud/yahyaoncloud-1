---
title: "RaweeGo — Pocket Narrator / Document-to-Audio Platform"
slug: "raweego"
summary: "Cross-platform document-to-audio platform with a Flutter mobile app, Rust native core engine, Go backend REST API, Python Piper TTS microservice, and React marketing website. End-to-end flow: mobile app inspects documents via Rust FFI → uploads to Go server → Go orchestrates Python TTS → audio streamed back to mobile for playback."
period: "2024 - 2025"
role: "Architect / Full-stack Developer"
category: "SaaS, Developer Tool, AI/ML, Mobile, Automation"
techStack:
  - Flutter (Riverpod, just_audio, audio_service)
  - Rust (raweego_core crate / FFI)
  - Go 1.22 (Standard Library HTTP & Audio Streaming)
  - Python (FastAPI, Piper Neural TTS)
  - React 19 + Vite + React Router v8 + Three.js + Framer Motion
featured: true
order: 2
---

## Executive Summary

RaweeGo is an end-to-end, privacy-respecting document-to-audio platform engineered as a clean monorepo across five isolated domains. It enables mobile users to convert documents into natural, neural-synthesized audio streams locally and efficiently without proprietary cloud speech lock-in.

```mermaid
sequenceDiagram
    autonumber
    actor User as Mobile User
    participant Flutter as Flutter App
    participant Rust as Rust Native Engine (FFI)
    participant Go as Go Backend Server
    participant TTS as Python Piper TTS Service

    User->>Flutter: Select Document (PDF/EPUB/TXT)
    Flutter->>Rust: Inspect & Validate Structure (FFI)
    Rust-->>Flutter: Extraction Result & Metadata
    Flutter->>Go: POST /api/v1/documents (Upload)
    Go->>Go: Text Normalization & Sentence Segmentation
    Go->>TTS: POST /v1/synthesize (Batch Sentences)
    TTS-->>Go: 22.05 kHz WAV Audio Buffers
    Go-->>Flutter: Processing Completed (Document ID)
    Flutter->>Go: GET /api/v1/audio/{docId}/{sentenceId}
    Go-->>Flutter: Audio Stream (just_audio / audio_service)
    Flutter-->>User: Seamless Background Playback
```

---

## Monorepo Architecture

The project is structured into five strictly isolated domains to prevent cross-domain pollution:

| Domain | Tech Stack | Role & Responsibility |
|---|---|---|
| `mobile/` | Flutter, Riverpod, `audio_service` | Cross-platform client UI, background playback, state management |
| `native/` | Rust (`raweego_core` crate) | High-speed local document parsing and FFI bridge for mobile |
| `server/` | Go 1.22 (std HTTP, gorilla) | REST API, document ingestion, audio chunking & streaming |
| `tts-service/` | Python, FastAPI, Piper TTS | Neural on-device/local text-to-speech synthesis (22.05 kHz WAV) |
| `website/` | React 19, Vite, Three.js | Interactive marketing portal with WebGL particle visualizers |

---

## Key Features & Highlights

- **Local Neural Speech Synthesis**: Fast, natural speech synthesis powered by Piper TTS microservice running at 22.05 kHz sample rate.
- **Native Document Inspection**: Rust-based core engine embedded directly into mobile builds via FFI for instant metadata extraction and validation.
- **Granular Sentence-by-Sentence Streaming**: HTTP range and chunk-based streaming endpoints enabling instantaneous playback before complete document synthesis finishes.
- **Background Playback & Lock Screen Controls**: Full native mobile integration utilizing `just_audio` and `audio_service` with playlist queuing and speed controls.
- **Integrated Test Harness**: Complete end-to-end vertical slice test suite verifying document ingestion, chunking, TTS synthesis, and audio streaming.
