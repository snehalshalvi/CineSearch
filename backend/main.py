import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure root workspace is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.database.database import init_db, SessionLocal
from backend.models.movie import Movie
from backend.api.routes import router as api_router
from backend.retrieval.search_engine import search_engine
from backend.scripts.ingest_movies import ingest_from_sample, ingest_from_csv, MOVIES_CSV

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and IR Engine
    print("[CineSearch] Initializing Database...")
    init_db()

    session = SessionLocal()
    try:
        movie_count = session.query(Movie).count()
        if movie_count == 0:
            print("[CineSearch] Database is empty. Loading initial movie dataset...")
            if os.path.exists(MOVIES_CSV):
                print("[CineSearch] Ingesting full TMDB 5000 dataset...")
                ingest_from_csv(session)
            else:
                print("[CineSearch] Ingesting verified cinematic sample dataset...")
                ingest_from_sample(session)

        # Build Information Retrieval Index
        movies = session.query(Movie).all()
        movies_data = [m.to_dict() for m in movies]
        print(f"[CineSearch] Initializing Information Retrieval Engine with {len(movies_data)} movies...")
        search_engine.initialize(movies_data)
        stats = search_engine.vectorizer.get_stats()
        print(f"[CineSearch] IR Engine ready. Vocabulary: {stats.get('num_features')} terms. Matrix Sparsity: {stats.get('matrix_sparsity_pct')}%.")
    finally:
        session.close()

    yield
    print("[CineSearch] Shutting down backend...")

app = FastAPI(
    title="CineSearch API",
    description="Natural-Language Movie Search Engine Using Information Retrieval Algorithms (TF-IDF, Cosine Similarity, Inverted Index)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "name": "CineSearch - Natural-Language Movie Search Engine",
        "status": "online",
        "docs_url": "/docs",
        "ir_status_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
