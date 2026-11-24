import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, PROJECT_ROOT)

from backend.database.database import SessionLocal, init_db
from backend.models.movie import Movie
from backend.retrieval.search_engine import search_engine

def run_eval():
    init_db()
    session = SessionLocal()
    movies = session.query(Movie).all()
    search_engine.initialize([m.to_dict() for m in movies])

    test_queries = [
        "I want a psychological thriller about a man who slowly discovers that his entire life is a lie.",
        "A man trapped inside a dream.",
        "A movie about time travel and alternate realities.",
        "A lonely person searching for meaning in life.",
        "A psychological thriller with an unexpected ending."
    ]

    print("=" * 80)
    print("CINESEARCH: INFORMATION RETRIEVAL ACCURACY & RANKING EVALUATION")
    print("=" * 80)

    for q in test_queries:
        res = search_engine.search(q, limit=3)
        print(f"\n[QUERY]: '{q}'")
        print(f"  Processed Stems: {res['tokens']}")
        print(f"  Execution Time: {res['execution_time_ms']} ms | Total Retrieved: {res['total_results']}")
        print("  Top 3 Ranked Movies:")
        for r in res['results']:
            print(f"    #{r['rank']} {r['title']} | Score: {r['relevance_score']} | Matched: {r['matched_terms']}")

    print("\n" + "=" * 80)

if __name__ == "__main__":
    run_eval()
