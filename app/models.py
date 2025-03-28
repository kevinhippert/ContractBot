from typing import Any
from pydantic import BaseModel


class Query(BaseModel):
    Topic: Any | None = None
    Query: Any | None = None
    Modifiers: Any | None = None


class QueryAck(BaseModel):
    Topic: str
    Seq: int
    Timestamp: str


class Answer(BaseModel):
    Topic: str
    Seq: int
    Answer: list[str] | None
    Think: list[str] | None


class QueryTodo(BaseModel):
    Topic: str | None
    Queries: list[dict[str, str]] | None

