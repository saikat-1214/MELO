# SocialConnect

An interest-based friendship and real-world activity meetup platform designed to connect people through shared experiences (concerts, sports, festivals, travel, dining, and city exploration) in a safe, transparent, and structured environment. Explicitly designed for community and shared hobbies, **not dating**.

---

## Architecture Overview

```text
React (Vite + TypeScript + Tailwind)
       │
       ▼
Main FastAPI Backend (Auth, RBAC, Validation, DB Persistence)
   ├───▶ PostgreSQL (SQLAlchemy 2.x + asyncpg + Alembic)
   │
   └───▶ Independent AI FastAPI Service (Candidate Scoring & Explainable Ranking)
```

- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, asyncpg, Alembic, PostgreSQL, JWT, WebSockets.
- **AI Service**: Python 3.12, FastAPI, scikit-learn, NumPy, pandas (Stateless, deterministic explainable scoring).

---

## Quick One-Command Execution & Testing (Windows PowerShell)

For fast development and complete regression verification, two helper scripts are provided:

### 1. Launch All Microservices (`start-all.ps1`)
Launches the AI Microservice (`:8001`), the Core FastAPI Backend (`:8000`), and the Vite Frontend (`:5173`) in separate background processes:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```

### 2. Run Master Test & Verification Suite (`test-all.ps1`)
Runs the full regression test suite across backend (29 pytest tests), AI service (14 pytest tests), Alembic SQL migration validity, TypeScript compilation, and production bundle build:
```powershell
powershell -ExecutionPolicy Bypass -File .\test-all.ps1
```

---

## Directory Structure

```text
socialconnect/
  frontend/          # React + Vite + TypeScript Client
  backend/           # Core FastAPI Backend & Business Logic
  ai-service/        # Independent AI / Matching Scoring Microservice
  database/          # Database DDL, Seed Scripts & Schemas
  docs/              # Architectural, Database, Security & AI Specifications
  plan.md            # Live Project Plan & Execution Phases
  handoff.md         # Activity Log & Development State
  README.md          # Setup & Execution Documentation
```

---

## Getting Started & Independent Startup

### Prerequisites
- Python 3.12+ (or managed via `uv`)
- Node.js 18+ and npm
- PostgreSQL 15+ (local instance or cloud database URI)

---

### 1. Database Setup

1. Create a dedicated PostgreSQL database:
   ```sql
   CREATE DATABASE socialconnect_db;
   ```
2. Configure credentials in `backend/.env` (see `backend/.env.example`).

---

### 2. Backend Setup & Startup

```bash
cd backend
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Run database migrations
alembic upgrade head

# Start backend server (runs on http://localhost:8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. AI Service Setup & Startup

The AI Service runs as an independent microservice on port 8001:

```bash
cd ai-service
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Start AI recommendation service (runs on http://localhost:8001)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

### 4. Frontend Setup & Startup

```bash
cd frontend
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)
```ini
ENVIRONMENT=development
DEBUG=True
PORT=8000
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/socialconnect_db
JWT_SECRET_KEY=dev_insecure_jwt_secret_key_replace_in_production_32chars_min
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
AI_SERVICE_URL=http://localhost:8001
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

### AI Service (`ai-service/.env`)
```ini
ENVIRONMENT=development
PORT=8001
BACKEND_INTERNAL_API_KEY=dev_internal_ai_service_key_32chars_min
ALLOWED_HOSTS=["127.0.0.1","localhost"]
ALGORITHM_VERSION=v1.0-heuristic
WEIGHT_INTEREST=0.40
WEIGHT_SCHEDULE=0.30
WEIGHT_LOCATION=0.20
WEIGHT_CATEGORY=0.10
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/api/v1
```

