from time import sleep

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.models import Answer, QueryTodo
from app.utils.access import authenticate
from app.utils.queues import query_queue

router = APIRouter()

RETRIES = 60


@router.get("/api/get-new-queries", tags=["infer"])
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
        if query_todo := query_queue.find_queries():
            queries = query_todo.Queries or []  # [{Seq: (Query, Model)}] mappings
            seqs = []
            for q in queries:
                seqs.extend(list(q))  # Only one Seq key in each dict
            query_queue.mark_pending(topic=query_todo.Topic or "", seqs=seqs)
            return JSONResponse(
                status_code=status.HTTP_200_OK, content=query_todo.model_dump()
            )
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
