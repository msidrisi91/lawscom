from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import Base, engine, SessionLocal
from app.seed.seeder import seed_database

# Consumer routers
from app.api.v1.feed import router as feed_router
from app.api.v1.statutes import router as statutes_router
from app.api.v1.daily_law import router as daily_law_router
from app.api.v1.push import router as push_router

# Decoupled Admin routers
from app.api.v1.admin.triage import router as admin_triage_router
from app.api.v1.admin.broadcast import router as admin_broadcast_router
from app.api.v1.admin.engine import router as admin_engine_router
from app.api.v1.admin.manual import router as admin_manual_router

# Initialize tables
Base.metadata.create_all(bind=engine)

# Seed database on boot
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for JurisShorts: 60-word micro-reader for lawyers and citizens."
)

# CORS Middleware with strict origin whitelisting
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Public Consumer Routers
app.include_router(feed_router, prefix=settings.API_V1_STR)
app.include_router(statutes_router, prefix=settings.API_V1_STR)
app.include_router(daily_law_router, prefix=settings.API_V1_STR)
app.include_router(push_router, prefix=settings.API_V1_STR)

# Mount Protected Decoupled Admin Routers
app.include_router(admin_triage_router, prefix=settings.API_V1_STR)
app.include_router(admin_broadcast_router, prefix=settings.API_V1_STR)
app.include_router(admin_engine_router, prefix=settings.API_V1_STR)
app.include_router(admin_manual_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JurisShorts Legal Intelligence API",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
