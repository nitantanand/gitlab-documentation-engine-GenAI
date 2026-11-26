# GitLab AI Content & Documentation Engine

> **AI-assisted, source-grounded documentation generation with human review and controlled publishing.**<br>
🚀 [View Live Application](https://gitlab-ai-docs-engine.vercel.app/login)


A full-stack AI documentation platform that transforms release notes, technical documents, API specifications, engineering updates, and uploaded files into structured, review-ready documentation.

The platform combines document ingestion, source/context normalization, a multi-stage AI workflow, human review, role-based access control, version history, quality checks, and controlled publishing.

---

## 🎥 Project Video Recording

**▶️ [Watch the project video](https://drive.google.com/file/d/1idNtXTCn-h6fHTcCuYR-jFWjjRTIxd_3/view?usp=sharing)**

## 📦 Project Artifacts

| Artifact | Link |
|---|---|
| 🎥 Project video recording | [Watch the video](https://drive.google.com/file/d/1idNtXTCn-h6fHTcCuYR-jFWjjRTIxd_3/view?usp=sharing) |
| 🌐 Live application (Vercel) | https://gitlab-ai-docs-engine.vercel.app/login |
| ⚙️ Backend API (Render) | https://content-engine-backend-7hal.onrender.com |
| 📘 Swagger API docs | https://content-engine-backend-7hal.onrender.com/docs |
| 🧾 OpenAPI specification | https://content-engine-backend-7hal.onrender.com/openapi.json |
| ❤️ Health check (database) | https://content-engine-backend-7hal.onrender.com/health/ready |
| 📊 Presentation (PowerPoint) | [docs/presentation/GitLab_AI_Documentation_Engine.pptx](docs/presentation/GitLab_AI_Documentation_Engine.pptx) |
| 📐 Architecture notes | [docs/architecture.md](docs/architecture.md) |
| 🔄 Workflow states | [docs/workflow_states.md](docs/workflow_states.md) |

> The backend runs on Render's free plan and sleeps after ~15 minutes of inactivity. If the app is slow to respond, open the health check link once and wait about a minute.

### Frontend Application

https://gitlab-ai-docs-engine.vercel.app/login

###  Backend API

https://content-engine-backend-7hal.onrender.com

###  FastAPI Swagger Documentation

https://content-engine-backend-7hal.onrender.com/docs

### OpenAPI Specification

https://content-engine-backend-7hal.onrender.com/openapi.json

**Deployment**

- Frontend: Vercel
- Backend: Render
- API: FastAPI
- Authentication: Firebase Authentication
- Database: SQLite locally / PostgreSQL (Render Postgres) in production
- AI model: Google Gemini (`gemini-flash-latest`) via an OpenAI-compatible endpoint

---

#  Overview

The GitLab AI Content & Documentation Engine is designed to automate technical documentation generation while keeping humans in control of the final output.

Instead of directly sending raw project information to an AI model, the system processes uploaded source material, extracts relevant context, generates documentation through specialized stages, performs technical review, optimizes the tone, and finally sends the result through a human approval workflow.

### High Level Flow


<img width="1312" height="1199" alt="image" src="https://github.com/user-attachments/assets/d72f9415-325a-4f2c-b655-b102275fcac0" />





---

# Business Problem & Product Goal

## Business problem

Engineering and product teams ship changes every week, and each release needs release notes, API documentation, onboarding guides and internal updates. Today this is written by hand, which is:

- **Slow:** engineers spend hours turning raw notes and specs into readable documents.
- **Error-prone:** facts are copied wrongly, changes are missed and claims drift from what actually shipped.
- **Untraceable:** there is no record of where a statement came from, who reviewed it or who approved it.
- **Risky with plain AI:** a single-prompt chatbot can hallucinate, so its output cannot be published without checks.

**Business function:** internal productivity and developer documentation (technical writing, release communication, developer relations).

## Product goal

Turn source material (release notes, specs, technical documents) into **review-ready, source-grounded documentation**, where every fact can be traced to its source and nothing is published without a human decision.

| | |
|---|---|
| **Target users** | Technical writers, engineers, product managers, reviewers and approvers in a documentation team |
| **Inputs** | Uploaded PDF, DOCX, TXT, Markdown or CSV files, or pasted raw text, plus metadata (title, content type, audience, product area, channel) |
| **Core workflow** | Extract text with source markers → retrieve relevant context → 5-agent AI workflow → automatic technical review and quality score → human review / revision → approval → publish |
| **Expected output** | A customer-facing Markdown document with a quality score, supported facts with source references, context gaps, unsupported claims and risks |
| **Success criteria** | Draft generated end-to-end from a real document; every fact backed by a source reference; unsupported claims flagged before publishing; only approved drafts can be exported; roles enforced on the backend |
| **Key constraints** | No hallucinated facts; secrets never in code; works on free-tier hosting; human approval required before publishing |

---

# Key Features

## AI-Assisted Documentation

The system uses a multi-stage AI workflow instead of relying on a single prompt.

The workflow consists of:

1. **Context Reader**
2. **Documentation Writer**
3. **Technical Reviewer**
4. **Tone Optimizer**
5. **Publishing Coordinator**

Each stage has a specific responsibility in the documentation pipeline.

---

##  Source-Grounded Generation

The system processes source documents before generating content.

Supported input formats include:

- PDF
- DOCX
- TXT
- Markdown
- CSV

The system preserves source references during document processing so generated content can be reviewed against the original material.

For PDFs, page-level source information can be preserved.

Scanned/image-only PDFs require OCR and are rejected when usable text cannot be extracted.

---

##  Context Reader

The Context Reader converts raw source material into structured evidence.

It identifies:

- Facts
- Changes
- Requirements
- Entities
- Gaps
- Contradictions
- Source references

This structured context is then passed to the downstream AI stages.

---

## Documentation Writer

The Documentation Writer creates customer-facing or engineering-facing documentation from the normalized source context.

The writer is designed to work from extracted evidence rather than blindly generating information.

---

## Technical Reviewer

The Technical Reviewer checks the generated documentation for issues such as:

- Unsupported claims
- Missing information
- Technical risks
- Contradictions
- Source coverage problems
- Potentially incorrect statements

Review findings are preserved as part of the draft/review process.

---

##  Tone Optimizer

The Tone Optimizer improves readability and consistency while keeping the technical meaning of the documentation intact.

It can be used to produce documentation suitable for different audiences and communication styles.

---

##  Publishing Coordinator

The Publishing Coordinator prepares the final documentation for controlled output.

Publishing is protected by the human approval process rather than allowing the AI workflow to publish content automatically.

---

#  Authentication & Role-Based Access Control

The application uses Firebase Authentication with backend verification.

Authentication flow:

```text
User Login
    ↓
Firebase Authentication
    ↓
Firebase ID Token
    ↓
Frontend
    ↓
FastAPI Backend
    ↓
Firebase Token Verification
    ↓
User / Role Lookup
    ↓
Authorized API Access
```

Supported roles include:

| Role | Refine | Request Revision | Approve | Publish |
|---|---:|---:|---:|---:|
| Writer | ✅ | ❌ | ❌ | ❌ |
| Reviewer | ✅ | ✅ | ❌ | ❌ |
| Approver | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

New Firebase users receive the default `writer` role. Elevated roles are managed by administrators.



#  Document Processing

<img width="1528" height="1029" alt="Document Processing Ingestion Pipeline" src="https://github.com/user-attachments/assets/88e0090c-8613-4f21-b32a-750b3642f77e" />




---

#  Supported Documents

| Format | Supported |
|---|---|
| PDF | ✅ |
| DOCX | ✅ |
| TXT | ✅ |
| Markdown | ✅ |
| CSV | ✅ |

PDF source markers can preserve the original filename and page number.

---

#  Data Sources & Sample Inputs

| Source | How it is used |
|---|---|
| Uploaded documents (PDF, DOCX, TXT, MD, CSV) | Main input. Text is extracted with `pypdf`, `python-docx` and the `csv` module (`backend/app/services/document_extractor.py`) |
| Pasted raw text | Alternative input when no file is uploaded |
| Job metadata (title, content type, audience, product area, channel) | Steers the agents' tone and focus, and builds the retrieval query |
| ChromaDB knowledge base | Source chunks stored per job and retrieved as context (`backend/ai/retrieval/knowledge_base.py`) |
| Review history | Reviewer comments feed the refine step that produces the next draft version |
| PostgreSQL / SQLite | Users, roles, content jobs, drafts, review decisions and audit events |

**Source markers.** Every extracted chunk is tagged, for example `[SOURCE: release_notes.pdf | PAGE 1]`, so that the agents can cite where each fact came from and reviewers can check it.

**Sample inputs** for testing and demos are in [`data/sample_inputs/`](data/sample_inputs):

| File | Type | Good for testing |
|---|---|---|
| `01_trailmark_field_guide.pdf` | Product guide | User-facing documentation |
| `02_civicroute_api_reference.pdf` | API reference | API documentation |
| `03_greenledger_release_brief.pdf` | Release brief | Release notes |
| `04_kilnstock_product_evidence.pdf` | Product evidence | Fact-checking and unsupported-claim detection |
| `05_orbitcare_release_dossier.pdf` | Longer release dossier | Larger, multi-page input |
| `06_lantern_library_update.txt` | Plain text | Quick text-only test |

---

#  System Architecture

```text
┌───────────────────────────────┐
│       React Frontend          │
│                               │
│ Dashboard                     │
│ Content Intake                │
│ Jobs                          │
│ Draft Review                  │
│ Metrics                       │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        FastAPI Backend        │
│                               │
│ Authentication               │
│ RBAC                         │
│ Content Jobs                 │
│ Drafts                       │
│ Reviews                      │
│ Refinement                   │
│ Publishing                   │
│ Metrics                      │
└───────────────┬───────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐   ┌─────────────────┐
│  Database   │   │ Document        │
│             │   │ Processing      │
│ SQLite      │   │ PDF             │
│ PostgreSQL  │   │ DOCX            │
│ Supabase    │   │ TXT             │
└─────────────┘   │ MD / CSV        │
                  └────────┬────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │    AI Workflow   │
                 │                  │
                 │ Context Reader   │
                 │ Writer           │
                 │ Reviewer         │
                 │ Tone Optimizer   │
                 │ Publisher        │
                 └──────────────────┘
```

---

#  AI Workflow

```mermaid
---
config:
  theme: base
  themeVariables:
    background: "#0F172A"
    primaryColor: "#1E293B"
    primaryTextColor: "#F8FAFC"
    primaryBorderColor: "#38BDF8"
    lineColor: "#64748B"
    secondaryColor: "#162032"
    tertiaryColor: "#1E293B"
---
flowchart TD
    HEADER["<b>Document Processing</b><br/>Ingestion Pipeline"]

    S1["<b>Uploaded File</b><br/>User uploads a document"]
    N1["<b>Supported formats:</b><br/>PDF, DOCX, TXT,<br/>Markdown, CSV"]

    S2["<b>File Validation</b><br/>Checks file type, size and format"]
    N2["<b>Validates:</b><br/>• Supported file format<br/>• File size limits<br/>• File integrity"]

    S3["<b>Document Extraction</b><br/>Extracts text content from the document"]
    N3["<b>Handles extraction from:</b><br/>• PDFs<br/>• DOCX, TXT<br/>• Markdown, CSV"]

    S4["<b>Text Normalization</b><br/>Cleans and standardizes extracted text"]
    N4["<b>Normalization steps:</b><br/>• Remove extra spaces<br/>• Handle special characters<br/>• Standardize text format"]

    S5["<b>Source Metadata</b><br/>Generates metadata about the document"]
    N5["<b>Includes metadata such as:</b><br/>• File name<br/>• File type<br/>• Document size<br/>• Upload timestamp"]

    S6["<b>Context Reader</b><br/>Prepares document context for the AI workflow"]
    N6["<b>Uses:</b><br/>• Extracted text<br/>• Source metadata<br/>• Supporting context<br/>(e.g. templates, style guides)"]

    S7["<b>AI Workflow</b><br/>Sends prepared context to the AI workflow<br/>for documentation generation"]

    HEADER --> S1
    S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7

    S1 -.-> N1
    S2 -.-> N2
    S3 -.-> N3
    S4 -.-> N4
    S5 -.-> N5
    S6 -.-> N6

    style HEADER fill:#162032,stroke:#FBBF24,stroke-width:2px,color:#F8FAFC
    style S1 fill:#1E293B,stroke:#10B981,stroke-width:2px,color:#F8FAFC
    style S2 fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#F8FAFC
    style S3 fill:#1E293B,stroke:#F59E0B,stroke-width:2px,color:#F8FAFC
    style S4 fill:#1E293B,stroke:#FB7185,stroke-width:2px,color:#F8FAFC
    style S5 fill:#1E293B,stroke:#A78BFA,stroke-width:2px,color:#F8FAFC
    style S6 fill:#1E293B,stroke:#2DD4BF,stroke-width:2px,color:#F8FAFC
    style S7 fill:#1E293B,stroke:#818CF8,stroke-width:2px,color:#F8FAFC

    style N1 fill:#162032,stroke:#334155,stroke-width:1px,color:#CBD5E1
    style N2 fill:#162032,stroke:#334155,stroke-width:1px,color:#CBD5E1
    style N3 fill:#162032,stroke:#334155,stroke-width:1px,color:#CBD5E1
    style N4 fill:#162032,stroke:#334155,stroke-width:1px,color:#CBD5E1
    style N5 fill:#162032,stroke:#334155,stroke-width:1px,color:#CBD5E1
    style N6 fill:#162032,stroke:#334155,stroke-width:1px,color:#CBD5E1
```


---

#  Prompt Strategy, Guardrails & Validation

**Prompt strategy.** Instead of one large prompt, the work is split across five CrewAI agents that run in sequence (`backend/ai/agents/crew.py`). Each agent has a narrow role and goal, and its task instructions are defined in `backend/ai/workflow.py`. Every agent receives all earlier agents' outputs as context.

| Agent | Instruction (summary) | Output format |
|---|---|---|
| Context Reader | Extract only source-grounded facts, gaps, contradictions and source references | Structured JSON |
| Documentation Writer | Write original Markdown for the audience using only supported facts; never copy the source | Markdown |
| Technical Reviewer | Compare the draft against the evidence | JSON: verdict (PASS / NEEDS_REVIEW), risks, unsupported claims, missing information, supported sections |
| Tone Optimizer | Improve clarity and structure using the review findings, without adding facts | Markdown |
| Publishing Coordinator | Prepare the final customer-facing document, omitting internal review data | Markdown |

**Guardrails and validation**

- **Grounding:** agents are instructed to use only facts from the source evidence, and every fact keeps its source reference.
- **Structured outputs:** evidence and review are returned as JSON and parsed defensively; invalid JSON falls back safely instead of crashing.
- **Quality score (0–100):** starts at 100, then −15 per unsupported claim (max −40), −10 per technical risk (max −30) and −3 per context gap (max −20). If no structured review is available, the score is capped at 70 and a risk is added.
- **Human-in-the-loop:** every draft is marked `human_approval_required`; only approver or admin roles can publish, and only approved drafts can be exported.
- **Input validation:** unsupported file types, empty files and scanned (image-only) PDFs are rejected with clear messages; job titles and source text have minimum lengths.
- **Safe rendering:** AI Markdown is rendered as React elements (no raw HTML), which prevents script injection in the browser.
- **Error handling:** AI provider failures are reported as "AI workflow failed…", and mock mode (`AI_PROVIDER=mock`) keeps the full flow testable without an API key.

## Architecture decisions & trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| Multi-agent pipeline instead of one prompt | Each step is simpler and more reliable, and it produces structured evidence and review data | More LLM calls per run, so it is slower and more expensive |
| Human approval before publishing | AI can still make mistakes; a person owns the final decision | Adds a manual step |
| Local hash embeddings in ChromaDB | No external embedding service or extra API cost; retrieval is scoped per job | Less semantic than model-based embeddings |
| OpenAI-compatible provider layer | Swap Gemini, OpenAI or mock through environment variables only | Provider-specific features are not used |
| Firebase Authentication | Secure, managed sign-in; the backend verifies every token | Depends on a third-party service |
| Free-tier hosting (Vercel, Render) | Zero cost for the capstone | Backend sleeps when idle; uploaded files are not kept on restart |

---

#  Mock AI Mode

The project supports a mock AI mode for local development and demonstrations.

This allows the application to run without an external AI API key.

```env
AI_PROVIDER=mock
```

In mock mode:

- Document extraction still runs locally.
- AI model calls are replaced with deterministic fallback output.
- Frontend and backend flows can be tested without consuming AI API quota.

---

#  Real AI Configuration

For real AI generation, configure the AI provider through environment variables.

Example:

```env
AI_PROVIDER=openai_compatible
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
AI_TIMEOUT_SECONDS=120
```

> Never commit real API keys to GitHub.

For Google Gemini (used in our deployment), use Gemini's OpenAI-compatible endpoint:

```env
AI_PROVIDER=openai_compatible
OPENAI_API_KEY=your_gemini_api_key
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
OPENAI_MODEL=gemini-flash-latest
AI_TIMEOUT_SECONDS=120
```

Get a key at https://aistudio.google.com/apikey. If a model name returns 404 for your key, list the models your key can use and pick an available `flash` model.

---

#  Database

The project supports SQLite for local development.

Default:

```env
DATABASE_URL=sqlite:///./data/app.db
```

For production or hosted deployments, PostgreSQL-compatible databases such as Supabase can be configured using:

```env
DATABASE_URL=your_postgresql_connection_string
```

(postgresql)content_engine_user: HALMTDA20yKCrNVLNFDpfr1U7F2KmyOW@dpg-dbv8v7mtlv9c73868k9g-a.singapore-postgres.render.com/content_engine_1k89

The database stores application data such as:

- Users
- Roles
- Content jobs
- Drafts
- Draft versions
- Review decisions
- Audit information
- Metrics

---

#  API

The FastAPI backend exposes the following major endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/content-jobs` | Create content job |
| GET | `/api/content-jobs` | List content jobs |
| GET | `/api/content-jobs/{job_id}` | Get job details |
| POST | `/api/content-jobs/{job_id}/run` | Run AI workflow |
| POST | `/api/drafts/{draft_id}/review` | Review draft |
| POST | `/api/drafts/{draft_id}/refine` | Refine draft |
| POST | `/api/publish/export` | Export approved content |
| GET | `/api/metrics` | Get operational metrics |
| GET | `/health` | Health check |
| GET | `/health/ready` | Readiness check |

Interactive API documentation:

**Swagger UI**

https://content-engine-backend-7hal.onrender.com/docs

**OpenAPI**

https://content-engine-backend-7hal.onrender.com/openapi.json

---

#  Metrics

The application provides operational metrics through the backend API.

Metrics can be used to understand:

- Content job activity
- Draft processing
- Review activity
- Workflow operations
- System usage

Frontend metrics are available through the dashboard.

---

#  Draft & Version History

Generated documentation is treated as a draft before final publication.

The system supports:

- Draft creation
- Review decisions
- Revision requests
- Refinement
- New draft versions
- Approval
- Export

This prevents an AI-generated document from automatically becoming the final published document.

---

#  Human Review

Human review is a core part of the workflow.

```text
AI Generated Draft
        ↓
   Human Reviewer
        ↓
 ┌──────┴────────┐
 │               │
Approve      Request Revision
 │               │
 ↓               ↓
Export          Refine
                 ↓
            New Version
```

This provides an additional quality-control layer between AI generation and publication.

---

#  Project Structure

```text
gitlab-ai-documentation-engine-GenAi/
│
├── backend/
│   ├── ai/
│   │   ├── agents/              # 5 CrewAI agents + crew.py (roles, goals, sequential crew)
│   │   ├── retrieval/           # ChromaDB knowledge base (job-scoped retrieval)
│   │   ├── schemas/             # Context / evidence schemas
│   │   ├── common.py            # Output cleaning and source-reference helpers
│   │   └── workflow.py          # Agent task prompts, scoring and result packaging
│   ├── app/
│   │   ├── api/                 # auth, content_jobs, reviews, publishing, metrics routes
│   │   ├── auth/                # Firebase token verification + role checks
│   │   ├── db/                  # SQLAlchemy session (SQLite / PostgreSQL)
│   │   ├── models/              # users, content_jobs, drafts, reviews, audit_events
│   │   ├── services/            # AI provider (Gemini / OpenAI-compatible / mock), document extractor
│   │   ├── config.py
│   │   └── main.py
│   ├── .python-version          # Pins Python 3.12 for deployment
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── app/                 # Next.js pages: login, signup, dashboard, create-content,
│       │                        # my-jobs, review, analytics, settings
│       ├── components/          # layout, auth panel, UI (command palette, theme, toasts)
│       ├── hooks/useAuth.js     # Auth context (user, role, token)
│       └── lib/                 # backend URL, Firebase user helpers, theme
│
├── data/sample_inputs/          # Sample documents for testing and demos
├── tests/                       # 25 functional, security, edge-case and AI tests
├── docs/                        # Architecture, workflow states, demo script,
│   ├── presentation/            # project presentation (PowerPoint)
│   └── screenshots/
├── deployment/                  # Deployment notes
├── tools/                       # Helper: create a read-only database user
├── .env.example                 # All environment variables (no real secrets)
├── docker-compose.yml
└── README.md
```

---

#  Technology Stack

## Frontend

- React
- JavaScript
- Dashboard UI
- Firebase Authentication
- Vercel

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Uvicorn

## Authentication

- Firebase Authentication
- Firebase Admin verification
- Backend-managed roles

## Database

- SQLite
- PostgreSQL
- Supabase-compatible PostgreSQL

## AI

- Crew AI
- Pydantic
- Chroma DB 
- Gemini as primary LLM
- Mock AI mode
- OpenAI-compatible provider configuration

## Deployment

- Vercel
- Render
- Docker
- Docker Compose

---

# Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/Ankush25-anku/gitlab-ai-documentation-engine-GenAi.git
cd gitlab-ai-documentation-engine-GenAi
```

---

# 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment.

> **Use Python 3.10–3.13 (3.12 recommended).** CrewAI does not support Python 3.14 yet. On Windows with several Python versions installed, use `py -3.12 -m venv .venv`.

### Windows

```powershell
python -m venv .venv
.\.venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 3. Environment Configuration

Copy the example environment file.

### Windows

```powershell
Copy-Item ..\.env.example .env
```

### macOS / Linux

```bash
cp ../.env.example .env
```

Configure the required variables.

Example:

```env
DATABASE_URL=sqlite:///./data/app.db

AI_PROVIDER=mock

AI_TIMEOUT_SECONDS=120
```

For real AI:

```env
AI_PROVIDER=openai_compatible
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
AI_TIMEOUT_SECONDS=120
```

Configure Firebase Admin credentials and project settings according to your Firebase project.

---

# 4. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

OpenAPI:

```text
http://localhost:8000/openapi.json
```

Health:

```text
http://localhost:8000/health
```

---

# 5. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment.

Example:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Configure the Firebase web application variables for the same Firebase project used by the backend.

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

#  Docker Setup

The repository also contains Docker Compose configuration.

From the repository root:

```bash
docker compose up --build
```

The application will start using the configured environment variables.

---

#  Firebase Configuration

The frontend and backend must use the same Firebase project.

### Backend

Configure:

```env
FIREBASE_PROJECT_ID=your_project_id
```

and the required Firebase Admin credentials.

### Frontend

Configure the Firebase web application settings:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Do not commit private credentials or service-account files.

---

#  Deployment

## Frontend

The frontend is deployed using Vercel.

Production URL:

```text
https://gitlab-ai-docs-engine.vercel.app/login
```

The frontend is configured (in Vercel → Settings → Environment Variables) to use the deployed backend:

```env
NEXT_PUBLIC_BACKEND_URL=https://content-engine-backend-7hal.onrender.com
```

The Vercel domain is also added to Firebase → Authentication → Settings → Authorized domains.

---

## Backend

The FastAPI backend is deployed using Render.

Production API:

```text
https://content-engine-backend-7hal.onrender.com
```

Swagger:

```text
https://content-engine-backend-7hal.onrender.com/docs
```

Render settings used:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Python version: pinned to 3.12 by `backend/.python-version`
- `DATABASE_URL`: the Render Postgres **internal** URL with the `postgresql+psycopg://` prefix
- `FIREBASE_SERVICE_ACCOUNT_PATH=/etc/secrets/firebase-key.json` (uploaded as a Render secret file, never committed)
- `CORS_ORIGINS` / `FRONTEND_URL`: the Vercel URL

All secrets (database URL, Gemini key, JWT secret, Firebase service account) live only in Render/Vercel environment settings.

---

#  Production Architecture

```text
                    Internet
                       │
                       ▼
        ┌─────────────────────────┐
        │        Vercel           │
        │     React Frontend      │
        └────────────┬────────────┘
                     │
                     │ HTTPS API
                     ▼
        ┌─────────────────────────┐
        │         Render          │
        │      FastAPI Backend    │
        └───────┬─────────┬───────┘
                │         │
                │         ├──────────────┐
                │         │              │
                ▼         ▼              ▼
           Firebase    Database      AI Provider
           Auth        PostgreSQL     / Gemini /
                       / Supabase     OpenAI-compatible
```

---

#  Security Considerations

The project follows several security principles:

- Firebase ID token verification on the backend
- Role-based authorization
- Backend-controlled publishing
- Human approval before export
- Environment-based secret configuration
- No API keys committed to source control
- Source references for generated documentation
- Draft/version history
- Audit-oriented workflow

---

#  Testing & Demo

For a local demo without an AI API key:

```env
AI_PROVIDER=mock
```

Then start:

```bash
uvicorn app.main:app --reload --port 8000
```

and:

```bash
npm run dev
```

A typical demonstration flow is:

```text
Login
  ↓
Create Content Job
  ↓
Upload Source Document
  ↓
Process Document
  ↓
Run AI Workflow
  ↓
Generate Draft
  ↓
Review Draft
  ↓
Approve / Request Revision
  ↓
Refine if Required
  ↓
Export Approved Documentation
```

---

#  Documentation

Additional project documentation is available in:

```text
docs/
```

Important files include:

```text
docs/architecture.md
docs/workflow_states.md
docs/demo_script.md
```

---

#  Project Goals

The project is designed to demonstrate how an AI-assisted documentation platform can combine:

- Generative AI
- Document processing
- Source grounding
- Structured AI workflows
- Human-in-the-loop review
- Authentication
- Role-based access control
- Database persistence
- Draft versioning
- Quality checks
- Controlled publishing
- Full-stack web development
- Cloud deployment

---

#  Evaluation & Reliability

## What "good performance" means

- The draft contains **only facts supported by the source**, each with a source reference.
- Unsupported claims and gaps are **flagged before** a human approves.
- The full workflow (upload → AI → review → revision → approve → publish) **completes end-to-end** on the deployed app.
- **Roles are enforced** on the backend, not only in the UI.

## Automated tests (25 tests)

Located in [`tests/`](tests):

| Folder | What it checks |
|---|---|
| `functional_tests/` | Health and readiness endpoints, metrics (empty database, real jobs, writer filtering, monthly trend), exporting approved, unapproved and missing drafts |
| `security_tests/` | Endpoints reject unauthenticated requests; role checks allow writers and admins where expected and reject writers from reviewer- and admin-only endpoints |
| `edge_cases/` | Rejects too-short titles and source text, accepts minimum valid input, handles special characters in export titles |
| `ai_output_tests/` | Mock AI provider generation; the workflow defines all five agents and uses CrewAI |

Run them from the repository root (with the backend virtual environment active):

```powershell
pip install pytest
$env:PYTHONPATH = "backend"     # macOS/Linux: export PYTHONPATH=backend
pytest tests
```

## Manual end-to-end evaluation (live deployment)

Tested on the deployed app (Vercel + Render + PostgreSQL + Gemini) with a release-notes PDF:

| Check | Result |
|---|---|
| Workflow completion | All five agents completed; draft generated |
| Quality score | 100 / 100, verdict PASS |
| Groundedness | 4 supported facts with source references (file + page) |
| Hallucination detection | The reviewer still flagged 3 unsupported claims (statements not in the source) for human review |
| Revision loop | Reviewer comment produced Version 2 of the draft |
| Approval and publishing | Approved draft published and exported as Markdown |
| Access control | A writer trying to approve received 403 "Insufficient permissions" |
| Source grounding with a mismatched title | With a title not related to the document, the AI reported that the source had no information on it instead of inventing content |

## Known limitations

- The AI workflow runs synchronously; there is no live per-agent progress yet.
- AI provider outages (HTTP 503 or 429) are not retried automatically; the user retries manually.
- Only the first 8,000 characters of a source are sent to the Context Reader, so very long documents are truncated.
- Retrieval uses simple hash embeddings rather than semantic embedding models.
- Scanned (image-only) PDFs need OCR, which is not built in.
- On Render's free plan the backend sleeps when idle (first request takes up to a minute) and uploaded files are not kept after a restart; jobs and drafts are kept in PostgreSQL.
- The Markdown viewer does not render tables.
- Some UI controls (content templates, the "From Existing" tab) are placeholders for future features.

---

#  Future Enhancements

Potential future improvements include:

- Advanced vector database retrieval
- Richer knowledge-base integration
- Additional AI providers
- Automated GitLab repository integration
- GitLab webhook integration
- More document formats
- Advanced evaluation pipelines
- More granular permissions
- Improved observability
- Automated CI/CD workflows
- Additional export formats
- Advanced analytics

---

#  Development

The project separates responsibilities between the frontend, backend, document processing, AI workflow, and deployment configuration.

This makes it possible to independently improve:

```text
Frontend
Backend APIs
Authentication
Database
Document Processing
AI Workflow
Review System
Publishing
Deployment
```

---

#  Important Notes

- Do not commit `.env` files containing real credentials.
- Do not expose Firebase Admin private keys.
- Do not expose AI API keys.
- Production authentication requires correctly configured Firebase credentials.
- Real AI generation requires a valid AI provider configuration.
- Mock AI mode can be used for local demonstrations without an external model API.

---

#  License

This project is intended for development, demonstration, and educational purposes unless a separate license is provided.

---

---
# Screenshots
---
## 1. Home 
<img width="1891" height="865" alt="Screenshot (395)" src="https://github.com/user-attachments/assets/1fcc0a97-0e87-4585-b49c-a513825518d0" />

## 2. Application Dashboard
<img width="1896" height="863" alt="Screenshot (398)" src="https://github.com/user-attachments/assets/0f20f7e5-152c-410b-ac90-d7d7cdf0f1a9" />

## 3.Create content page
<img width="1904" height="868" alt="Screenshot (397)" src="https://github.com/user-attachments/assets/12299d80-c179-4e23-b425-96afb20cddd1" />

 ## 4. Review page
<img width="1906" height="870" alt="Screenshot (399)" src="https://github.com/user-attachments/assets/e7c25a96-7030-41f6-b52e-4e2a5ac66ee0" />
<img width="1904" height="864" alt="Screenshot (400)" src="https://github.com/user-attachments/assets/a4cda287-c8bb-4592-a45e-b62498256e17" />


## 5. Job Page
<img width="1894" height="854" alt="Screenshot (401)" src="https://github.com/user-attachments/assets/3494145c-3690-4101-b482-08898fa56d04" />


## 6. Analytics Page
<img width="1892" height="867" alt="Screenshot (402)" src="https://github.com/user-attachments/assets/cf3cead0-e996-4176-945b-661dfea6496f" />


## 7. Role Management Page
<img width="1901" height="855" alt="Screenshot (403)" src="https://github.com/user-attachments/assets/2c095c79-b9b7-47c5-8f5b-6bc05dadd92e" />





#  Project Summary

**GitLab AI Content & Documentation Engine** is a full-stack AI-powered documentation platform that takes source material, extracts structured context, generates documentation through specialized AI stages, performs technical review, and places the result into a human-controlled approval and publishing workflow.

```text
Source Documents
       ↓
Document Processing
       ↓
Context Extraction
       ↓
AI Documentation Workflow
       ↓
Technical Review
       ↓
Tone Optimization
       ↓
Human Review
       ↓
Approval
       ↓
Export / Publish
```

**Frontend:** Vercel  
**Backend:** FastAPI + Render  
**Authentication:** Firebase  
**Database:** SQLite / PostgreSQL / Supabase  
**AI:** Configurable provider  
**Workflow:** Source-grounded multi-stage generation + human review

## Contributors 

This project was developed collaboratively by:

| Contributor | Role / Contribution |
|---|---|
| Ankush | Frontend |
| Tina | Backend and API, AI agents and retrieval |
| Aditya | AI agents |
| Pruthvi | Architecture and database |
| Nitant | Deployment |
| Vrushabh | QA and testing |

All contributors participated collaboratively in the development, testing, documentation, and refinement of the project. The team also performed quality assurance and different types of testing to make sure that the AI workflow, APIs, document processing pipeline and overall system work correctly.
