from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utils.tasks import repeat_every

from app.routers import infer, login, query
from app.utils.queues import priority_queue, QueryQueue

app = FastAPI()
app.include_router(infer.router)
app.include_router(login.router)
app.include_router(query.router)

origins = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["x-access-token"],
)


@repeat_every(seconds=60 * 5)
def reorder_user_queue():
    priority_queue[:] = QueryQueue().recent_users()
    print("DEBUG:", priority_queue)
