"""
Optional utility script to download the official TMDB 5000 Movie Dataset directly.
"""
import os
import urllib.request

DATASET_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(DATASET_DIR)
TARGET_DIR = os.path.join(BACKEND_DIR, "dataset")

URL_MOVIES = "https://raw.githubusercontent.com/harshit4084/Movie-Recommendation-System/master/tmdb_5000_movies.csv"
URL_CREDITS = "https://raw.githubusercontent.com/harshit4084/Movie-Recommendation-System/master/tmdb_5000_credits.csv"

def download():
    os.makedirs(TARGET_DIR, exist_ok=True)
    movies_path = os.path.join(TARGET_DIR, "tmdb_5000_movies.csv")
    credits_path = os.path.join(TARGET_DIR, "tmdb_5000_credits.csv")

    print("[INFO] Downloading TMDB 5000 Movies CSV...")
    urllib.request.urlretrieve(URL_MOVIES, movies_path)
    print(f"[SUCCESS] Saved to {movies_path}")

    print("[INFO] Downloading TMDB 5000 Credits CSV...")
    urllib.request.urlretrieve(URL_CREDITS, credits_path)
    print(f"[SUCCESS] Saved to {credits_path}")

if __name__ == "__main__":
    download()
