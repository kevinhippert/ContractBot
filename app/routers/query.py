from datetime import datetime
from time import sleep

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.models import Answer, Lookup, Query, QueryAck, Recommendation
from app.utils.access import authenticate
from app.utils.queues import priority_queue, QueryQueue

router = APIRouter()


@router.get("/api/user-topics", tags=["topic"])
async def user_topics(
    User: str, Nonce: str, Hash: str, OnBehalfOf: str
) -> JSONResponse:
    """
    Return a list of topics the user has access to.
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
    return JSONResponse(
        status_code=status.HTTP_200_OK, content=QueryQueue().get_user_topics(OnBehalfOf)
    )


@router.delete("/api/topic", tags=["topic"])
async def delete_topic(
    User: str, Nonce: str, Hash: str, OnBehalfOf: str, Topic: str
) -> JSONResponse:
    """
    Delete a topic from the user's list of topics.
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

    permitted = QueryQueue().delete_topic(OnBehalfOf, Topic)
    if not permitted:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "User does not have permission to delete this topic"},
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "OK"})


@router.put("/api/rename-topic", tags=["topic"])
async def rename_topic(
    User: str,
    Nonce: str,
    Hash: str,
    OnBehalfOf: str,
    Topic: str,
    Description: str,
) -> JSONResponse:
    """
    Rename a topic for the user.
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

    permitted = QueryQueue().rename_topic(OnBehalfOf, Topic, Description)
    if not permitted:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "User does not have permission to rename this topic"},
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "OK"})


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

    priority_queue[:] = QueryQueue().recent_users()
    if len(priority_queue) >= 3 and Query.User not in priority_queue[:3]:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "The service is experiencing heavy traffic. "
                "Please try again later."
            },
        )

    # TODO: Should utilize Query.Modifiers to enhance Query.Query
    seq, received = QueryQueue().add_query(
        Query.Topic, Query.User, Query.Query, Query.Modifiers, Query.Model
    )
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

    RETRIES = 30
    for _try_num in range(RETRIES):
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


@router.get("/api/get-topic-thread", tags=["query", "topic"])
async def get_topic(
    User: str,
    Nonce: str,
    Hash: str,
    Topic: str,
) -> JSONResponse:
    """
    Retrieve all answers within a topic. Return 404 if none exist.

    Note: Will also include queries that have not yet had Answer/Think populated
    (i.e. status "Open" or "Pending").
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

    queries: list[Answer] = QueryQueue().find_answers(Topic)
    if not queries:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Topic not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=[
            {
                "Query": query.Query,
                "Topic": query.Topic,
                "Seq": query.Seq,
                "Answer": query.Answer,
                "Think": query.Think,
            }
            for query in queries
        ],
    )


@router.post("/api/add-lookup", tags=["query", "lookup"])
async def get_user(
    User: str,
    Nonce: str,
    Hash: str,
    lookup: Lookup,
) -> JSONResponse:
    """
    Add a new lookup to the queue.
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
    fingerprint, timestamp = QueryQueue().add_lookup(lookup)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"Fingerprint": fingerprint, "Timestamp": timestamp},
    )


@router.get("/api/get-lookups", tags=["query", "lookup"])
async def get_lookups(User: str, Nonce: str, Hash: str, Topic: str) -> JSONResponse:
    """
    Return a nested structure following the LookupMatch model
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

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=QueryQueue().find_topic_lookups(Topic),
    )


@router.post("/api/recommend", tags=["query", "recommend"])
async def recommend(
    User: str, Nonce: str, Hash: str, rec: Recommendation
) -> JSONResponse:
    """
    Annotate generated answers for improvement of the models with RAG
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

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"Timestamp:": QueryQueue().recommend(rec)},
    )
