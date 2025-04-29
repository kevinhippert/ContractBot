from collections import namedtuple
from contextlib import redirect_stderr
import io
from pathlib import Path
from subprocess import run
import sqlite3
from time import monotonic

import chromadb

from app.models import MODELS

Result = namedtuple("Result", ["doc", "distance"])
INTRODUCTION = """
You are assisting union staff in negotiating and strengthening collective
bargaining agreements.

Context Sources:

PRIOR ANSWERS:
  The AI’s previous responses about this topic.

RELEVANT DOCUMENTS:
  Excerpts from existing union contracts, model language, and other references
  retrieved via RAG.

QUERY:
    The user’s new question or request.

Instructions to the AI:

1. Cite Real Examples & Sources

Refer to specific clauses, locals, or sectors only if they are verifiably
mentioned in the “RELEVANT DOCUMENTS” or “PRIOR ANSWERS.”

If you’re unsure whether a union local or contract exists in the provided data,
disclaim your uncertainty rather than invent details.

2. Use Provided Content as Primary Evidence

When RELEVANT DOCUMENTS or PRIOR ANSWERS appear, quote or paraphrase them for
specificity (e.g., direct contract language, bullet-pointed clauses).

If “RELEVANT DOCUMENTS” are absent, rely on general knowledge and best
practices for union negotiations.

3. Offer Suggestions & Improvements

Don’t just restate language—recommend ways to strengthen or enhance it.

Anticipate management pushback and propose creative, forward-thinking
solutions.

4. Provide Substantive, Detailed Responses

Avoid vague answers; give specific language or actionable details.

Use bullet points, headings, or short paragraphs for clarity.

5. Proactively Consider Equity

If the query involves topics that could affect equity (e.g., anything involving
distribution of pay, job assignments, or benefits), feel free to raise equity
considerations—even if the user didn’t explicitly ask—if it’s a logical,
relevant concern.

Do not force equity commentary where there’s no clear connection.

6. Handling Sector Examples

If the user or the context specifies a particular sector (e.g., healthcare,
public sector, education), focus on examples and best practices from that
sector.

If the user doesn’t name a sector and there’s no contextual clue, provide
examples from a variety of relevant sectors (public, private, healthcare,
education, etc.) as appropriate.

7. Hallucination Control

Do not fabricate contract clauses, union locals, or legislation. If no
references are available, give hypothetical suggestions and label them as such.

---

Please assist us in exploring union contract negotiations.

The first part of the query below provides context from previous answers given
within this topic.  The prior answers section is prefixed with a line reading
only "PRIOR ANSWERS:"

The second part of the query consists of paragraphs taken from relevant
documents. These paragraphs are selected using RAG (retrieval augmented
generation).  The RAG section is prefixed with a line reading only
"RELEVANT DOCUMENTS:"

The new query that we are trying to answer is prefixed with a line reading
only "QUERY:".

If the header "RELEVANT DOCUMENTS:" is absent, the query will concern general
knowlege rather than be specific to union contract negotiations.
"""


class Answers:
    def __init__(self, db_file=Path.home() / ".answers.db"):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS answers (
                Topic TEXT NOT NULL,
                Seq INTEGER NOT NULL,
                User TEXT NOT NULL,
                Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                Query TEXT NOT NULL,
                Answer TEXT,
                Think TEXT,
                Model TEXT NOT NULL DEFAULT 'default',
                Seconds INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_topic ON answers(Topic)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_status ON answers(Seq)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_user ON answers(User)"
        )
        self.conn.commit()

    def add_answer(
        self,
        topic: str,
        user: str,
        query: str,
        answer: list[str],
        think: list[str],
        model: str,
        seconds: int = 0,
    ) -> int:
        _answer = "§".join(answer or [])
        _think = "§".join(think or [])
        self.cursor.execute(
            "SELECT max(Seq) FROM answers WHERE Topic =?",
            (topic,),
        )
        row = self.cursor.fetchone()
        seq = 1 if row[0] is None else row[0] + 1
        self.cursor.execute(
            "INSERT INTO answers (Topic, Seq, User, Query, Answer, Think, Model, Seconds) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (topic, seq, user, query, _answer, _think, model, seconds),
        )
        self.conn.commit()
        return seq

    def get_context(self, topic: str) -> str:
        self.cursor.execute(
            "SELECT Answer FROM answers WHERE Topic =? ORDER BY Seq ASC",
            (topic,),
        )
        rows = self.cursor.fetchall()
        context = "\n\n".join(row[0] for row in rows)
        return context

    def __del__(self):
        self.conn.close()


EXAMPLE_RESPONSE = {
    "Topic": "DGQIn+5troxI",
    "Seq": 2,
    "Think": [
        "That’s a great question.",
        "Many philosophers have asked that.",
        "Duke Ellington seems relevant.",
    ],
    "Answer": ["It don’t mean a thing if you ain’t got that swing."],
}


def search_fragments(
    query: str,
    n_results: int = 5,
    max_distance: float = 1.0,
    collection_name: str = "BossBot",
):
    client = chromadb.PersistentClient()
    collection = client.get_collection(name=collection_name)
    with redirect_stderr(io.StringIO()) as _f:
        matches = collection.query(query_texts=[query], n_results=n_results)

    results = []
    docs = (matches["documents"] or [[]])[0]  # Index 0 since only one query
    distances = (matches["distances"] or [[]])[0]
    for distance, doc in zip(distances, docs):
        # Results are returned by ascending distance
        if distance > max_distance:
            break
        results.append(Result(doc, distance))
    return results


def get_rag(
    query: str,
    n_results: int = 50,
    max_distance: float = 1.0,
    collection_name: str = "BossBot",
) -> str:
    results = search_fragments(
        query,
        n_results=n_results,
        max_distance=max_distance,
        collection_name=collection_name,
    )
    # Only "paragraphs" that match, not the header metadata
    docs = [result.doc for result in results]
    chunks = "\n\n".join(d.split("\n.....\n")[1] for d in docs)
    return f"RELEVANT DOCUMENTS:\n\n{chunks}"


def get_context(topic: str) -> str:
    context = Answers().get_context(topic)  # Get context for the topic, if any
    return f"PRIOR ANSWERS:\n{context}"


def parse_response(response: str) -> tuple[list[str], list[str]]:
    if "<think>" not in response:
        return [], response.strip().split("\n")

    _think, _answer = response.split("<think>")[1].split("</think>")
    think = [t.strip() for t in _think.split("\n") if t.strip()]
    answer = [a.strip() for a in _answer.split("\n") if a.strip()]
    return think, answer


def ask(
    query: str,
    topic: str,
    user: str = "Unknown",
    model: str | None = "default",
    no_rag: bool = False,
    no_context: bool = False,
    introduction: str = INTRODUCTION,
) -> tuple[list[str], list[str], int, int]:
    if not model:
        # Mypy complaint is odd:
        #    tuple[object, object, int, int],
        #    expected "tuple[list[str],list[str], int, int]
        think = EXAMPLE_RESPONSE["Think"]
        answer = EXAMPLE_RESPONSE["Answer"]
        return think, answer, 0, 0  # type: ignore

    start = monotonic()
    # If invalid or alias given for model, use default
    _query = f"QUERY:\n{query}"
    model = MODELS.get(model) or MODELS["default"]
    context = "" if no_context else get_context(topic)
    rag_docs = "" if no_rag else get_rag(query)

    if len(context) > 200_000:
        # This topic has aquired many prior answers.  Age out the oldest answers
        # from the overall context. Keep approximately 50,000 tokens from prior
        # answers (assume a token is approx 4 characters)
        context = f"PRIOR ANSWERS:\n{context[-200_000:]}"

    # Remove null bytes for safety (how they sneak in is unclear)
    div = "\n\n"
    enhanced_query = div.join([introduction, context, rag_docs, _query])
    enhanced_query = enhanced_query.replace("\x00", " ")

    # E.g. `ollama run deepseek-r1:32b "What is the meaning of life?"`
    result = run(
        ["ollama", "run", model, enhanced_query], capture_output=True, text=True
    )
    if result.returncode != 0:
        print("Failed to run OLLama")
        return [], [], 0, 0

    think, answer = parse_response(result.stdout)
    # Store the answer in the database for future reference
    # NOTE: the sequence produced by the engine is not guaranteed to be the
    #   same as the sequence created by the frontend.  In normal operation,
    #   they should match, but it is not enforced.
    seconds = int(monotonic() - start)
    seq = Answers().add_answer(topic, user, query, answer, think, model, seconds)

    return think, answer, seq, seconds
