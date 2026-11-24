from collections import defaultdict
from typing import Dict, List, Any, Optional

class InvertedIndex:
    """
    Inverted Index implementation for CineSearch.
    Maps stemmed vocabulary terms -> postings dictionary:
    term -> {
        "df": doc_frequency,
        "postings": { doc_id: {"tf": term_frequency, "positions": [int, ...]} }
    }
    """
    def __init__(self):
        self.index: Dict[str, Dict[str, Any]] = {}
        self.doc_lengths: Dict[int, int] = {}
        self.total_docs: int = 0
        self.vocabulary: set = set()

    def build(self, documents: Dict[int, List[str]]):
        """
        Build inverted index from tokenized & stemmed documents.
        documents: { doc_id: ["token1", "token2", ...] }
        """
        self.index.clear()
        self.doc_lengths.clear()
        self.vocabulary.clear()
        self.total_docs = len(documents)

        # Temporary postings accumulator
        raw_postings = defaultdict(lambda: defaultdict(lambda: {"tf": 0, "positions": []}))

        for doc_id, tokens in documents.items():
            self.doc_lengths[doc_id] = len(tokens)
            for pos, token in enumerate(tokens):
                raw_postings[token][doc_id]["tf"] += 1
                raw_postings[token][doc_id]["positions"].append(pos)
                self.vocabulary.add(token)

        for term, doc_map in raw_postings.items():
            self.index[term] = {
                "df": len(doc_map),
                "postings": dict(doc_map)
            }

    def get_document_frequency(self, term: str) -> int:
        entry = self.index.get(term)
        return entry["df"] if entry else 0

    def get_postings(self, term: str) -> Dict[int, Dict[str, Any]]:
        entry = self.index.get(term)
        return entry["postings"] if entry else {}

    def lookup(self, term: str, doc_metadata: Optional[Dict[int, Any]] = None, max_preview: int = 10) -> Dict[str, Any]:
        """
        Lookup a term in the inverted index.
        Returns metadata for display in the IR Lab dashboard.
        """
        entry = self.index.get(term)
        if not entry:
            return {
                "term": term,
                "found": False,
                "df": 0,
                "postings": []
            }

        postings_list = []
        for doc_id, data in list(entry["postings"].items())[:max_preview]:
            title = "Document #" + str(doc_id)
            if doc_metadata and doc_id in doc_metadata:
                title = doc_metadata[doc_id].get("title", title)

            postings_list.append({
                "doc_id": doc_id,
                "title": title,
                "tf": data["tf"],
                "positions": data["positions"][:5]  # first 5 occurrences
            })

        return {
            "term": term,
            "found": True,
            "df": entry["df"],
            "total_docs": self.total_docs,
            "postings": postings_list
        }

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_documents": self.total_docs,
            "vocabulary_size": len(self.vocabulary),
            "avg_document_length": round(sum(self.doc_lengths.values()) / max(1, self.total_docs), 2)
        }
