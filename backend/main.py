from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Process, Alert
from .services.monitor import monitor

from .collectors.process_collector import (
    get_all_processes
)

from .collectors.network_collector import (
    get_network_connections
)


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Windows Mini EDR",
    description="Windows Endpoint Detection and Response prototype",
    version="1.0"
)


@app.on_event("startup")
def startup():

    monitor.start()


@app.get("/")
def root():

    return {
        "status": "running",
        "service": "Windows Mini EDR"
    }


@app.get("/processes")
def processes():

    return get_all_processes()


@app.get("/network")
def network():

    return get_network_connections()


@app.get("/alerts")
def alerts(
    db: Session = Depends(get_db)
):

    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(100)
        .all()
    )


@app.get("/history")
def history(
    db: Session = Depends(get_db)
):

    return (
        db.query(Process)
        .order_by(Process.detected_at.desc())
        .limit(200)
        .all()
    )


@app.get("/stats")
def stats(
    db: Session = Depends(get_db)
):

    total = db.query(Process).count()

    high = (
        db.query(Process)
        .filter(Process.risk_level == "HIGH")
        .count()
    )

    medium = (
        db.query(Process)
        .filter(Process.risk_level == "MEDIUM")
        .count()
    )

    low = (
        db.query(Process)
        .filter(Process.risk_level == "LOW")
        .count()
    )

    return {

        "total": total,

        "high": high,

        "medium": medium,

        "low": low

    }