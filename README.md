# CineSearch 🎬
### Natural-Language Movie Search Engine Using Information Retrieval

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4%2B-F7931E.svg)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-14%20Passed%20(100%25)-brightgreen.svg)]()

CineSearch is a fifth-semester **Information Retrieval (IR) academic project**. It helps users discover movies using natural-language descriptions of plot scenes, characters, themes, and moods—even when the user cannot recall the title.

Rather than relying on black-box LLMs or third-party paid recommendation APIs, CineSearch is built on foundational, transparent Information Retrieval algorithms: **Text Preprocessing, Inverted Indexing, TF-IDF Vector Space Modeling, and Cosine Similarity Ranking**.

---

## 📑 Table of Contents
1. [Core Features](#-core-features)
2. [Information Retrieval Methodology](#-information-retrieval-methodology)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started (Step-by-Step)](#-getting-started-step-by-step)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#1-backend-setup)
   - [Frontend Setup](#2-frontend-setup)
6. [Dataset Management](#-dataset-management)
   - [Using Curated Sample Dataset](#option-a-bundled-cinematic-dataset-ready-to-use)
   - [Ingesting Full TMDB 5000 Dataset](#option-b-full-tmdb-5000-dataset-4800-movies)
7. [IR Lab: Academic Evaluation Dashboard](#-ir-lab-academic-evaluation-dashboard)
8. [API Endpoints](#-api-endpoints)
9. [Running Automated Tests](#-running-automated-tests)
10. [College Project Demonstration Guide](#-college-project-demonstration-guide)

---

## 🌟 Core Features

- **Natural Language Plot Search**: Search by storyline description, e.g.:
  > *"I want a psychological thriller about a man who slowly discovers that his entire life is a lie."*  
  *(Retrieves **The Truman Show** as Rank #1 with 0.2974 Cosine Similarity)*
- **Forgotten Movie Mode**: Toggle *"I don't remember the movie name"* to query vague memories of scenes and characters.
- **Why This Movie? Relevance Explanation**: Transparently breaks down overlapping query stems, term contributions, and exact cosine similarity scores for every retrieved movie.
- **IR Lab Interactive Dashboard**: Live visualization of the IR pipeline:
  - Text normalization, tokenization, stop-word elimination, and Porter stemming
  - Term Frequency (TF), Inverse Document Frequency (IDF), and normalized TF-IDF query weights
  - Interactive Inverted Index postings lookup with Document Frequencies and token offsets
  - Cosine similarity comparison bar chart for the top 10 ranked documents
  - Corpus metrics: Vocabulary size, document count, matrix sparsity %, and execution latency
- **Search History**: Previous queries are stored in SQLite and can be repeated with one click or cleared.
- **Content-Based Similar Movies**: Movie details calculate similar films using inter-document TF-IDF cosine similarity.
- **Dynamic Metadata Filtering & Sorting**: Filter by Genre, Release Year range, Minimum Rating, and Language; sort by Relevance, Year, or Rating.
- **Zero Paid API Requirement**: Fully self-contained local vector space search.

---

## 🔬 Information Retrieval Methodology

### 1. Text Preprocessing Pipeline
Every movie document and incoming search query passes through:
1. **Case Normalization & Cleaning**: Converts text to lowercase; strips non-alphanumeric noise with regex.
2. **Tokenization**: Extracts word tokens ($\ge 2$ characters).
3. **Stop-Word Removal**: Eliminates common grammatical stop words using NLTK and a comprehensive 180+ term English stop list, including search stopwords like *"movie"*, *"film"*, *"want"*, *"find"*.
4. **Porter Stemming**: Normalizes inflected word variants to their root stem (e.g., `dreams` $\rightarrow$ `dream`, `realities` $\rightarrow$ `realit`, `discovers` $\rightarrow$ `discov`).

### 2. Weighted Document Representation
Each movie document vector incorporates multiple metadata fields with sensible term frequency weighting:
$$\text{Document} = \text{Title} \times 2 + \text{Overview} \times 2 + \text{Genres} + \text{Keywords} + \text{Top Cast} + \text{Director}$$

### 3. Inverted Index
Maps stemmed terms to postings lists:
$$\text{term } t \longrightarrow \big[ (\text{doc\_id}_1, \text{tf}, [\text{pos}_1, \text{pos}_2]), \; (\text{doc\_id}_2, \text{tf}, [\dots]) \big]$$

### 4. TF-IDF Weighting
- **Sublinear Term Frequency**:
  $$\text{tf}(t, d) = 1 + \ln(\text{count}(t, d)) \quad \text{for } \text{count} > 0$$
- **Inverse Document Frequency (IDF)**:
  $$\text{idf}(t) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$
- **TF-IDF Weight**:
  $$w_{t, d} = \text{tf}(t, d) \times \text{idf}(t)$$

### 5. Cosine Similarity & Vector Space Ranking
Query vector $\mathbf{q}$ and document vectors $\mathbf{d}$ are $L_2$-normalized:
$$\text{Cosine Similarity}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|} = \sum_{t \in \mathbf{q} \cap \mathbf{d}} q_t \cdot d_t$$

Documents with non-zero similarity are sorted in descending order of similarity.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, Axios, Framer Motion |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Information Retrieval** | Scikit-learn (`TfidfVectorizer`), NLTK (`PorterStemmer`, `stopwords`), NumPy, SciPy |
| **Database** | SQLite, SQLAlchemy 2.0 |
| **Testing** | Pytest, TestClient |

---

## 📁 Project Structure

```text
CineSearch/
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py              # FastAPI endpoints (search, movies, IR lab, filters)
│   ├── database/
│   │   ├── database.py            # SQLite connection & session management
│   │   └── cinesearch.db          # Auto-generated SQLite database
│   ├── dataset/
│   │   ├── sample_movies.json     # Curated high-quality cinematic dataset
│   │   ├── tmdb_5000_movies.csv   # Optional full TMDB dataset
│   │   └── tmdb_5000_credits.csv  # Optional full TMDB credits
│   ├── models/
│   │   ├── movie.py               # SQLAlchemy Movie entity
│   │   └── search_history.py      # SQLAlchemy SearchHistory entity
│   ├── retrieval/
│   │   ├── preprocessing.py       # Cleaning, tokenizing, stop-words, Porter stemmer
│   │   ├── indexing.py            # InvertedIndex data structure
│   │   ├── vectorizer.py          # TF-IDF Vectorizer wrapper
│   │   ├── similarity.py          # Cosine similarity inner product calculations
│   │   ├── ranking.py             # Document ranker & metadata filtering
│   │   └── search_engine.py       # Central SearchEngine coordinator
│   ├── schemas/
│   │   ├── movie.py               # Pydantic schemas for movies & rankings
│   │   └── search.py              # Pydantic schemas for queries & IR Lab
│   ├── scripts/
│   │   ├── ingest_movies.py       # Dataset ingestion & index builder script
│   │   ├── download_tmdb.py       # Script to fetch full TMDB 5000 CSVs
│   │   └── evaluate_queries.py    # Offline IR ranking accuracy evaluator
│   ├── tests/
│   │   ├── test_ir_engine.py      # Unit tests for preprocessing, indexing, tfidf
│   │   └── test_api.py            # Integration tests for FastAPI endpoints
│   ├── main.py                    # FastAPI application entry point with CORS & lifespan
│   └── requirements.txt           # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Responsive navbar with engine status pill
│   │   │   ├── Footer.jsx         # Academic project footer
│   │   │   ├── MovieCard.jsx      # Cinematic movie card with posters & match score
│   │   │   ├── FallbackPoster.jsx # Dynamic fallback artwork for missing posters
│   │   │   ├── RelevanceModal.jsx # "Why this movie?" IR relevance explanation drawer
│   │   │   └── SearchHistoryModal.jsx # Search history modal
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Cinematic hero, search bar, forgotten mode
│   │   │   ├── SearchResults.jsx  # Results grid, filters (genre, year, rating), sorting
│   │   │   ├── MovieDetails.jsx   # Backdrop, plot, cast, content-based similar movies
│   │   │   ├── IRLab.jsx          # Interactive IR analysis dashboard & formula guide
│   │   │   ├── Explore.jsx        # Catalog browsing with pagination
│   │   │   └── About.jsx          # Academic architecture documentation
│   │   ├── services/
│   │   │   └── api.js             # Axios API client
│   │   ├── App.jsx                # Main React router
│   │   ├── index.css              # Tailwind CSS styles & custom scrollbars
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js             # Vite configuration with proxy to port 8000
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started (Step-by-Step)

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher (v20+ recommended)
- **Git**

---

### 1. Backend Setup

Open a terminal in the project root:

```bash
# 1. (Optional) Create and activate a Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. (Optional) Ingest dataset and pre-build IR index
python backend/scripts/ingest_movies.py

# 4. Start the FastAPI backend server
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

> **Automatic DB Ingestion**: If you skip step 3, `backend/main.py` will automatically initialize the database, ingest the sample movie dataset, and construct the retrieval index on its first launch!

You can verify the backend is online by opening [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

---

### 2. Frontend Setup

Open a second terminal window in the project root:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

Now open [http://localhost:5173](http://localhost:5173) in your browser to experience CineSearch!

---

## 📦 Dataset Management

### Option A: Bundled Cinematic Dataset (Ready to Use)
CineSearch comes pre-packaged with `backend/dataset/sample_movies.json`, containing curated cinematic films (e.g., *Inception*, *The Truman Show*, *Interstellar*, *Shutter Island*, *The Matrix*, *Fight Club*, *Memento*, *Eternal Sunshine*, *Her*, *Coherence*, *Arrival*, *Blade Runner 2049*, *Parasite*, *The Dark Knight*, *Pulp Fiction*, *Whiplash*, etc.) complete with real TMDB poster and backdrop links.

### Option B: Full TMDB 5000 Dataset (4,800+ Movies)
To use the complete TMDB 5000 dataset:
1. Run the downloader script:
   ```bash
   python backend/scripts/download_tmdb.py
   ```
   *Or place `tmdb_5000_movies.csv` and `tmdb_5000_credits.csv` into `backend/dataset/` manually.*
2. Run the ingestion script:
   ```bash
   python backend/scripts/ingest_movies.py
   ```
The script will parse the JSON genre and credit structures, extract cast and directors, clean null fields, insert them into SQLite, and rebuild the TF-IDF vector matrix.

---

## 🧪 IR Lab: Academic Evaluation Dashboard

Accessible directly via the navbar or at `/ir-lab`, this page allows professors and students to inspect the mathematical retrieval process:

| Stage | What is Displayed |
|---|---|
| **1. Text Preprocessing** | Raw query $\rightarrow$ Lowercasing & Punctuation removal $\rightarrow$ Raw Tokens $\rightarrow$ Stopwords eliminated (red) vs retained (green) $\rightarrow$ Porter stemmed stems. |
| **2. TF-IDF Vector Weights** | Table of each query term's Term Frequency (TF), Corpus Inverse Document Frequency (IDF), and normalized vector weight. |
| **3. Inverted Index Postings** | Interactive term chip selector showing Document Frequency ($df$) and detailed postings list with Document IDs, movie titles, and term occurrences. |
| **4. Cosine Similarity Chart** | Responsive visual bar chart comparing the top 10 movies' cosine similarity scores. |
| **5. Ranked Document Table** | Rank order (#1 to #10), movie title, exact cosine similarity score, and matched query stems. |
| **6. Corpus Metrics** | Total documents ($N$), vocabulary size, matrix sparsity percentage, average document length, and search latency in milliseconds. |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status, indexed document count, and vocabulary size |
| `GET` | `/api/movies` | Paginated movie catalog with genre & sort filters |
| `GET` | `/api/movies/{id}` | Movie details + content-based similar movies |
| `POST` | `/api/search` | Natural language query search with IR explanations & filters |
| `GET` | `/api/search/history` | Recent search queries stored in SQLite |
| `DELETE` | `/api/search/history` | Clears search history log |
| `GET` | `/api/search/analysis` | Live IR Lab mathematical breakdown for any query |
| `GET` | `/api/filters` | Available genres, languages, year and rating boundaries |
| `GET` | `/api/trending` | Highest-rated and popular indexed movies |
| `POST` | `/api/search/suggestions`| Suggests alternative indexed keywords |

### Example Search Payload:
```json
POST /api/search
{
  "query": "A man trapped inside a dream",
  "limit": 10,
  "sort_by": "relevance",
  "mode": "natural",
  "filters": {
    "genre": "Science Fiction",
    "min_rating": 8.0,
    "year_min": 2000
  }
}
```

---

## 🧪 Running Automated Tests

All core algorithms and API routes are covered by unit and integration tests.

Run the test suite with:

```bash
python -m pytest backend/tests -v
```

### Test Coverage Summary:
- `test_preprocessing_pipeline`: Verifies lowercase cleaning, tokenization, stop-word elimination, and Porter stemming.
- `test_inverted_index`: Tests index building, document frequency lookup, and postings extraction.
- `test_tfidf_vectorizer_and_similarity`: Validates TF-IDF matrix generation and cosine similarity calculation.
- `test_metadata_filtering_and_ranking`: Verifies genre, year, and rating filtering alongside relevance ranking.
- `test_empty_and_unknown_query`: Ensures zero vector handling when searching out-of-vocabulary terms.
- `test_api_*`: Validates all FastAPI endpoints, SQLite persistence, and search response schemas.

---

## 🎓 College Project Demonstration Guide

Follow these steps during your live project presentation:

1. **Demonstrate Natural Language Plot Search**:
   - Query: *"I want a psychological thriller about a man who slowly discovers that his entire life is a lie."*
   - Show how CineSearch returns **The Truman Show** at Rank #1 without searching the movie title.
2. **Demonstrate "Why This Movie?"**:
   - Click the **"Why?"** button on The Truman Show card.
   - Point out the overlapping query stems (`lie`, `discov`, `life`, `slowly`, `entir`) and the exact cosine similarity score ($0.2974$).
3. **Demonstrate Forgotten Movie Mode**:
   - Switch on the *"I don't remember the movie name"* toggle on the homepage.
   - Query: *"man trapped inside dreams within dreams with a spinning top"*
   - Observe how **Inception** is retrieved as Rank #1.
4. **Demonstrate the IR Lab**:
   - Click **"IR Lab"** in the navigation bar.
   - Enter: *"time travel alternate realities"*
   - Walk the examiner through:
     - **Stage 1**: How stopwords (*"a"*, *"about"*, *"and"*) were removed and words were stemmed.
     - **Stage 2**: How rare terms like *"alternate"* and *"realit"* receive higher IDF weights than common words.
     - **Stage 3**: Click the inverted index term chips to show the actual posting lists.
     - **Stage 4**: Show the Cosine Similarity visualizer bar chart comparing top documents.
5. **Demonstrate Content-Based Similar Movies**:
   - Click any movie card (e.g., *Inception*) to open its details page.
   - Scroll down to the **"Similar Movies (Content-Based IR)"** section to show how cosine similarity between movie document representations finds topical matches (e.g., *Memento*, *The Prestige*, *Coherence*).

---

## 📄 License
This project is developed for educational and academic evaluation purposes.
Movie metadata is sourced from the TMDB 5000 Movie Dataset.
