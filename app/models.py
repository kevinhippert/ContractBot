from typing import Literal

from pydantic import BaseModel


class Query(BaseModel):
    Topic: str
    User: str
    Query: str
    Modifiers: dict = {}
    Model: str = "default"


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
    # Queries is a list of dicts {Seq: (Query, User, Model)}
    Queries: list[dict[int, tuple[str, str, str]]] | None


class Lookup(BaseModel):
    # Used by FastAPI backend server"
    Topic: str
    Seq: int
    Fragment: str
    Count: int = 5
    Threshold: float = 1.0


class Match(BaseModel):
    # Used by FastAPI backend server"
    Query: str
    # Fragments maps answer fragment to list of RAG fragments
    Fragments: list[dict[str, list[str]]]


class LookupMatch(BaseModel):
    # Used by FastAPI backend server"
    Topic: str
    Lookups: list[Match]


class LookupTodo(BaseModel):
    # Used by Inference Engine"
    Fragment: str
    Fingerprint: str
    Count: int = 5
    Threshold: float = 1.0


class LookupMatches(BaseModel):
    # Used by Inference Engine (different from LookupMatch)"
    Fingerprint: str
    Matches: list[str]


class Recommendation(BaseModel):
    Topic: str
    OnBehalfOf: str
    Query: str
    Fragment: str
    Comment: str
    Type: Literal[
        "Suggest Improvement",
        "Promote Answer",
        "Make Correction",
        "Note Missing Info",
        "Note Unclear Phrasing",
        "Note Off Topic",
    ]


# This plays off the two meanings of "models".  Pydantic models are above,
# Below we define a dict to use Ollama/LLM models
MODELS = {
    "fastest": "deepseek-r1:7b",  # ~14s
    "faster": "gemma3:27b",  # ~30s
    "default": "deepseek-r1:32b",  # ~34s
    "alternate": "qwq",  # ~50s
    "deepseek-r1:7b": "deepseek-r1:7b",
    "gemma3:27b": "gemma3:27b",
    "deepseek-r1:32b": "deepseek-r1:32b",
    "qwq": "qwq",
}
