from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import infer, login, query

app = FastAPI()
app.include_router(infer.router)
app.include_router(login.router)
app.include_router(query.router)

origins = ["https://bosbot.org", "http://localhost:3000", "http://127.0.0.1:3000", "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["x-access-token"],
)
