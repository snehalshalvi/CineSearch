import numpy as np
from typing import List, Dict, Tuple, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import csr_matrix
from backend.retrieval.preprocessing import preprocess

def dummy_tokenizer(tokens: List[str]) -> List[str]:
    """Identity tokenizer since documents are pre-tokenized."""
    return tokens

class MovieTfidfVectorizer:
    """
    TF-IDF Vectorizer wrapper using scikit-learn.
    Fits once on the corpus of movies and transforms query vectors.
    Computes exact TF-IDF term weights and IDF values for IR analysis.
    """
    def __init__(self, min_df: int = 1, max_df: float = 0.98, sublinear_tf: bool = True):
        self.vectorizer = TfidfVectorizer(
            tokenizer=dummy_tokenizer,
            preprocessor=None,
            lowercase=False,
            token_pattern=None,
            min_df=min_df,
            max_df=max_df,
            sublinear_tf=sublinear_tf,
            norm="l2"
        )
        self.tfidf_matrix: Optional[csr_matrix] = None
        self.doc_ids: List[int] = []
        self.doc_id_to_row: Dict[int, int] = {}
        self.is_fitted: bool = False

    def fit_transform(self, documents: List[Tuple[int, List[str]]]):
        """
        Fit vectorizer and compute document TF-IDF matrix.
        documents: [(doc_id, [token1, token2, ...]), ...]
        """
        self.doc_ids = [doc_id for doc_id, _ in documents]
        self.doc_id_to_row = {doc_id: i for i, doc_id in enumerate(self.doc_ids)}
        token_lists = [tokens for _, tokens in documents]

        # Prevent sklearn ValueError when n_doc is small (e.g., in unit tests)
        if len(documents) <= 2:
            self.vectorizer.max_df = 1.0

        self.tfidf_matrix = self.vectorizer.fit_transform(token_lists)
        self.is_fitted = True

    def transform_query(self, query_tokens: List[str]) -> csr_matrix:
        """Transform tokenized query into TF-IDF vector."""
        if not self.is_fitted:
            raise RuntimeError("Vectorizer has not been fitted yet.")
        return self.vectorizer.transform([query_tokens])

    def get_query_term_weights(self, query_tokens: List[str]) -> List[Dict[str, Any]]:
        """
        Compute term frequencies, IDFs, and TF-IDF weights for each query term.
        Used for transparent IR Lab analysis.
        """
        if not self.is_fitted or not query_tokens:
            return []

        vocab = self.vectorizer.vocabulary_
        idf_array = self.vectorizer.idf_
        q_vec = self.transform_query(query_tokens).tocoo()

        weights_map = {vocab_idx: weight for vocab_idx, weight in zip(q_vec.col, q_vec.data)}

        # Count raw term frequencies in query
        tf_counts = {}
        for t in query_tokens:
            tf_counts[t] = tf_counts.get(t, 0) + 1

        results = []
        for term in sorted(set(query_tokens)):
            if term in vocab:
                idx = vocab[term]
                idf = float(idf_array[idx])
                weight = float(weights_map.get(idx, 0.0))
                in_vocab = True
            else:
                idf = 0.0
                weight = 0.0
                in_vocab = False

            results.append({
                "term": term,
                "tf": tf_counts[term],
                "idf": round(idf, 4),
                "tfidf_weight": round(weight, 4),
                "in_vocabulary": in_vocab
            })

        return results

    def get_feature_names(self) -> List[str]:
        return self.vectorizer.get_feature_names_out().tolist()

    def get_stats(self) -> Dict[str, Any]:
        if not self.is_fitted:
            return {"status": "not_fitted"}
        matrix = self.tfidf_matrix
        density = (matrix.nnz / (matrix.shape[0] * matrix.shape[1])) * 100 if matrix is not None else 0
        return {
            "num_documents": len(self.doc_ids),
            "num_features": len(self.vectorizer.vocabulary_),
            "non_zero_elements": int(matrix.nnz) if matrix is not None else 0,
            "matrix_density_pct": round(density, 4),
            "matrix_sparsity_pct": round(100 - density, 4)
        }
