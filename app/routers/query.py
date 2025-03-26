from datetime import datetime
from random import randint
from time import sleep

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from fortune import fortune

from app.models import Query, QueryAck
from app.utils.access import authenticate

router = APIRouter()


@router.post("/api/add-query", tags=["query"])
async def add_query(
    User: str,
    Nonce: str,
    Hash: str,
    Query: Query,
) -> JSONResponse:
    """
    Add a new query to the queue.
    """
    if not authenticate(User, Nonce, Hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed"},
        )

    received = datetime.now().isoformat().split(".")[0]  # Remove milliseconds
    if len(Query.Query) < 10:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Query must be at least 10 characters long"},
        )

    ack = QueryAck(
        Topic=Query.Topic,
        Seq=randint(1, 10),  # FIXME: Random sequence number,
        Timestamp=received,
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=ack.model_dump(),
    )


@router.get("/api/check-query-topic", tags=["query"])
async def get_query(
    User: str,
    Nonce: str,
    Hash: str,
    Topic: str,
    Seq: int,
) -> JSONResponse:
    """
    Check if a query with the given topic and sequence number exists.
    """
    if not authenticate(User, Nonce, Hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed"},
        )

    for _ in range(30):
        if randint(1, 100) < 20:
            answer = fortune().split("\n")
            think = fortune().split("\n")
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"Topic": Topic, "Seq": Seq, "Answer": answer, "Think": think},
            )
        sleep(1)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"Topic": Topic, "Seq": Seq, "Answer": None, "Think": None},
    )
