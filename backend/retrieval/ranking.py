from typing import List, Dict, Any, Optional
import numpy as np

class SearchRanker:
    """
    Ranks movie search results based on Cosine Similarity and handles metadata filtering,
    relevance explanation, and sorting.
    """
    @staticmethod
    def filter_and_rank(
        scores: np.ndarray,
        doc_ids: List[int],
        movies_lookup: Dict[int, Dict[str, Any]],
        query_terms: List[str],
        filters: Optional[Dict[str, Any]] = None,
        sort_by: str = "relevance",
        limit: int = 10,
        offset: int = 0,
        inverted_index = None
    ) -> Dict[str, Any]:
        """
        Apply metadata filters, sort documents, and produce ranked results with IR explanations.
        """
        filters = filters or {}
        filter_genre = (filters.get("genre") or "").strip().lower()
        year_min = filters.get("year_min")
        year_max = filters.get("year_max")
        filter_language = (filters.get("language") or "").strip().lower()
        min_rating = filters.get("min_rating")

        candidates = []
        query_set = set(query_terms)

        for idx, score in enumerate(scores):
            # Only consider documents with non-zero similarity
            if score <= 0.0001:
                continue

            doc_id = doc_ids[idx]
            movie = movies_lookup.get(doc_id)
            if not movie:
                continue

            # Apply Genre Filter
            if filter_genre:
                genres = [g.lower() for g in movie.get("genres", [])]
                if not any(filter_genre in g for g in genres):
                    continue

            # Apply Year Filters
            release_year = movie.get("release_year")
            if year_min is not None and release_year and release_year < year_min:
                continue
            if year_max is not None and release_year and release_year > year_max:
                continue

            # Apply Language Filter
            if filter_language and movie.get("language", "").lower() != filter_language:
                continue

            # Apply Rating Filter
            if min_rating is not None and (movie.get("rating") or 0.0) < min_rating:
                continue

            # Find matching query terms in this document via inverted index or token overlap
            matched = []
            term_contributions = {}
            if inverted_index:
                for q_term in query_set:
                    postings = inverted_index.get_postings(q_term)
                    if doc_id in postings:
                        tf = postings[doc_id]["tf"]
                        matched.append(q_term)
                        term_contributions[q_term] = tf
            else:
                matched = list(query_set)

            candidates.append({
                "doc_id": doc_id,
                "score": float(score),
                "movie": movie,
                "matched_terms": matched,
                "term_contributions": term_contributions
            })

        # Apply Sorting
        if sort_by == "year":
            candidates.sort(key=lambda x: (x["movie"].get("release_year") or 0, x["score"]), reverse=True)
        elif sort_by == "rating":
            candidates.sort(key=lambda x: (x["movie"].get("rating") or 0.0, x["score"]), reverse=True)
        else: # "relevance"
            candidates.sort(key=lambda x: x["score"], reverse=True)

        total_results = len(candidates)
        paginated = candidates[offset : offset + limit]

        ranked_results = []
        for rank, item in enumerate(paginated, start=offset + 1):
            movie_dict = item["movie"]
            score = item["score"]
            matched = item["matched_terms"]
            contributions = item["term_contributions"]

            # Generate natural explanation
            matched_str = ", ".join(matched[:5]) if matched else "topical alignment"
            explanation = (
                f"Rank #{rank} with cosine similarity {score:.4f}. "
                f"Matched terms: {matched_str}."
            )

            result_entry = {
                **movie_dict,
                "relevance_score": round(score, 4),
                "rank": rank,
                "matched_terms": matched,
                "explanation": explanation,
                "term_contributions": contributions
            }
            ranked_results.append(result_entry)

        return {
            "total_results": total_results,
            "results": ranked_results
        }
