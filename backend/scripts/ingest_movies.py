import os
import sys
import json
import ast
import argparse
from typing import Dict, Any, List

# Ensure parent directory is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, ROOT_DIR)

from backend.database.database import engine, SessionLocal, init_db
from backend.models.movie import Movie
from backend.retrieval.search_engine import search_engine

DATASET_DIR = os.path.join(BACKEND_DIR, "dataset")
MOVIES_CSV = os.path.join(DATASET_DIR, "tmdb_5000_movies.csv")
CREDITS_CSV = os.path.join(DATASET_DIR, "tmdb_5000_credits.csv")
SAMPLE_JSON = os.path.join(DATASET_DIR, "sample_movies.json")

def parse_json_field(val: Any, key_name: str = "name", max_items: int = 10) -> List[str]:
    """Safely parse TMDB JSON string columns into lists of strings."""
    if not val or (isinstance(val, float) and val != val):
        return []
    if isinstance(val, list):
        return [item.get(key_name, "") if isinstance(item, dict) else str(item) for item in val[:max_items]]
    try:
        data = json.loads(val)
        return [item[key_name] for item in data if key_name in item][:max_items]
    except Exception:
        try:
            data = ast.literal_eval(val)
            return [item[key_name] for item in data if isinstance(item, dict) and key_name in item][:max_items]
        except Exception:
            return []

def extract_director(crew_val: Any) -> str:
    """Extract Director name from TMDB crew JSON."""
    if not crew_val or (isinstance(crew_val, float) and crew_val != crew_val):
        return ""
    try:
        items = json.loads(crew_val) if isinstance(crew_val, str) else crew_val
        for member in items:
            if member.get("job") == "Director":
                return member.get("name", "")
    except Exception:
        try:
            items = ast.literal_eval(crew_val)
            for member in items:
                if isinstance(member, dict) and member.get("job") == "Director":
                    return member.get("name", "")
        except Exception:
            pass
    return ""

def ingest_from_sample(db_session) -> int:
    """Ingest curated sample movies dataset."""
    if not os.path.exists(SAMPLE_JSON):
        print(f"[ERROR] Sample dataset not found at {SAMPLE_JSON}")
        return 0

    with open(SAMPLE_JSON, "r", encoding="utf-8") as f:
        movies_data = json.load(f)

    count = 0
    for item in movies_data:
        # Check duplicate by tmdb_id or title
        existing = db_session.query(Movie).filter(
            (Movie.tmdb_id == item.get("tmdb_id")) | (Movie.title == item.get("title"))
        ).first()

        if existing:
            continue

        movie = Movie(
            tmdb_id=item.get("tmdb_id"),
            title=item.get("title"),
            overview=item.get("overview", ""),
            genres=", ".join(item.get("genres", [])),
            keywords=", ".join(item.get("keywords", [])),
            release_date=item.get("release_date"),
            release_year=item.get("release_year"),
            language=item.get("language", "en"),
            rating=item.get("rating", 0.0),
            vote_count=item.get("vote_count", 0),
            popularity=item.get("popularity", 0.0),
            poster_path=item.get("poster_path"),
            backdrop_path=item.get("backdrop_path"),
            cast=", ".join(item.get("cast", [])),
            director=item.get("director", ""),
            runtime=item.get("runtime", 0)
        )
        db_session.add(movie)
        count += 1

    db_session.commit()
    print(f"[INFO] Ingested {count} sample movies into SQLite database.")
    return count

def ingest_from_csv(db_session) -> int:
    """Ingest full TMDB 5000 dataset CSVs into SQLite."""
    import pandas as pd

    print(f"[INFO] Loading TMDB 5000 dataset from {MOVIES_CSV}...")
    movies_df = pd.read_csv(MOVIES_CSV)
    credits_map = {}

    if os.path.exists(CREDITS_CSV):
        print(f"[INFO] Loading credits from {CREDITS_CSV}...")
        credits_df = pd.read_csv(CREDITS_CSV)
        # Standardize movie_id column
        id_col = "movie_id" if "movie_id" in credits_df.columns else "id"
        for _, row in credits_df.iterrows():
            m_id = row[id_col]
            cast_list = parse_json_field(row.get("cast"), key_name="name", max_items=5)
            director = extract_director(row.get("crew"))
            credits_map[m_id] = {
                "cast": ", ".join(cast_list),
                "director": director
            }

    count = 0
    for _, row in movies_df.iterrows():
        tmdb_id = int(row.get("id"))
        title = str(row.get("title") or "").strip()
        if not title:
            continue

        existing = db_session.query(Movie).filter(
            (Movie.tmdb_id == tmdb_id) | (Movie.title == title)
        ).first()
        if existing:
            continue

        overview = str(row.get("overview") or "")
        genres_list = parse_json_field(row.get("genres"), key_name="name")
        keywords_list = parse_json_field(row.get("keywords"), key_name="name")
        release_date = str(row.get("release_date") or "")
        release_year = None
        if release_date and len(release_date) >= 4 and release_date[:4].isdigit():
            release_year = int(release_date[:4])

        lang = str(row.get("original_language") or "en")
        rating = float(row.get("vote_average") or 0.0)
        vote_count = int(row.get("vote_count") or 0)
        popularity = float(row.get("popularity") or 0.0)
        runtime = int(row.get("runtime") or 0) if pd.notna(row.get("runtime")) else 0

        # Credits
        credits_info = credits_map.get(tmdb_id, {})
        cast_str = credits_info.get("cast", "")
        director = credits_info.get("director", "")

        movie = Movie(
            tmdb_id=tmdb_id,
            title=title,
            overview=overview,
            genres=", ".join(genres_list),
            keywords=", ".join(keywords_list),
            release_date=release_date,
            release_year=release_year,
            language=lang,
            rating=rating,
            vote_count=vote_count,
            popularity=popularity,
            poster_path=None,  # Dynamic fallback / TMDB URL builder in frontend
            backdrop_path=None,
            cast=cast_str,
            director=director,
            runtime=runtime
        )
        db_session.add(movie)
        count += 1

        if count % 500 == 0:
            db_session.commit()
            print(f"[INFO] Processed {count} movies...")

    db_session.commit()
    print(f"[INFO] Successfully ingested {count} movies from TMDB 5000 CSV.")
    return count

def build_index_from_db(db_session):
    """Build the Information Retrieval index from stored movies in the database."""
    print("[INFO] Fetching movies from database to construct IR index...")
    movies = db_session.query(Movie).all()
    if not movies:
        print("[WARNING] No movies found in database to index.")
        return

    movies_data = [m.to_dict() for m in movies]
    search_engine.initialize(movies_data)
    stats = search_engine.vectorizer.get_stats()
    index_stats = search_engine.inverted_index.get_stats()
    print(f"[SUCCESS] Information Retrieval Index successfully built!")
    print(f"         Total Indexed Documents: {index_stats.get('total_documents')}")
    print(f"         Vocabulary Size (terms): {stats.get('num_features')}")
    print(f"         Matrix Sparsity: {stats.get('matrix_sparsity_pct')}%")

def main():
    parser = argparse.ArgumentParser(description="Ingest TMDB 5000 dataset into CineSearch SQLite DB")
    parser.add_argument("--force-sample", action="store_true", help="Force ingestion of the sample dataset only")
    args = parser.parse_args()

    init_db()
    session = SessionLocal()

    try:
        has_csv = os.path.exists(MOVIES_CSV)
        if has_csv and not args.force_sample:
            ingest_from_csv(session)
        else:
            if not has_csv:
                print("=" * 70)
                print("[NOTICE] TMDB 5000 dataset CSV files were not detected in:")
                print(f"         {DATASET_DIR}")
                print("         Expected: 'tmdb_5000_movies.csv' and 'tmdb_5000_credits.csv'.")
                print("         To import the full 4,800+ movies dataset:")
                print("         1. Download the TMDB 5000 dataset from Kaggle or GitHub.")
                print(f"         2. Place the CSV files in '{DATASET_DIR}'.")
                print("         3. Run: python backend/scripts/ingest_movies.py")
                print("-" * 70)
                print("[INFO] Loading high-quality curated sample dataset for immediate use...")
                print("=" * 70)
            ingest_from_sample(session)

        # Build retrieval index
        build_index_from_db(session)

    finally:
        session.close()

if __name__ == "__main__":
    main()
