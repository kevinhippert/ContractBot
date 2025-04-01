#!/usr/bin/env python
from contextlib import redirect_stderr
import io
import os
from subprocess import run
import sqlite3
import sys
from textwrap import wrap

import chromadb


class Answers:
    def __init__(self, db_file: str = ".answers.db"):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS answers (
                Topic TEXT NOT NULL,
                Seq INTEGER NOT NULL,
                Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                Query TEXT NOT NULL,
                Answer TEXT,
                Think TEXT
            )
            """
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_topic ON answers(Topic)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_status ON answers(Seq)"
        )
        self.conn.commit()

    def add_answer(
        self, topic: str, query: str, answer: list[str], think: list[str]
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
            "INSERT INTO answers (Topic, Seq, Query, Answer, Think) VALUES (?,?,?,?,?)",
            (topic, seq, query, _answer, _think),
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


answers_db = Answers()

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
MODEL = os.getenv("BOSSBOT_MODEL")


def get_rag(query: str, n_results: int = 50, collection_name: str = "BossBot") -> str:
    client = chromadb.PersistentClient()
    collection = client.get_collection(name=collection_name)
    with redirect_stderr(io.StringIO()) as _stderr:
        results = collection.query(query_texts=[query], n_results=n_results)

    # Only "paragraphs" that match, not the header metadata
    docs = (results.get("documents") or ["\n.....\n"])[0]
    chunks = "\n\n".join(d.split("\n.....\n")[1] for d in docs)
    return f"Context documents for the query:\n\n{chunks}"


def get_context(topic: str) -> str:
    context = answers_db.get_context(topic)  # Get context for the topic, if any
    return f"Context prior answers in this topic:\n\n{context}"


def parse_response(response: str) -> tuple[list[str], list[str]]:
    if "<think>" not in response:
        return [], response.strip().split("\n")

    _think, _answer = response.split("<think>")[1].split("</think>")
    think = [t.strip() for t in _think.split("\n") if t.strip()]
    answer = [a.strip() for a in _answer.split("\n") if a.strip()]
    return think, answer


def ask(query: str, topic: str, fake=False) -> tuple[list[str], list[str], int]:
    if fake or not MODEL:
        return EXAMPLE_RESPONSE["Think"], EXAMPLE_RESPONSE["Answer"], 0

    context = get_context(topic)
    rag_docs = get_rag(query)
    enhanced_query = f"{context}\n\n{rag_docs}\n\n{query}"

    # E.g. `ollama run deepseek-r1:32b "What is the meaning of life?"`
    result = run(
        ["ollama", "run", MODEL, enhanced_query], capture_output=True, text=True
    )
    if result.returncode != 0:
        print("Failed to run OLLama")
        return [], [], 0

    think, answer = parse_response(result.stdout)
    # Store the answer in the database for future reference
    # NOTE: the sequence produced by the engine is not guaranteed to be the 
    #   same as the sequence created by the frontend.  In normal operation, 
    #   they should match, but it is not enforced.
    seq = answers_db.add_answer(topic, query, answer, think)

    return think, answer, seq


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python answers.py <query> <topic>")
        sys.exit(1)

    query = sys.argv[1]
    topic = sys.argv[2]
    verbose = os.getenv("BOSSBOT_VERBOSE")

    think, answer, seq = ask(query, topic)
    print(f"Topic: {topic} [{seq}]")
    if verbose:
        print("Think:")
        for t in think:
            for line in wrap(t):
                print(f"  {line}")
            print()
    print("Answer:")
    for a in answer:
        for line in wrap(a):
            print(f"  {line}")
        print()
