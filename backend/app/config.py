import os

class Settings:
    PROJECT_NAME: str = "JurisShorts API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./juris_shorts.db")
    
    # Admin Security
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "juris_admin_secret_key_2026")
    
    # CORS Origins - Strictly decoupled consumer and admin origins
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",  # Consumer Web / PWA
        "http://localhost:3001",  # Decoupled Admin Dashboard
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://app.jurisshorts.com",
        "https://admin.jurisshorts.com",
    ]
    
    # AI Engine Defaults
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_AUTO_PUBLISH_THRESHOLD: float = 0.95
    AUTO_PUBLISH_DEFAULT_ENABLED: bool = True
    
    # Push Notifications
    VAPID_PUBLIC_KEY: str = os.getenv("VAPID_PUBLIC_KEY", "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZ_F9w5cEQZ9E5vU7I_SampleKey")
    VAPID_PRIVATE_KEY: str = os.getenv("VAPID_PRIVATE_KEY", "SamplePrivateKey")
    VAPID_CLAIMS_EMAIL: str = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:alerts@jurisshorts.com")

settings = Settings()
