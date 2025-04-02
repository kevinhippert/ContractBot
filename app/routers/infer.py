from time import sleep

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.models import Answer
from app.utils.access import authenticate
from app.utils.queues import query_queue

router = APIRouter()

RETRIES = 100


@router.get("/api/get-new-queries", tags=["infer"])
async def get_new_queries(
    User: str,
    Nonce: str,
    Hash: str,
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

    for _ in range(RETRIES):
        if queries := query_queue.find_queries():
            query_queue.mark_pending(queries["Topic"], list(queries["Queries"]))
            return JSONResponse(status_code=status.HTTP_200_OK, content=queries)
        sleep(1)  # Wait then checking again

    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"Topic": None, "Queries": None}
    )


@router.post("/api/give-new-answer", tags=["infer"])
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

    query_queue.update_answer(answer)
    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "OK"})
