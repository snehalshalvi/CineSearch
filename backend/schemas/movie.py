from typing import List, Optional
from pydantic import BaseModel

class MovieBase(BaseModel):
    title: str
    overview: Optional[str] = ""
    genres: List[str] = []
    keywords: List[str] = []
    release_date: Optional[str] = None
    release_year: Optional[int] = None
    language: Optional[str] = "en"
    rating: Optional[float] = 0.0
    vote_count: Optional[int] = 0
    popularity: Optional[float] = 0.0
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    cast: List[str] = []
    director: Optional[str] = None
    runtime: Optional[int] = None

class MovieResponse(MovieBase):
    id: int
    tmdb_id: Optional[int] = None
    model_config = {"from_attributes": True}

class MovieSearchResult(MovieResponse):
    relevance_score: float
    rank: int
    matched_terms: List[str]
    explanation: str
    term_contributions: Optional[dict] = None
