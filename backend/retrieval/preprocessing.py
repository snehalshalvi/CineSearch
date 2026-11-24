import re
import string
from typing import List, Dict, Any, Tuple

# Comprehensive English stop words (standard Lucene / NLTK stop list)
DEFAULT_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
    "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had",
    "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
    "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
    "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
    "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your",
    "yours", "yourself", "yourselves", "movie", "film", "want", "find", "looking", "like", "watch"
}

# Try importing NLTK components, fallback safely
try:
    from nltk.corpus import stopwords as nltk_stopwords
    from nltk.stem import PorterStemmer
    from nltk.tokenize import word_tokenize
    _nltk_stopwords = set(nltk_stopwords.words("english"))
    _nltk_stopwords.update({"movie", "film", "want", "find", "looking", "like", "watch", "show"})
    _stemmer = PorterStemmer()
    _HAS_NLTK = True
except Exception:
    _nltk_stopwords = DEFAULT_STOPWORDS
    _stemmer = None
    _HAS_NLTK = False

def get_stopwords() -> set:
    if _HAS_NLTK:
        return _nltk_stopwords
    return DEFAULT_STOPWORDS

def stem_token(token: str) -> str:
    """Stem a single word token using Porter Stemmer or fallback rule-based suffix trimmer."""
    if _HAS_NLTK and _stemmer:
        try:
            return _stemmer.stem(token)
        except Exception:
            pass
    # Simple rule-based suffix normalization fallback
    token = token.lower()
    for suffix in ("ing", "edly", "ingly", "ation", "ment", "ness", "able", "ible", "ies", "es", "ed", "s"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 3:
            return token[:-len(suffix)]
    return token

def clean_text(text: str) -> str:
    """Step 1: Lowercase text and strip punctuation & non-alphanumeric noise."""
    if not text:
        return ""
    # Lowercase
    text = text.lower()
    # Replace punctuation with space
    text = re.sub(r"[^\w\s]", " ", text)
    # Normalize multiple whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text

def tokenize(text: str) -> List[str]:
    """Step 2: Tokenize normalized text into word tokens."""
    cleaned = clean_text(text)
    if not cleaned:
        return []
    # Tokenize by whitespace and filter out 1-letter non-alphabetic tokens
    tokens = re.findall(r"\b[a-zA-Z0-9]{2,}\b", cleaned)
    return tokens

def remove_stopwords(tokens: List[str]) -> Tuple[List[str], List[str]]:
    """Step 3: Remove stop words, returning (filtered_tokens, removed_stopwords)."""
    stops = get_stopwords()
    filtered = []
    removed = []
    for t in tokens:
        if t in stops:
            removed.append(t)
        else:
            filtered.append(t)
    return filtered, removed

def preprocess(text: str) -> List[str]:
    """Complete text preprocessing pipeline: clean -> tokenize -> stopword removal -> stemming."""
    tokens = tokenize(text)
    filtered, _ = remove_stopwords(tokens)
    stemmed = [stem_token(t) for t in filtered]
    return stemmed

def preprocess_steps_breakdown(text: str) -> Dict[str, Any]:
    """Detailed step-by-step breakdown for Information Retrieval visualization (IR Lab)."""
    raw_query = text or ""
    step1_lower = raw_query.lower()
    step2_cleaned = clean_text(raw_query)
    step3_tokens = tokenize(raw_query)
    step4_filtered, step4_removed = remove_stopwords(step3_tokens)
    step5_stemmed_pairs = [(t, stem_token(t)) for t in step4_filtered]
    step5_stemmed = [p[1] for p in step5_stemmed_pairs]

    return {
        "original_query": raw_query,
        "step_1_lowercased": step1_lower,
        "step_2_punctuation_removed": step2_cleaned,
        "step_3_raw_tokens": step3_tokens,
        "step_4_stopwords_removed": step4_removed,
        "step_4_retained_tokens": step4_filtered,
        "step_5_stemmed_mappings": [{"original": orig, "stemmed": stem} for orig, stem in step5_stemmed_pairs],
        "final_processed_terms": step5_stemmed,
        "processed_query_str": " ".join(step5_stemmed)
    }
