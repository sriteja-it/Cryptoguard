# Dark Mode PQC Dashboard

A small dashboard and scanner demonstrating post-quantum cryptography (PQC) readiness analysis and scan history management. This repo contains a Node/Express backend (scan engine, risk scoring, MongoDB store) and a React + Vite frontend for administration and viewing scan results.

## Features

- Scan TLS/certificate endpoints and compute an explainable risk score (classical vs quantum urgency).
- Default API key quota is set to 5 (migration applied at startup) and shown in the UI.
- Per-scan and bulk delete of scan history via admin UI.
- Admin API no longer returns plaintext API keys; keys are referenced by `keyId` and `keyFingerprint`.
- Tunable risk engine with environment variables for weights and thresholds.

## Repo Structure

- `backend/` — Express server, MongoDB store, risk engine, and test scripts.
- `src/` — React + Vite frontend application (pages, components, UI primitives).
- `styles/` — CSS, Tailwind setup, and fonts.

Key backend files:

- `backend/server.js` — API endpoints and admin routes.
- `backend/mongoStore.js` — MongoDB helpers (api_keys, scan_history).
- `backend/riskEngine.js` — Explainable risk scoring implementation.
- `backend/test-risk.js` — Unit-like checks for risk engine behavior.
- `backend/test-integration.js` — Integration tests for DB quota and delete flows.



## Notes

- On startup the backend applies a migration that sets a default quota of `5` to api keys that had no quota, so the UI will show the limit instead of "No limit".
- The risk engine returns a `vulnerabilityScore` (0-100), `riskLevel`, and a `breakdown` explaining classical strength, quantum urgency, TLS and expiry penalties.
- ## About Post-Quantum Cryptography (PQC)

Post-Quantum Cryptography (PQC) refers to cryptographic algorithms—executed on classical hardware—that are mathematically secure against attacks from both classical and quantum computers. 

### Why PQC Matters
Most modern digital security relies on public-key cryptography (like RSA and ECC) to protect data in transit and at rest. However, a sufficiently powerful quantum computer running **Shor’s Algorithm** will be capable of breaking these mathematical foundations, completely compromising global digital trust. 

Furthermore, the threat of **"Harvest Now, Decrypt Later"** means adversaries are capturing encrypted traffic today to decrypt it once quantum hardware matures. Implementing PQC now mitigates this immediate risk.

### Core Approaches Included in this Project
This implementation utilizes industry-standard, quantum-resistant mathematical frameworks, focusing primarily on:
* **Lattice-Based Cryptography:** Leveraging hard geometric problems in high-dimensional vector spaces (e.g., ML-KEM/Kyber for encryption, ML-DSA/Dilithium for digital signatures).
* **Hash-Based Signatures:** Relying on the inherent security of cryptographic hash functions for immutable digital signatures (e.g., LMS, XMSS, SPHINCS+).

### Standards Alignment
Our implementations align with the finalized standards established by the National Institute of Standards and Technology (NIST) Federal Information Processing Standards (FIPS).
