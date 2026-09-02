from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from .database import Base


class Process(Base):

    __tablename__ = "processes"

    id = Column(Integer, primary_key=True, index=True)

    pid = Column(Integer, index=True)

    name = Column(String)

    exe_path = Column(String)

    parent_pid = Column(Integer)

    username = Column(String)

    sha256 = Column(String)

    cpu_percent = Column(String)

    memory_percent = Column(String)

    risk_score = Column(Integer)

    risk_level = Column(String)

    detected_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    pid = Column(Integer)

    process_name = Column(String)

    rule = Column(String)

    severity = Column(String)

    score = Column(Integer)

    description = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)