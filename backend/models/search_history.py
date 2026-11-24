from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.database.database import Base

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    query = Column(String(500), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    result_count = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    mode = Column(String(50), default="natural")

    def to_dict(self):
        return {
            "id": self.id,
            "query": self.query,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "result_count": self.result_count,
            "execution_time_ms": round(self.execution_time_ms, 2),
            "mode": self.mode,
        }
