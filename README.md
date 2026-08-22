# 🌍 GlobeTrotter — AI-Powered Multi-City Travel Planner

GlobeTrotter is an intelligent multi-city travel planning web application built for seamless trip creation, itinerary customization, budget tracking, and public sharing. 

Powered by **Gemini AI**, interactive **Mapbox** visualizations, and a **FastAPI + React** architecture, GlobeTrotter converts natural language travel prompts into structured, map-ready itineraries in seconds.

---

## 🛠️ Tech Stack

```text
React 18 + Vite (Frontend)
   │
   ├── REST API (JSON) + Axios Interceptors
   ▼
FastAPI + Pydantic V2 (Backend)
   │
   ├── SQLAlchemy 2.0 Async (Asyncpg / Aiosqlite)
   ▼
PostgreSQL / Neon / SQLite
```

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Lucide Icons
* **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 (Async), Alembic, Pydantic V2, python-jose, bcrypt, httpx
* **Database**: PostgreSQL (Production) / SQLite (Local Dev)
* **AI & External APIs**: Google Gemini API, Mapbox GL, Google Places API

---

## ✨ Features

- 🤖 **Gemini AI Trip Concierge**: Describe your dream vacation in plain text and get a full day-by-day itinerary with estimated budgets and geographic coordinates.
- 🗺️ **Multi-City Itinerary Builder**: Add stops, sequence activities, set durations, and customize day plans.
- 📍 **Mapbox Map Coordinates**: Real-time geolocation markers for cities and individual activity spots.
- 📊 **Budget Tracking & Analytics**: Visual expense category breakdowns (Accommodation, Transport, Food, Activities, Misc) with over-budget alerts.
- 🔗 **Public Trip Sharing**: Generate unique public share links (`/share/{slug}`) for read-only view without requiring login.
- 🔐 **JWT Authentication**: Secure user registration, password hashing with bcrypt, and profile management.
- ⚡ **Mock / Real API Toggle**: Parallel team development support via `VITE_USE_MOCK_API` flag.

---

## 📂 Repository Structure

```text
GlobeTrotter/
├── backend/
│   ├── alembic/              # Alembic database migration scripts
│   ├── app/
│   │   ├── api/              # FastAPI routers (auth, trips, stops, cities, activities, budget, ai, sharing, users)
│   │   ├── core/             # Configuration, security (JWT, bcrypt), dependencies
│   │   ├── database/         # SQLAlchemy async engine & session setup
│   │   ├── models/           # ORM models (User, Trip, Stop, Activity, Expense, Share, SavedDestination)
│   │   ├── schemas/          # Pydantic V2 request & response schemas
│   │   ├── services/         # External integrations (Gemini AI service)
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Async pytest endpoint test suite
│   ├── requirements.txt      # Python dependencies (asyncpg, fastapi, uvicorn, etc.)
│   └── seed_data.py          # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── components/       # UI & Travel components (auth, cards, dialogs, layout)
│   │   ├── pages/            # Page components (Dashboard, MyTrips, CreateTrip, TripDetails, Discover, PublicTrip, Auth)
│   │   ├── services/         # API client & trip service wrapper
│   │   ├── store/            # Zustand auth store
│   │   ├── types/            # TypeScript data contracts & interfaces
│   │   ├── App.tsx           # React Router definition
│   │   └── main.tsx          # React entrypoint
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.ts        # Vite build configuration
├── .env.example              # Sample root environment configuration
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** v18+ and `npm`
* **Python** 3.10+
* **Git**

---

### 1. Environment Setup

Copy `.env.example` to `.env` in the root directory (or inside `backend/`):

```bash
cp .env.example .env
```

Configuration Options:

```ini
# App & Database
ENVIRONMENT=development
DEBUG=True
DATABASE_URL=sqlite+aiosqlite:///./globetrotter.db

# Secrets & Authentication
JWT_SECRET=super-secret-globetrotter-hackathon-jwt-key-2026
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]

# AI & Map Keys
GEMINI_API_KEY=your_gemini_api_key_here
MAPBOX_TOKEN=your_mapbox_public_access_token_here

# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN=your_mapbox_public_access_token_here
VITE_USE_MOCK_API=false
```

---

### 2. Backend Setup & Run

1. Navigate to `backend` directory and activate virtual environment:
   ```bash
   cd backend
   source ../venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * The API will be available at `http://localhost:8000`
   * Interactive Swagger Docs: `http://localhost:8000/docs`
   * API Health Check: `http://localhost:8000/api/health`

---

### 3. Frontend Setup & Run

In a new terminal window:

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start Vite development server:
   ```bash
   npm run dev
   ```
   * The application will open at `http://localhost:5173`

---

## 🧪 Testing & Verification

### Backend Tests (Pytest)

Run the async backend test suite:

```bash
cd backend
PYTHONPATH=. ../venv/bin/pytest tests
```

### Frontend Build & Type Check

Verify TypeScript compilation and build production assets:

```bash
cd frontend
npm run build
```

---

## 📡 Key API Routes Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & API configuration check |
| `POST` | `/api/auth/signup` / `/register` | Create user account & receive Bearer JWT |
| `POST` | `/api/auth/login` | Authenticate user & receive Bearer JWT |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/trips` | List user's trips |
| `POST` | `/api/trips` | Create a new trip |
| `GET` | `/api/trips/{id}` | Get full trip details with stops, activities, and budget |
| `POST` | `/api/ai/plan-trip` | Generate AI itinerary structure from prompt |
| `POST` | `/api/ai/plan-trip/save` | Generate AI itinerary & directly save to database |
| `GET` | `/api/cities/search` | Search city catalogue with latitude/longitude |
| `GET` | `/api/budget/{trip_id}` | Calculate category budget summary |
| `POST` | `/api/sharing/{trip_id}/share` | Generate public share link |
| `GET` | `/api/sharing/{slug}` | Public read-only view of a shared trip |

---

## 👥 Team & Contributions

- **Kavya**: Frontend UI, Dashboard & User Experience
- **Farhan**: Mapbox & Geolocation Integration
- **Krishna**: FastAPI Backend, Database Models & API Schemas
- **Senior Integration**: System Wiring, Contracts & Verification

---

## 📄 License

This project is created for the GlobeTrotter Hackathon.
