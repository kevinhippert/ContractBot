from time import sleep

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.models import Answer, LookupMatches, LookupTodo, QueryTodo
from app.utils.access import authenticate
from app.utils.queues import QueryQueue

router = APIRouter()

RETRIES = 20


@router.get("/api/get-new-queries", tags=["infer", "query"])
async def get_new_queries(
    User: str,
    Nonce: str,
    Hash: str,
) -> JSONResponse:
    query_todo: QueryTodo | None

    if not User.startswith("Inference_"):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Only Inference users can access this endpoint"},
        )
    if not authenticate(User, Nonce, Hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed"},
        )

    for _ in range(RETRIES):
        if query_todo := QueryQueue().find_queries():
            queries = query_todo.Queries or []  # [{Seq: (Query, User, Model)}] mappings
            seqs = []
            for q in queries:
                seqs.extend(list(q))  # Only one Seq key in each dict
            QueryQueue().mark_pending(topic=query_todo.Topic or "", seqs=seqs)
            return JSONResponse(
                status_code=status.HTTP_200_OK, content=query_todo.model_dump()
            )
        sleep(1)  # Wait then checking again

    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"Topic": None, "Queries": None}
    )


@router.post("/api/give-new-answer", tags=["infer", "query"])
def give_new_answer(
    User: str,
    Nonce: str,
    Hash: str,
    answer: Answer,
) -> JSONResponse:
    if not User.startswith("Inference_"):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Only Inference users can access this endpoint"},
        )
    if not authenticate(User, Nonce, Hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed"},
        )

    QueryQueue().update_answer(answer)
    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "OK"})


@router.get("/api/get-new-lookup", tags=["infer", "lookup"])
async def get_new_lookup(User: str, Nonce: str, Hash: str) -> LookupTodo | JSONResponse:
    if not User.startswith("Inference_"):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Only Inference users can access this endpoint"},
        )
    if not authenticate(User, Nonce, Hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed"},
        )
    if new := QueryQueue().get_new_lookup():
        return JSONResponse(status_code=status.HTTP_200_OK, content=new)
    else:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND, content={"detail": "No new lookup"}
        )


@router.post("/api/give-new-matches", tags=["infer", "lookup"])
async def give_new_matches(
    User: str,
    Nonce: str,
    Hash: str,
    matches: LookupMatches,
) -> JSONResponse:
    if not User.startswith("Inference_"):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Only Inference users can access this endpoint"},
        )
    if not authenticate(User, Nonce, Hash):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed"},
        )
    QueryQueue().update_matches(matches.Fingerprint, matches.Matches)
    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "OK"})
