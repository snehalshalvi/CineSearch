import pytest
import numpy as np
from backend.retrieval.preprocessing import (
    clean_text,
    tokenize,
    remove_stopwords,
    stem_token,
    preprocess,
    preprocess_steps_breakdown
)
from backend.retrieval.indexing import InvertedIndex
from backend.retrieval.vectorizer import MovieTfidfVectorizer
from backend.retrieval.similarity import compute_cosine_similarity
from backend.retrieval.ranking import SearchRanker

def test_preprocessing_pipeline():
    raw = "I want a psychological thriller about dreams, mind, and alternate realities!!"
    cleaned = clean_text(raw)
    assert "!" not in cleaned
    assert cleaned == cleaned.lower()

    tokens = tokenize(raw)
    assert "psychological" in tokens
    assert "thriller" in tokens

    filtered, removed = remove_stopwords(tokens)
    assert "want" in removed or "and" in removed
    assert "psychological" in filtered

    stemmed = [stem_token(t) for t in filtered]
    assert len(stemmed) == len(filtered)

    # Full function test
    res = preprocess(raw)
    assert len(res) > 0

    # Step-by-step breakdown
    breakdown = preprocess_steps_breakdown(raw)
    assert "step_1_lowercased" in breakdown
    assert "step_4_stopwords_removed" in breakdown
    assert len(breakdown["final_processed_terms"]) > 0

def test_inverted_index():
    index = InvertedIndex()
    docs = {
        1: ["psycholog", "thriller", "dream", "realiti"],
        2: ["space", "wormhol", "time", "travel"],
        3: ["dream", "subconsci", "heist", "realiti"]
    }
    index.build(docs)

    assert index.get_document_frequency("dream") == 2
    assert index.get_document_frequency("space") == 1
    assert index.get_document_frequency("nonexistent") == 0

    postings = index.get_postings("dream")
    assert 1 in postings
    assert 3 in postings
    assert postings[1]["tf"] == 1

    lookup = index.lookup("dream")
    assert lookup["found"] is True
    assert lookup["df"] == 2
    assert len(lookup["postings"]) == 2

def test_tfidf_vectorizer_and_similarity():
    vectorizer = MovieTfidfVectorizer()
    docs = [
        (1, ["dream", "subconsci", "realiti", "heist"]),
        (2, ["space", "time", "travel", "black", "hole"]),
        (3, ["psycholog", "thriller", "twist", "end"])
    ]
    vectorizer.fit_transform(docs)
    assert vectorizer.is_fitted
    assert vectorizer.tfidf_matrix.shape[0] == 3

    # Query transformation
    q_vec = vectorizer.transform_query(["dream", "realiti"])
    scores = compute_cosine_similarity(q_vec, vectorizer.tfidf_matrix)

    # Document 1 should have highest similarity
    assert scores[0] > scores[1]
    assert scores[0] > scores[2]
    assert np.all(scores >= 0.0)
    assert np.all(scores <= 1.0)

def test_metadata_filtering_and_ranking():
    scores = np.array([0.85, 0.45, 0.0])
    doc_ids = [101, 102, 103]
    lookup = {
        101: {"id": 101, "title": "Inception", "genres": ["Action", "Sci-Fi"], "release_year": 2010, "rating": 8.4},
        102: {"id": 102, "title": "Interstellar", "genres": ["Adventure", "Sci-Fi"], "release_year": 2014, "rating": 8.6},
        103: {"id": 103, "title": "Random", "genres": ["Comedy"], "release_year": 1995, "rating": 5.0}
    }

    # No filter
    ranked = SearchRanker.filter_and_rank(
        scores=scores,
        doc_ids=doc_ids,
        movies_lookup=lookup,
        query_terms=["dream"]
    )
    assert ranked["total_results"] == 2
    assert ranked["results"][0]["id"] == 101

    # Filter by genre
    ranked_genre = SearchRanker.filter_and_rank(
        scores=scores,
        doc_ids=doc_ids,
        movies_lookup=lookup,
        query_terms=["dream"],
        filters={"genre": "Adventure"}
    )
    assert ranked_genre["total_results"] == 1
    assert ranked_genre["results"][0]["id"] == 102

    # Filter by min rating
    ranked_rating = SearchRanker.filter_and_rank(
        scores=scores,
        doc_ids=doc_ids,
        movies_lookup=lookup,
        query_terms=["dream"],
        filters={"min_rating": 8.5}
    )
    assert ranked_rating["total_results"] == 1
    assert ranked_rating["results"][0]["id"] == 102

def test_empty_and_unknown_query():
    vectorizer = MovieTfidfVectorizer()
    docs = [(1, ["apple", "banana"])]
    vectorizer.fit_transform(docs)

    # Unknown words should produce zero vector
    q_vec = vectorizer.transform_query(["quantum", "physics"])
    assert q_vec.nnz == 0
    scores = compute_cosine_similarity(q_vec, vectorizer.tfidf_matrix)
    assert np.all(scores == 0.0)
