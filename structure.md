industrial-intelligence/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   │   ├── v1/
│   │   │   │   ├── track.py      # Receives pings from Tracker.js
│   │   │   │   ├── clients.py    # Admin routes for managing clients
│   │   │   │   └── leads.py      # Fetching lead data for dashboards
│   │   ├── core/           # Configuration & Security
│   │   │   ├── config.py         # Env vars & API keys
│   │   │   └── security.py       # Encryption logic for IPinfo keys
│   │   ├── models/         # SQLModel Database Schemas
│   │   │   ├── client.py         # Client Profile schema
│   │   │   ├── visit.py          # Visit/Session schema
│   │   │   └── pageview.py       # Duration/Path schema
│   │   ├── services/       # Business Logic (The "Blue Box")
│   │   │   ├── enrichment.py     # IPinfo API integration
│   │   │   └── reports.py        # PDF Generation logic (Generator.py)
│   │   ├── db.py           # Neon Postgres connection
│   │   └── main.py         # FastAPI Entry point
│   ├── tests/              # Pytest suite
│   └── requirements.txt
│
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/            # App Router (Pages)
│   │   │   ├── (auth)/     # Login/Signup pages
│   │   │   ├── admin/      # Your Internal Dashboard
│   │   │   ├── dashboard/  # Client-facing Dashboard (Magic link access)
│   │   │   └── apply/      # Form A & Form B (The Lead Funnel)
│   │   ├── components/     # UI Library (Shadcn/UI)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # API fetching & Utils
│   └── package.json
│
├── tracker/                # The Client-Side Script
│   ├── src/
│   │   └── index.js        # Minified Tracker.js (Served via CDN/S3)
│   └── package.json
│
├── docker-compose.yml      # For local development
└── .env                    # Root environment variables