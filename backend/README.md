# 🌍 GlobeTrotter Backend

**AI-powered multi-city travel planner** — FastAPI + SQLAlchemy + Gemini AI

> Hackathon backend built by **Krishna** (Backend/Database Lead)

---

## ⚡ Quick Start (Copy-Paste Ready)

```powershell
# 1. Navigate to backend
cd d:\globe_trotter\GlobeTrotter\backend

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install all dependencies
pip install -r requirements.txt

# 4. Setup environment variables
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 5. Seed demo data (creates DB + sample trips)
python seed_data.py

# 6. Start the server
python -m uvicorn app.main:app --reload
```

**Server:** http://localhost:8000  
**Swagger UI:** http://localhost:8000/docs  
**Demo Login:** `explorer@globetrotter.io` / `Demo1234!`

---

## 🔍 How to Test All Endpoints

### Option 1: Swagger UI (Easiest)
Open http://localhost:8000/docs — all endpoints are interactive.  
Click **Authorize** → paste your JWT token.

### Option 2: Quick curl test
```bash
# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"explorer@globetrotter.io","password":"Demo1234!"}'

# List trips (copy token from login response)
curl http://localhost:8000/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search cities
curl "http://localhost:8000/api/cities/search?q=tokyo"

# Get activities with lat/lng (for Mapbox)
curl http://localhost:8000/api/activities

# Get budget breakdown (Recharts format)
curl http://localhost:8000/api/budget/TRIP_ID_HERE
```

### Option 3: Python script
```python
import httpx
r = httpx.post("http://localhost:8000/api/auth/login",
    json={"email": "explorer@globetrotter.io", "password": "Demo1234!"})
token = r.json()["access_token"]
trips = httpx.get("http://localhost:8000/api/trips",
    headers={"Authorization": f"Bearer {token}"})
print(trips.json())
```

---

## 🏗️ Architecture

```
User → Trip → Stop (city) → Activity
                   └──────→ Expense (budget)
                   └──────→ Share (public link)
User → SavedDestination (favourites)
```

- **FastAPI** — async REST API framework
- **SQLAlchemy 2.0** — async ORM with mapped columns
- **SQLite** (dev) / **PostgreSQL + Neon** (prod)
- **Gemini 1.5 Flash** — AI trip generation
- **JWT (HS256)** — stateless auth, 7-day tokens
- **bcrypt** — password hashing (direct, not passlib)

---

## 📦 Dependencies & Libraries

### Core Framework
| Package | Version | Why |
|---------|---------|-----|
| `fastapi` | 0.141.1 | Main REST framework |
| `uvicorn[standard]` | 0.52.4 | ASGI server |
| `python-multipart` | 0.0.20 | Form data support |

### Database
| Package | Version | Why |
|---------|---------|-----|
| `sqlalchemy[asyncio]` | 2.0.52 | Async ORM |
| `aiosqlite` | 0.20.0 | Async SQLite driver (dev) |
| `asyncpg` | 0.31.0 | Async PostgreSQL driver (prod) |
| `alembic` | 1.19.1 | Schema migrations |

### Auth & Security
| Package | Version | Why |
|---------|---------|-----|
| `python-jose[cryptography]` | 3.5.0 | JWT encode/decode |
| `bcrypt` | 5.0.0 | Password hashing |
| `cryptography` | 45.0.4 | Jose dependency |

> ⚠️ **Do NOT use passlib** — it has a known bug with bcrypt >= 4.x that throws `ValueError: password cannot be longer than 72 bytes`. We use `bcrypt` directly.

### Validation & Config
| Package | Version | Why |
|---------|---------|-----|
| `pydantic[email]` | 2.13.4 | Request/response schemas |
| `pydantic-settings` | 2.15.0 | `.env` loading |
| `python-dotenv` | 1.2.3 | dotenv support |
| `email-validator` | 2.2.0 | Email validation |

### AI & HTTP
| Package | Version | Why |
|---------|---------|-----|
| `google-genai` | 2.19.0 | Gemini 1.5 Flash API |
| `httpx` | 0.28.1 | Async HTTP client |

---

## 📁 File Structure

```
backend/
├── app/
│   ├── main.py                    # App entry point — routers, middleware
│   ├── models/
│   │   └── __init__.py            # 7 SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py            # Schema exports
│   │   └── trip.py                # All Pydantic schemas
│   ├── api/
│   │   ├── auth.py                # /auth — signup, login, forgot-password
│   │   ├── users.py               # /users — CRUD profile
│   │   ├── trips.py               # /trips — CRUD + PATCH
│   │   ├── stops.py               # /stops — city stops
│   │   ├── cities.py              # /cities — search, save favourites
│   │   ├── activities.py          # /activities — search, create
│   │   ├── itinerary.py           # /itinerary — day builder
│   │   ├── budget.py              # /budget — Recharts breakdown
│   │   ├── sharing.py             # /sharing — public links
│   │   └── ai.py                  # /ai — Gemini plan generation
│   ├── core/
│   │   ├── config.py              # Settings (JWT, DB, CORS)
│   │   ├── security.py            # bcrypt + JWT utilities
│   │   └── dependencies.py        # get_current_user dependency
│   ├── database/
│   │   └── session.py             # Async DB session + Base
│   └── services/
│       └── gemini.py              # Gemini AI service
├── alembic/                       # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── alembic.ini
├── seed_data.py                   # Demo data seeder
├── requirements.txt               # All pip packages
├── .env.example                   # Environment template
├── KRISHNA_IMPLEMENTATION_PLAN.md # Full technical plan for team
└── README.md                      # This file
```

---

## 📡 All API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Register → returns JWT |
| POST | `/api/auth/login` | No | Login → returns JWT |
| POST | `/api/auth/forgot-password` | No | Password reset trigger |
| GET | `/api/auth/me` | Yes | Current user profile |
| GET | `/api/users/me` | Yes | Full profile |
| GET | `/api/users/{id}` | No | Public profile |
| PATCH | `/api/users/me` | Yes | Update profile |
| DELETE | `/api/users/me` | Yes | Delete account |
| POST | `/api/trips` | Optional | Create trip |
| GET | `/api/trips` | Optional | List trips |
| GET | `/api/trips/{id}` | No | Trip with stops+activities |
| PATCH | `/api/trips/{id}` | Optional | Update trip |
| DELETE | `/api/trips/{id}` | Optional | Delete trip |
| POST | `/api/trips/{id}/stops` | No | Add city stop |
| GET | `/api/stops/{id}` | No | Get stop with activities |
| DELETE | `/api/stops/{id}` | No | Remove stop |
| GET | `/api/cities/search` | No | Search city catalogue |
| GET | `/api/cities/{id}` | No | City details |
| POST | `/api/cities/{id}/save` | Yes | Save favourite |
| DELETE | `/api/cities/{id}/save` | Yes | Remove favourite |
| GET | `/api/activities` | No | Search activities |
| GET | `/api/activities/{id}` | No | Single activity |
| POST | `/api/activities` | No | Create activity |
| POST | `/api/itinerary/{trip_id}/days` | No | Create day |
| GET | `/api/itinerary/{trip_id}/days` | No | List days |
| POST | `/api/itinerary/{day_id}/activities` | No | Add to day |
| DELETE | `/api/itinerary/activities/{id}` | No | Remove from day |
| POST | `/api/itinerary/reorder` | No | Reorder drag-drop |
| GET | `/api/budget/{trip_id}` | No | Recharts budget |
| POST | `/api/budget/{trip_id}/expenses` | No | Add expense |
| POST | `/api/sharing/{trip_id}/share` | Yes | Create share link |
| GET | `/api/sharing/{slug}` | No | Public trip view |
| DELETE | `/api/sharing/{trip_id}/share` | Yes | Revoke share |
| POST | `/api/ai/plan-trip` | No | AI trip generation |
| POST | `/api/ai/plan-trip/save` | No | AI generate + save |
| GET | `/api/health` | No | Health check |

---

## 🗄️ Database Models

### Key fields added for team integration:

**Trip:**
- `destination_count` — computed from stops count (Kavya's dashboard)
- `cover_photo_url` — hero image URL (Kavya)
- `status` — planning/confirmed/completed/cancelled

**Stop / Activity:**
- `latitude`, `longitude` — on every Stop and Activity (Farhan's Mapbox)
- `image_url`, `rating` — on every Activity

---

## 🔑 Environment Variables (`.env`)

```env
# Required
DATABASE_URL=sqlite+aiosqlite:///./globetrotter.db
JWT_SECRET=change-me-in-production-long-random-string

# Optional (AI features)
GEMINI_API_KEY=your_gemini_api_key_here
MAPBOX_TOKEN=your_mapbox_token_here

# Production (Neon PostgreSQL)
# DATABASE_URL=postgresql+asyncpg://user:pass@ep-xyz.neon.tech/globetrotter?sslmode=require
```

---

## 🌱 Seed Data

```bash
python seed_data.py
```

Populates:
- **1 demo user** — `explorer@globetrotter.io` / `Demo1234!`
- **Japan Adventure** (6 days, 2 cities, 6 activities, 3 expenses)
- **Barcelona Long Weekend** (3 days, 1 city, 3 activities, 2 expenses)

All activities have `latitude`, `longitude`, `image_url`, `rating`. Safe to re-run (idempotent).

---

## 🛢️ Database Migrations (Alembic)

```bash
# Create a new migration
alembic revision --autogenerate -m "add new table"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

> For dev: migrations aren't needed — `create_all` runs on startup.  
> For production (Neon PostgreSQL): run `alembic upgrade head` before starting.

---

## ✅ Verified Working (2026-08-22)

| Group | Status |
|-------|--------|
| Auth (signup, login, forgot-password, /me) | ✅ All passing |
| Users (me, get by id, update) | ✅ All passing |
| Trips (create, list, get, patch, delete) | ✅ All passing |
| Stops (add, get, delete) | ✅ All passing |
| Cities (search, get, save, unsave) | ✅ All passing |
| Activities (search, filter, get, create) | ✅ All passing |
| Itinerary (create day, add activity, delete, reorder) | ✅ All passing |
| Budget (breakdown with Recharts format, add expense) | ✅ All passing |
| Sharing (create link, public view, revoke) | ✅ All passing |
| Health / Root | ✅ All passing |

---

## 🤝 Team Integration

### Kavya (Frontend)
- JWT auth: header `Authorization: Bearer <token>`
- `TripResponse` includes `destination_count` and `cover_photo_url`
- Token lifetime: 7 days

### Farhan (Maps)
- All `Stop` objects → `latitude`, `longitude`
- All `Activity` objects → `latitude`, `longitude`
- `/api/cities/search` → 10 cities with lat/lng, `cover_image_url`

### Team Lead (AI)
- `POST /api/ai/plan-trip` accepts natural language prompt
- Set `GEMINI_API_KEY` in `.env` for real AI; falls back to mock data

---

## 📖 See Also

- [`KRISHNA_IMPLEMENTATION_PLAN.md`](./KRISHNA_IMPLEMENTATION_PLAN.md) — Full technical plan (architecture, decisions, team notes)
- http://localhost:8000/docs — Interactive Swagger UI
- http://localhost:8000/redoc — ReDoc API reference
