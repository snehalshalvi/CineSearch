from sqlalchemy import Column, Integer, String, Float, Text
from backend.database.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, index=True, nullable=True)
    title = Column(String(255), nullable=False, index=True)
    overview = Column(Text, nullable=True)
    genres = Column(String(255), nullable=True)  # Comma-separated: "Action, Sci-Fi"
    keywords = Column(Text, nullable=True)       # Comma-separated or space-separated
    release_date = Column(String(50), nullable=True)
    release_year = Column(Integer, nullable=True, index=True)
    language = Column(String(20), default="en", index=True)
    rating = Column(Float, default=0.0, index=True)
    vote_count = Column(Integer, default=0)
    popularity = Column(Float, default=0.0)
    poster_path = Column(String(500), nullable=True)
    backdrop_path = Column(String(500), nullable=True)
    cast = Column(Text, nullable=True)           # Comma-separated top actors
    director = Column(String(255), nullable=True)
    runtime = Column(Integer, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "tmdb_id": self.tmdb_id,
            "title": self.title,
            "overview": self.overview or "",
            "genres": [g.strip() for g in self.genres.split(",") if g.strip()] if self.genres else [],
            "keywords": [k.strip() for k in self.keywords.split(",") if k.strip()] if self.keywords else [],
            "release_date": self.release_date or "",
            "release_year": self.release_year,
            "language": self.language or "en",
            "rating": round(self.rating or 0.0, 1),
            "vote_count": self.vote_count or 0,
            "popularity": round(self.popularity or 0.0, 2),
            "poster_path": self.poster_path,
            "backdrop_path": self.backdrop_path,
            "cast": [c.strip() for c in self.cast.split(",") if c.strip()] if self.cast else [],
            "director": self.director or "",
            "runtime": self.runtime or 0,
        }
