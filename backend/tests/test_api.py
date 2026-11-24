import pytest
from backend.database.database import SessionLocal, init_db
from backend.models.movie import Movie
from backend.retrieval.search_engine import search_engine
from backend.scripts.ingest_movies import ingest_from_sample
from backend.schemas.search import SearchRequest, SearchFilters
from backend.api.routes import (
    health_check,
    get_movies,
    get_movie_detail,
    search_movies,
    get_search_analysis,
    get_filters,
    get_trending_movies,
    get_search_history,
    clear_search_history,
    get_suggestions
)

@pytest.fixture(scope="module")
def db_session():
    init_db()
    session = SessionLocal()
    if session.query(Movie).count() == 0:
        ingest_from_sample(session)
    # Ensure search engine initialized
    movies = session.query(Movie).all()
    search_engine.initialize([m.to_dict() for m in movies])
    yield session
    session.close()

def test_health_endpoint(db_session):
    data = health_check()
    assert data["status"] == "healthy"
    assert data["retrieval_engine_initialized"] is True
    assert data["indexed_documents"] == 25
    assert data["vocabulary_size"] > 0

def test_get_movies_list(db_session):
    res = get_movies(page=1, limit=5, genre="Science Fiction", db=db_session)
    assert res["total"] > 0
    assert len(res["movies"]) <= 5
    assert all("Science Fiction" in m["genres"] for m in res["movies"])

def test_get_movie_detail(db_session):
    movie = db_session.query(Movie).first()
    res = get_movie_detail(movie_id=movie.id, db=db_session)
    assert res["id"] == movie.id
    assert "similar_movies" in res
    assert len(res["similar_movies"]) > 0

def test_search_endpoint_natural_language(db_session):
    req = SearchRequest(
        query="A man trapped inside a dream",
        limit=5,
        sort_by="relevance",
        mode="natural"
    )
    res = search_movies(req=req, db=db_session)
    assert res.total_results > 0
    assert len(res.results) > 0
    titles = [r.title for r in res.results]
    assert "Inception" in titles
    top = res.results[0]
    assert top.relevance_score > 0
    assert len(top.matched_terms) > 0
    assert "Rank #" in top.explanation

def test_search_analysis_ir_lab(db_session):
    data = get_search_analysis(query="time travel alternate realities", top_k=5)
    assert "preprocessing" in data
    assert "query_terms" in data
    assert "inverted_index_lookups" in data
    assert "top_ranked_documents" in data
    assert "retrieval_metrics" in data
    assert "formula_explanations" in data
    assert data["retrieval_metrics"]["total_documents"] == 25

def test_filter_options(db_session):
    data = get_filters(db=db_session)
    assert "Drama" in data.genres
    assert "Science Fiction" in data.genres
    assert data.total_movies == 25
    assert data.rating_min > 0

def test_trending_movies(db_session):
    res = get_trending_movies(limit=4, db=db_session)
    assert len(res) == 4
    assert res[0]["rating"] >= res[-1]["rating"]

def test_search_history_endpoints(db_session):
    # Ensure there's history from previous search test
    hist = get_search_history(limit=10, db=db_session)
    assert len(hist) > 0
    assert hist[0]["query"] == "A man trapped inside a dream"

    # Test clear
    clear_res = clear_search_history(db=db_session)
    assert "cleared" in clear_res["message"]
    assert len(get_search_history(limit=10, db=db_session)) == 0

def test_suggestions(db_session):
    res = get_suggestions({"query": "psycholog"})
    assert "suggestions" in res
