import time
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.database.database import get_db
from backend.models.movie import Movie
from backend.models.search_history import SearchHistory
from backend.schemas.movie import MovieResponse, MovieSearchResult
from backend.schemas.search import (
    SearchRequest,
    SearchResponse,
    SearchFilters,
    IRAnalysisResponse,
    SearchHistoryResponse,
    FilterOptionsResponse,
)
from backend.retrieval.search_engine import search_engine

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    stats = search_engine.vectorizer.get_stats() if search_engine.is_initialized else {}
    return {
        "status": "healthy",
        "app": "CineSearch",
        "version": "1.0.0",
        "retrieval_engine_initialized": search_engine.is_initialized,
        "indexed_documents": len(search_engine.movies_lookup),
        "vocabulary_size": stats.get("num_features", 0)
    }

@router.get("/movies")
def get_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    genre: Optional[str] = None,
    year: Optional[int] = None,
    sort_by: Optional[str] = "rating",
    db: Session = Depends(get_db)
):
    query = db.query(Movie)

    if genre:
        query = query.filter(Movie.genres.ilike(f"%{genre}%"))
    if year:
        query = query.filter(Movie.release_year == year)

    if sort_by == "year":
        query = query.order_by(desc(Movie.release_year))
    elif sort_by == "popularity":
        query = query.order_by(desc(Movie.popularity))
    else:
        query = query.order_by(desc(Movie.rating), desc(Movie.vote_count))

    total = query.count()
    offset = (page - 1) * limit
    movies = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
        "movies": [m.to_dict() for m in movies]
    }

@router.get("/movies/{movie_id}")
def get_movie_detail(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie_dict = movie.to_dict()

    # Get similar movies using TF-IDF cosine similarity
    similar = search_engine.get_similar_movies(movie_id, top_n=6)
    movie_dict["similar_movies"] = similar

    return movie_dict

@router.post("/search", response_model=SearchResponse)
def search_movies(req: SearchRequest, db: Session = Depends(get_db)):
    filters_dict = req.filters.dict() if req.filters else {}
    
    result = search_engine.search(
        query=req.query,
        limit=req.limit or 10,
        offset=req.offset or 0,
        filters=filters_dict,
        sort_by=req.sort_by or "relevance",
        mode=req.mode or "natural"
    )

    # Persist in SearchHistory
    if req.query.strip():
        try:
            history_entry = SearchHistory(
                query=req.query.strip(),
                result_count=result["total_results"],
                execution_time_ms=result["execution_time_ms"],
                mode=req.mode or "natural"
            )
            db.add(history_entry)
            db.commit()
        except Exception:
            db.rollback()

    return SearchResponse(
        query=result["query"],
        processed_query=result["processed_query"],
        tokens=result["tokens"],
        total_results=result["total_results"],
        execution_time_ms=result["execution_time_ms"],
        mode=result["mode"],
        results=result["results"],
        filters_applied=req.filters,
        suggestions=result["suggestions"]
    )

@router.get("/search/history", response_model=List[SearchHistoryResponse])
def get_search_history(limit: int = 15, db: Session = Depends(get_db)):
    history = db.query(SearchHistory).order_by(desc(SearchHistory.timestamp)).limit(limit).all()
    return [h.to_dict() for h in history]

@router.delete("/search/history")
def clear_search_history(db: Session = Depends(get_db)):
    db.query(SearchHistory).delete()
    db.commit()
    return {"message": "Search history cleared successfully"}

@router.get("/search/analysis")
def get_search_analysis(query: str = Query(..., min_length=1), top_k: int = 10):
    analysis = search_engine.analyze_query(query=query, top_k=top_k)
    return analysis

@router.get("/filters", response_model=FilterOptionsResponse)
def get_filters(db: Session = Depends(get_db)):
    movies = db.query(Movie).all()
    genres_set = set()
    langs_set = set()
    years = []
    ratings = []

    for m in movies:
        if m.genres:
            for g in m.genres.split(","):
                clean_g = g.strip()
                if clean_g:
                    genres_set.add(clean_g)
        if m.language:
            langs_set.add(m.language.strip())
        if m.release_year:
            years.append(m.release_year)
        if m.rating:
            ratings.append(m.rating)

    return FilterOptionsResponse(
        genres=sorted(list(genres_set)),
        languages=sorted(list(langs_set)),
        year_min=min(years) if years else 1900,
        year_max=max(years) if years else 2030,
        rating_min=round(min(ratings), 1) if ratings else 0.0,
        rating_max=round(max(ratings), 1) if ratings else 10.0,
        total_movies=len(movies)
    )

@router.get("/trending")
def get_trending_movies(limit: int = 8, db: Session = Depends(get_db)):
    # Highest rated and popular movies
    movies = db.query(Movie).order_by(desc(Movie.rating), desc(Movie.popularity)).limit(limit).all()
    return [m.to_dict() for m in movies]

@router.post("/search/suggestions")
def get_suggestions(payload: dict):
    query = payload.get("query", "")
    tokens = search_engine.preprocessor(query)
    suggestions = search_engine.get_query_suggestions(tokens)
    return {"suggestions": suggestions}

@router.post("/index/rebuild")
def rebuild_index(db: Session = Depends(get_db)):
    movies = db.query(Movie).all()
    movies_data = [m.to_dict() for m in movies]
    search_engine.initialize(movies_data)
    return {
        "status": "success",
        "indexed_movies": len(movies_data),
        "stats": search_engine.vectorizer.get_stats()
    }
