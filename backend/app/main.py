"""
GlobeTrotter FastAPI Application Entry Point.

Startup flow:
1. Create all DB tables (SQLite: instant; PostgreSQL: use alembic upgrade head)
2. Mount all API routers
3. Add CORS + request logging middleware
4. Expose health check and root endpoints
"""
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import Base, engine
from app.api import auth, trips, stops, cities, activities, itinerary, budget, ai, sharing, users

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("globetrotter")


# ---------------------------------------------------------------------------
# Lifespan: DB init on startup, cleanup on shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all tables on startup. Dispose engine on shutdown."""
    logger.info("🚀 GlobeTrotter API starting up...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables ready.")
    yield
    await engine.dispose()
    logger.info("🛑 GlobeTrotter API shut down.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "GlobeTrotter REST API — AI-powered travel planning platform. "
        "Multi-city trips, Mapbox itineraries, budget tracking, and sharing."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every request with method, path, and response time."""
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 1)
    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)"
    )
    return response


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again.", "status": 500},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
PREFIX = settings.API_V1_STR

app.include_router(auth.router,       prefix=PREFIX)
app.include_router(users.router,      prefix=PREFIX)
app.include_router(trips.router,      prefix=PREFIX)
app.include_router(stops.router,      prefix=PREFIX)
app.include_router(cities.router,     prefix=PREFIX)
app.include_router(activities.router, prefix=PREFIX)
app.include_router(itinerary.router,  prefix=PREFIX)
app.include_router(budget.router,     prefix=PREFIX)
app.include_router(sharing.router,    prefix=PREFIX)
app.include_router(ai.router,         prefix=PREFIX)


# ---------------------------------------------------------------------------
# Root & Health endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["Root"])
async def root():
    """API root — returns basic info and links."""
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": f"{PREFIX}/health",
        "environment": settings.ENVIRONMENT,
    }


@app.get(f"{PREFIX}/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring and deployment readiness."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "mapbox_configured": bool(settings.MAPBOX_TOKEN),
    }
