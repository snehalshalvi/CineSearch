from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from backend.schemas.movie import MovieSearchResult

class SearchFilters(BaseModel):
    genre: Optional[str] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    language: Optional[str] = None
    min_rating: Optional[float] = None

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Natural language search query")
    limit: Optional[int] = Field(10, ge=1, le=100)
    offset: Optional[int] = Field(0, ge=0)
    filters: Optional[SearchFilters] = None
    sort_by: Optional[str] = Field("relevance", description="relevance | year | rating")
    mode: Optional[str] = Field("natural", description="natural | forgotten")

class SearchResponse(BaseModel):
    query: str
    processed_query: str
    tokens: List[str]
    total_results: int
    execution_time_ms: float
    mode: str
    results: List[MovieSearchResult]
    filters_applied: Optional[SearchFilters] = None
    suggestions: List[str] = []

class PreprocessingStep(BaseModel):
    step_name: str
    description: str
    result: Any

class QueryTermAnalysis(BaseModel):
    term: str
    stemmed: str
    term_frequency: int
    idf: float
    tfidf_weight: float
    document_frequency: int

class InvertedIndexLookupResult(BaseModel):
    term: str
    doc_frequency: int
    postings: List[Dict[str, Any]]

class IRAnalysisResponse(BaseModel):
    query: str
    preprocessing_steps: List[PreprocessingStep]
    query_terms: List[QueryTermAnalysis]
    inverted_index_lookups: List[InvertedIndexLookupResult]
    top_ranked_documents: List[Dict[str, Any]]
    retrieval_metrics: Dict[str, Any]
    formula_explanations: Dict[str, str]

class SearchHistoryResponse(BaseModel):
    id: int
    query: str
    timestamp: Optional[str]
    result_count: int
    execution_time_ms: float
    mode: str

class FilterOptionsResponse(BaseModel):
    genres: List[str]
    languages: List[str]
    year_min: int
    year_max: int
    rating_min: float
    rating_max: float
    total_movies: int
