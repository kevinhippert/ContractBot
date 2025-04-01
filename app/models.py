from pydantic import BaseModel


class Query(BaseModel):
    Topic: str
    Query: str
    Modifiers: dict = {}


class QueryAck(BaseModel):
    Topic: str
    Seq: int
    Timestamp: str


class Answer(BaseModel):
    Query: str
    Topic: str
    Seq: int
    Answer: list[str] | None
    Think: list[str] | None


class QueryTodo(BaseModel):
    Topic: str | None
    Queries: list[dict[str, str]] | None

