from datetime import datetime
from time import sleep

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.models import Query, QueryAck
from app.utils.access import authenticate
from app.utils.queues import QueryQueue

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
    if not User.startswith("Frontend_"):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Only Frontend users can access this endpoint"},
        )
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

    # TODO: Should utilize Query.Modifiers to enhance Query.Query
    seq, received = QueryQueue().add_query(Query.Topic, Query.Query, Query.Model)
    ack = QueryAck(
        Topic=Query.Topic,
        Seq=seq,
        Timestamp=received,
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=ack.model_dump(),
    )


@router.get("/api/check-query", tags=["query"])
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
    if not User.startswith("Frontend_"):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Only Frontend users can access this endpoint"},
        )
    if not authenticate(User, Nonce, Hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed"},
        )

    RETRIES = 60
    for _ in range(RETRIES):
        if answer := QueryQueue().find_answer(Topic, Seq):
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "Topic": answer.Topic,
                    "Seq": answer.Seq,
                    "Answer": answer.Answer,
                    "Think": answer.Think,
                },
            )
        sleep(1)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"Topic": Topic, "Seq": Seq, "Answer": None, "Think": None},
    )
