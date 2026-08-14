from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    google_api_key: str = ""
    google_client_id: str = "348587986514-gf6budng6k6ko1cdqmeb6ni3nba21c4t.apps.googleusercontent.com"
    secret_key: str = "cashflow-guardian-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite+aiosqlite:///./cashflow_guardian.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
