import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "GlobeTrotter API"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./globetrotter.db"
    
    # Secrets & External APIs
    JWT_SECRET: str = "super-secret-globetrotter-hackathon-jwt-key-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    GEMINI_API_KEY: Optional[str] = None
    MAPBOX_TOKEN: Optional[str] = None
    GOOGLE_PLACES_API_KEY: Optional[str] = None
    CLOUDINARY_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
