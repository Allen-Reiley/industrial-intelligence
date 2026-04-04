1. Project Mission: AuraWorks Industrial Engine
Domain: B2B Sales Intelligence & Identity Resolution.

Goal: Map anonymous website traffic (IP/Browser) to corporate identities to drive organic B2B leads.

Core Aesthetic: "Quiet Premium"—Minimalist, industrial, authoritative. No "neon" tech tropes.

2. Technical Stack (The "Holy Stack")
Backend: FastAPI (Python 3.12+)

Frontend: Next.js (App Router, TypeScript)

Database: PostgreSQL (with pgvector for future RAG)

Identity: Custom tracking script (vanilla JS) + Identity Resolution logic.

Compliance: POPIA (South Africa) & GDPR. Data must be encrypted at rest.

3. Architecture & Patterns
Backend Logic: Use Pydantic schemas for all request/response models. Logic resides in services/, endpoints in api/.

Frontend Logic: Functional components only. Use Tailwind CSS for the "Quiet Premium" look (Muted slates, high-contrast typography, ample whitespace).

Security: Never log PII (Personally Identifiable Information). Use Argon2 for hashing and AES-256 for sensitive data.

4. Coding "Laws" (Strict Enforcement)
Law 1: Always write clinical, self-documenting code.

Law 2: No external heavy dependencies unless explicitly discussed.

Law 3: All database migrations must be handled via Alembic.

Law 4: When modifying the tracking script, ensure zero-impact on host site performance.

5. Knowledge Context
Refer to docs/api_references.md for identity provider schemas.

Refer to docs/security_manual.md for POPIA encryption standards.