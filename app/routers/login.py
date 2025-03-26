from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.utils.access import authenticate

router = APIRouter()


@router.get("/api/login", tags=["login"])
def login(User: str, Nonce: str, Hash: str) -> JSONResponse:
    if authenticate(User, Nonce, Hash):
        return JSONResponse(status_code=status.HTTP_200_OK, content="Login successful")
    else:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED, content="Invalid credentials"
        )
