from pydantic import BaseModel


class Query(BaseModel):
    Topic: str
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
