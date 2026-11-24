import numpy as np
from scipy.sparse import csr_matrix
from typing import List, Tuple

def compute_cosine_similarity(query_vector: csr_matrix, doc_matrix: csr_matrix) -> np.ndarray:
    """
    Calculate Cosine Similarity between the normalized query vector
    and all indexed document vectors.
    
    Formula:
        CosineSimilarity(q, d) = (q · d) / (||q|| * ||d||)
        Since vectors in scikit-learn TfidfVectorizer are L2-normalized (||v|| = 1),
        CosineSimilarity(q, d) reduces directly to the inner product: q · d^T.
    """
    if query_vector.nnz == 0 or doc_matrix.nnz == 0:
        return np.zeros(doc_matrix.shape[0])

    # Dot product of 1 x V query vector with V x N transposed doc matrix
    # Result is a 1 x N sparse matrix
    sim_scores = query_vector.dot(doc_matrix.T).toarray().flatten()

    # Clip slight floating-point overflows to [0.0, 1.0]
    np.clip(sim_scores, 0.0, 1.0, out=sim_scores)
    return sim_scores

def compute_doc_to_doc_similarity(doc_idx: int, doc_matrix: csr_matrix) -> np.ndarray:
    """Compute cosine similarity between a single document vector and all other documents."""
    doc_vec = doc_matrix[doc_idx]
    sim_scores = doc_vec.dot(doc_matrix.T).toarray().flatten()
    np.clip(sim_scores, 0.0, 1.0, out=sim_scores)
    return sim_scores
