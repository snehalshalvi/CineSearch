import time
import numpy as np
from typing import List, Dict, Any, Optional
from backend.retrieval.preprocessing import (
    preprocess,
    preprocess_steps_breakdown,
    tokenize
)
from backend.retrieval.indexing import InvertedIndex
from backend.retrieval.vectorizer import MovieTfidfVectorizer
from backend.retrieval.similarity import (
    compute_cosine_similarity,
    compute_doc_to_doc_similarity
)
from backend.retrieval.ranking import SearchRanker

class SearchEngine:
    """
    Central Information Retrieval Engine for CineSearch.
    Orchestrates preprocessing, inverted indexing, TF-IDF vectorization,
    cosine similarity calculation, and ranked search retrieval.
    """
    def __init__(self):
        self.preprocessor = preprocess
        self.inverted_index = InvertedIndex()
        self.vectorizer = MovieTfidfVectorizer()
        self.ranker = SearchRanker()
        self.movies_lookup: Dict[int, Dict[str, Any]] = {}
        self.is_initialized: bool = False

    def build_document_representation(self, movie: Dict[str, Any]) -> str:
        """
        Construct a weighted document representation for a movie.
        Emphasizes title and overview while including genres, keywords, cast, and director.
        """
        title = movie.get("title", "")
        overview = movie.get("overview", "")
        genres = " ".join(movie.get("genres", []))
        keywords = " ".join(movie.get("keywords", []))
        cast = " ".join(movie.get("cast", [])[:4])
        director = movie.get("director", "")

        # Sensible field weighting: repeat title and overview for higher term frequency
        doc_text = f"{title} {title} {overview} {overview} {genres} {keywords} {cast} {director}"
        return doc_text

    def initialize(self, movies: List[Dict[str, Any]]):
        """
        Ingest movies into the retrieval engine:
        1. Tokenize and preprocess all documents.
        2. Construct the Inverted Index.
        3. Fit TF-IDF Vectorizer and create sparse document matrix.
        """
        if not movies:
            return

        self.movies_lookup = {m["id"]: m for m in movies}

        tokenized_docs = {}
        vectorizer_docs = []

        for movie in movies:
            doc_id = movie["id"]
            doc_text = self.build_document_representation(movie)
            tokens = self.preprocessor(doc_text)
            tokenized_docs[doc_id] = tokens
            vectorizer_docs.append((doc_id, tokens))

        # 1. Build Inverted Index
        self.inverted_index.build(tokenized_docs)

        # 2. Fit TF-IDF Vectorizer
        self.vectorizer.fit_transform(vectorizer_docs)

        self.is_initialized = True

    def search(
        self,
        query: str,
        limit: int = 10,
        offset: int = 0,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: str = "relevance",
        mode: str = "natural"
    ) -> Dict[str, Any]:
        """
        Execute natural language search using the IR pipeline:
        query -> preprocess -> vector transform -> cosine similarity -> ranking & filtering.
        """
        start_time = time.perf_counter()

        if not self.is_initialized or not query.strip():
            return {
                "query": query,
                "processed_query": "",
                "tokens": [],
                "total_results": 0,
                "execution_time_ms": 0.0,
                "mode": mode,
                "results": [],
                "suggestions": []
            }

        # 1. Text Preprocessing
        query_tokens = self.preprocessor(query)
        processed_query_str = " ".join(query_tokens)

        # 2. Query Vector Transformation
        query_vec = self.vectorizer.transform_query(query_tokens)

        # 3. Cosine Similarity Computation
        similarity_scores = compute_cosine_similarity(query_vec, self.vectorizer.tfidf_matrix)

        # 4. Ranked Document Retrieval & Filtering
        ranking_result = self.ranker.filter_and_rank(
            scores=similarity_scores,
            doc_ids=self.vectorizer.doc_ids,
            movies_lookup=self.movies_lookup,
            query_terms=query_tokens,
            filters=filters,
            sort_by=sort_by,
            limit=limit,
            offset=offset,
            inverted_index=self.inverted_index
        )

        exec_time = (time.perf_counter() - start_time) * 1000

        # Suggestions if low or 0 results
        suggestions = []
        if ranking_result["total_results"] < 3:
            suggestions = self.get_query_suggestions(query_tokens)

        return {
            "query": query,
            "processed_query": processed_query_str,
            "tokens": query_tokens,
            "total_results": ranking_result["total_results"],
            "execution_time_ms": round(exec_time, 2),
            "mode": mode,
            "results": ranking_result["results"],
            "suggestions": suggestions
        }

    def analyze_query(self, query: str, top_k: int = 10) -> Dict[str, Any]:
        """
        Deep Information Retrieval analysis for the IR Lab page.
        Returns live calculations of every stage:
        - Tokenization & Stop-word removal steps
        - Query term TF, IDF, and TF-IDF weights
        - Inverted index lookups with real postings
        - Top 10 documents with exact cosine similarity scores
        - Retrieval matrix sparsity and collection statistics
        """
        if not self.is_initialized or not query.strip():
            return {
                "error": "Retrieval engine not initialized or query empty."
            }

        start_time = time.perf_counter()

        # Step 1: Preprocessing breakdown
        prep_breakdown = preprocess_steps_breakdown(query)
        query_tokens = prep_breakdown["final_processed_terms"]

        # Step 2: TF-IDF vector analysis for query
        term_weights = self.vectorizer.get_query_term_weights(query_tokens)

        # Step 3: Inverted index lookups for each query term
        inverted_lookups = []
        for term in sorted(set(query_tokens)):
            lookup_res = self.inverted_index.lookup(
                term=term,
                doc_metadata=self.movies_lookup,
                max_preview=8
            )
            inverted_lookups.append(lookup_res)

        # Step 4: Cosine similarity calculation
        query_vec = self.vectorizer.transform_query(query_tokens)
        sim_scores = compute_cosine_similarity(query_vec, self.vectorizer.tfidf_matrix)

        # Top documents by cosine similarity
        top_indices = np.argsort(sim_scores)[::-1][:top_k]
        top_ranked_docs = []

        for rank, idx in enumerate(top_indices, start=1):
            score = float(sim_scores[idx])
            if score <= 0.0001:
                break
            doc_id = self.vectorizer.doc_ids[idx]
            movie = self.movies_lookup.get(doc_id, {})

            # Calculate document term overlap
            matched = [t for t in query_tokens if self.inverted_index.get_postings(t).get(doc_id)]

            top_ranked_docs.append({
                "rank": rank,
                "doc_id": doc_id,
                "title": movie.get("title", f"Doc {doc_id}"),
                "genres": movie.get("genres", []),
                "release_year": movie.get("release_year"),
                "rating": movie.get("rating"),
                "cosine_similarity": round(score, 4),
                "matched_terms": matched
            })

        exec_time = (time.perf_counter() - start_time) * 1000

        # Collection stats
        vocab_stats = self.vectorizer.get_stats()
        index_stats = self.inverted_index.get_stats()

        return {
            "query": query,
            "preprocessing": prep_breakdown,
            "query_terms": term_weights,
            "inverted_index_lookups": inverted_lookups,
            "top_ranked_documents": top_ranked_docs,
            "retrieval_metrics": {
                "execution_time_ms": round(exec_time, 2),
                "total_documents": index_stats.get("total_documents", 0),
                "vocabulary_size": vocab_stats.get("num_features", 0),
                "matrix_sparsity_pct": vocab_stats.get("matrix_sparsity_pct", 0.0),
                "avg_doc_length": index_stats.get("avg_document_length", 0)
            },
            "formula_explanations": {
                "tf": "Term Frequency: tf(t, d) = count of term t in document d (sublinear log-scaling: 1 + log(tf)).",
                "idf": "Inverse Document Frequency: idf(t) = log((1 + N) / (1 + df(t))) + 1, where N is total docs.",
                "tfidf": "TF-IDF Weight: tfidf(t, d) = tf(t, d) * idf(t), followed by L2 vector normalization.",
                "cosine_similarity": "Cosine Similarity: sim(q, d) = (q · d) / (||q|| * ||d||). Measures angle between high-dimensional vector representations."
            }
        }

    def get_similar_movies(self, movie_id: int, top_n: int = 6) -> List[Dict[str, Any]]:
        """
        Find similar movies using content-based TF-IDF cosine similarity
        between the selected movie's vector and all other movies in the corpus.
        """
        if not self.is_initialized or movie_id not in self.vectorizer.doc_id_to_row:
            return []

        row_idx = self.vectorizer.doc_id_to_row[movie_id]
        scores = compute_doc_to_doc_similarity(row_idx, self.vectorizer.tfidf_matrix)

        # Exclude self
        scores[row_idx] = 0.0

        top_indices = np.argsort(scores)[::-1][:top_n]
        similar_movies = []

        for idx in top_indices:
            score = float(scores[idx])
            if score <= 0.001:
                break
            doc_id = self.vectorizer.doc_ids[idx]
            movie = self.movies_lookup.get(doc_id)
            if movie:
                similar_movies.append({
                    **movie,
                    "similarity_score": round(score, 4)
                })

        return similar_movies

    def get_query_suggestions(self, query_tokens: List[str], limit: int = 5) -> List[str]:
        """Suggest terms from the vocabulary that appear frequently or share prefix."""
        if not self.inverted_index or not query_tokens:
            return []

        suggestions = set()
        for token in query_tokens:
            # Look for vocabulary terms sharing prefix or close in alphabet
            for term, entry in self.inverted_index.index.items():
                if entry["df"] >= 5 and term != token:
                    if term.startswith(token[:3]) or token.startswith(term[:3]):
                        suggestions.add(term)
                        if len(suggestions) >= limit:
                            break
            if len(suggestions) >= limit:
                break

        return list(suggestions)

# Global singleton instance of SearchEngine
search_engine = SearchEngine()
