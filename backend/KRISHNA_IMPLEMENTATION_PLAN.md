# 🌍 GlobeTrotter Backend — Krishna's Implementation Plan
### Backend / Database Lead — Hackathon Edition

---

## 📋 Overview

This document describes every decision, file, endpoint, and tech choice made in building the GlobeTrotter FastAPI backend. Written for the team so anyone can pick up, run, and extend this code.

**Server runs at:** `http://localhost:8000`  
**Swagger UI:** `http://localhost:8000/docs`  
**Demo login:** `explorer@globetrotter.io` / `Demo1234!`

---

## 🏗️ Architecture Decision

The backend uses a **Stop-based architecture**:

```
User → Trip → Stop (city) → Activity
                  ↓
              Expense (budget)
```

Each **Stop** represents a city in the itinerary. Each **Activity** belongs to a Stop. This is simpler than the prompt's normalized City/ItineraryDay model and works better for the Gemini AI output which generates stops+activities together.

**Why this was chosen:**
- Gemini AI service already generates `stops[].activities[]` — direct DB mapping
- Fewer joins for the frontend queries
- Mapbox markers work directly off `stop.latitude/longitude` and `activity.latitude/longitude`

---

## 🧱 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Language** | Python | 3.12.7 | Backend language |
| **Framework** | FastAPI | 0.141.1 | Async REST API |
| **Server** | Uvicorn | 0.52.4 | ASGI server with hot-reload |
| **ORM** | SQLAlchemy | 2.0.52 | Async database models |
| **Migrations** | Alembic | 1.19.1 | Schema versioning |
| **DB (dev)** | SQLite + aiosqlite | 0.22.1 | Zero-config local DB |
| **DB (prod)** | PostgreSQL + asyncpg | 0.31.0 | Neon cloud database |
| **Validation** | Pydantic v2 | 2.13.4 | Request/response schemas |
| **Settings** | pydantic-settings | 2.15.0 | `.env` config loading |
| **Auth** | python-jose | 3.5.0 | JWT tokens (HS256) |
| **Hashing** | bcrypt | 5.0.0 | Password hashing (direct, not via passlib) |
| **AI** | google-genai | 2.19.0 | Gemini 1.5 Flash trip generation |
| **HTTP client** | httpx | 0.28.1 | Async external API calls |
| **Env** | python-dotenv | 1.2.3 | Load `.env` file |

> **Important:** We use `bcrypt` directly (not `passlib`) because passlib has a known bug with bcrypt >= 4.x that causes a `ValueError`. This was discovered and fixed during implementation.

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app, routers, middleware, lifespan
│   ├── models/
│   │   └── __init__.py            # ALL SQLAlchemy ORM models (7 models)
│   ├── schemas/
│   │   ├── __init__.py            # Re-exports everything
│   │   └── trip.py                # ALL Pydantic schemas
│   ├── api/
│   │   ├── auth.py                # POST /signup, /login, /forgot-password, /me
│   │   ├── users.py               # GET/PATCH/DELETE /users/me, GET /users/{id}
│   │   ├── trips.py               # Full trip CRUD + PATCH
│   │   ├── stops.py               # Add/Get/Delete stops
│   │   ├── cities.py              # Search cities, save favourites
│   │   ├── activities.py          # Search, get, create activities
│   │   ├── itinerary.py           # Day builder, add/remove activities, reorder
│   │   ├── budget.py              # Budget breakdown + add expenses
│   │   ├── sharing.py             # Create/revoke share links, public view
│   │   └── ai.py                  # Gemini AI trip generation (Team Lead domain)
│   ├── core/
│   │   ├── config.py              # Pydantic settings (reads .env)
│   │   ├── security.py            # hash_password, verify_password, JWT utils
│   │   └── dependencies.py        # get_current_user, get_current_user_optional
│   ├── database/
│   │   └── session.py             # Async engine, AsyncSessionLocal, Base, get_db
│   └── services/
│       └── gemini.py              # Gemini AI service (Team Lead domain)
├── alembic/
│   ├── env.py                     # Async migration config
│   ├── script.py.mako             # Migration template
│   └── versions/                  # Migration files go here
├── alembic.ini                    # Alembic config
├── seed_data.py                   # Run once to populate demo data
├── requirements.txt               # All Python dependencies
├── .env.example                   # Template — copy to .env
└── README.md                      # Setup + running guide
```

---

## 🗄️ Data Models (7 Models)

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID string | Primary key |
| email | String(255) | Unique, indexed |
| username | String(100) | Unique, indexed, optional |
| hashed_password | String(255) | bcrypt hash |
| first_name, last_name | String(100) | Optional |
| bio | Text | Optional profile bio |
| profile_picture_url | Text | Optional avatar URL |
| is_active | Boolean | Default True |
| is_verified | Boolean | Default False |

### Trip
| Field | Type | Notes |
|-------|------|-------|
| id | UUID string | Primary key |
| user_id | FK → users | Nullable (anon trips) |
| name | String(255) | Required |
| status | String(20) | planning/confirmed/completed/cancelled |
| budget / total_budget | Float | Budget (alias pair) |
| currency | String(10) | Default "USD" |
| cover_photo_url | Text | Hero image |
| is_public | Boolean | Controls sharing |
| share_slug | String(100) | Unique URL slug |
| destination_count | computed | Number of stops (in response) |

### Stop (City in itinerary)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID string | Primary key |
| trip_id | FK → trips | Cascade delete |
| city_name, country | String | Required |
| **latitude, longitude** | Float | **For Mapbox (Farhan)** |
| arrival_date, departure_date | String | Optional dates |
| notes | Text | Optional notes |
| order_index | Integer | Sort order |

### Activity
| Field | Type | Notes |
|-------|------|-------|
| id | UUID string | Primary key |
| stop_id | FK → stops | Cascade delete |
| title, description | String/Text | Required |
| category | String(50) | sightseeing/food/nature/culture |
| cost | Float | Per person cost |
| duration_mins | Integer | Duration |
| rating | Float | 1.0–5.0 |
| **latitude, longitude** | Float | **For Mapbox (Farhan)** |
| image_url | Text | Activity photo |
| start_time, end_time | String(10) | "09:00" format |

### Expense
| Field | Type | Notes |
|-------|------|-------|
| category | String | transport/accommodation/activity/meal/other |
| amount | Float | Cost |
| currency | String(10) | Default "USD" |

### SavedDestination
Tracks user favourite cities (user_id + city_id unique pair).

### Share
Public share links. Creating one sets `trip.is_public = True` and generates a unique `slug`.

---

## 📡 Complete API Reference

All endpoints are under `/api` prefix.

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | No | Register, returns JWT |
| POST | `/login` | No | Login, returns JWT |
| POST | `/forgot-password` | No | Reset trigger (MVP stub) |
| GET | `/me` | Yes | Get current user |

### Users — `/api/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | Yes | Full profile |
| GET | `/{user_id}` | No | Public profile |
| PATCH | `/me` | Yes | Update profile |
| DELETE | `/me` | Yes | Delete account |

### Trips — `/api/trips`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Optional | Create trip |
| GET | `/` | Optional | List trips |
| GET | `/{trip_id}` | No | Get with stops+activities+expenses |
| PATCH | `/{trip_id}` | Optional | Update |
| DELETE | `/{trip_id}` | Optional | Hard delete |

### Stops — `/api`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/trips/{trip_id}/stops` | No | Add city stop |
| GET | `/stops/{stop_id}` | No | Get stop with activities |
| DELETE | `/stops/{stop_id}` | No | Remove stop |

### Cities — `/api/cities`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search` | No | Paginated city search |
| GET | `/{city_id}` | No | Get city details |
| POST | `/{city_id}/save` | Yes | Save favourite |
| DELETE | `/{city_id}/save` | Yes | Remove favourite |

### Activities — `/api/activities`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Search with filters |
| GET | `/{id}` | No | Single activity |
| POST | `/` | No | Create for a stop |

### Itinerary — `/api/itinerary`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/{trip_id}/days` | No | Create day (= Stop) |
| GET | `/{trip_id}/days` | No | List days ordered |
| POST | `/{day_id}/activities` | No | Add activity to day |
| DELETE | `/activities/{id}` | No | Remove activity |
| POST | `/reorder` | No | Reorder drag-and-drop |

### Budget — `/api/budget`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/{trip_id}` | No | Recharts breakdown |
| POST | `/{trip_id}/expenses` | No | Add expense |

**Budget Breakdown Format (Recharts):**
```json
{
  "total_budget": 60000,
  "total_expense": 35000,
  "remaining_budget": 25000,
  "is_over_budget": false,
  "breakdown": {
    "transport":     {"amount": 14000, "count": 2, "percentage": 40.0},
    "accommodation": {"amount": 12000, "count": 6, "percentage": 34.3},
    "activity":      {"amount": 6000,  "count": 8, "percentage": 17.1},
    "meal":          {"amount": 3000,  "count": 4, "percentage": 8.6},
    "other":         {"amount": 0,     "count": 0, "percentage": 0.0}
  }
}
```

### Sharing — `/api/sharing`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/{trip_id}/share` | Yes | Create share link |
| GET | `/{slug}` | No | Public trip view |
| DELETE | `/{trip_id}/share` | Yes | Revoke link |

---

## 🔒 Security Design

- **JWT:** HS256, 7-day expiry, signed with `JWT_SECRET`
- **Password:** `bcrypt` with default rounds (12)
- **Auth guard:** `get_current_user` — raises 401 if token missing/invalid
- **Optional auth:** `get_current_user_optional` — returns None if no token
- **Ownership:** Trip update/delete checks `user_id == current_user.id`
- **CORS:** Configured for localhost:3000 and localhost:5173

---

## 🌱 Seed Data

```bash
python seed_data.py
```

Creates demo user + 2 full trips (Japan 6-day, Barcelona 3-day) with 12 activities all having `latitude`, `longitude`, `image_url`, `rating`.

**Demo credentials:** `explorer@globetrotter.io` / `Demo1234!`

---

## ⚠️ Known Issues Fixed

| Issue | Fix Applied |
|-------|------------|
| `ModuleNotFoundError: aiosqlite` | Added to requirements.txt |
| `ValueError: password cannot be longer than 72 bytes` | Used `bcrypt` directly, dropped passlib |
| Old SQLite schema mismatch | Delete `globetrotter.db`, re-run seed |

---

## 🤝 Team Integration Notes

### Kavya (Frontend / React)
- `TripResponse` always has `destination_count` and `cover_photo_url`
- Use `Authorization: Bearer <token>` header
- Token is valid for 7 days

### Farhan (Maps / Discovery)
- Every `Stop` → `latitude`, `longitude`
- Every `Activity` → `latitude`, `longitude`
- `GET /api/cities/search` returns 10 cities with lat/lng

### Team Lead (Gemini AI)
- `POST /api/ai/plan-trip` → `AITripPlanResponse`
- Set `GEMINI_API_KEY` in `.env`

---

*Implemented by Krishna — GlobeTrotter Hackathon Backend Lead, 2026-08-22*
