from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import infer, login, query

app = FastAPI()

origins = [ "https://hcmniabot.org",
            "https://localhost",
            "http://localhost",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "*" ]
            
#"http://localhost:8443",
#"http://127.0.0.1:8443",
#"https://localhost:3000",
#"https://127.0.0.1:3000",
#"https://63.147.241.42",
#"http://63.147.241.42", 
#"https://63.147.241.42:3000",
#"http://63.147.241.42:3000",
#"https://63.147.241.42:8443",
#"http://63.147.241.42:8443",
#"http://63.147.241.42:80",
#"https://63.147.241.42:443",
#"http://63.147.241.42:443",

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["x-access-token"],
)

app.include_router(infer.router)
app.include_router(login.router)
app.include_router(query.router)
