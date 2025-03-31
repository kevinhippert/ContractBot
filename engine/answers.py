import os
from subprocess import run
import sqlite3
import sys
from textwrap import wrap


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
    ) -> None:
        _answer = "§".join(answer or [])
        _think = "§".join(think or [])
        self.cursor.execute(
            "SELECT max(Seq) FROM answers WHERE Topic =?",
            (topic,),
        )
        seq = self.cursor.fetchone()[0] + 1 if self.cursor.fetchone() else 1
        self.cursor.execute(
            "INSERT INTO answers (Topic, Seq, Query, Answer, Think) VALUES (?,?,?,?,?)",
            (topic, seq, query, _answer, _think),
        )
        self.conn.commit()

    def get_context(self, topic: str, seq: int) -> str:
        pass


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


def RAG(query: str, topic: str, seq: int) -> str:
    # TODO: RAG stuff here
    _context = topic, seq
    return query


def parse_response(response: str) -> tuple[list[str], list[str]]:
    if "<think>" not in response:
        return [], response.strip().split("\n")

    _think, _answer = response.split("<think>")[1].split("</think>")
    think = [t.strip() for t in _think.split("\n") if t.strip()]
    answer = [a.strip() for a in _answer.split("\n") if a.strip()]
    return think, answer


def ask(query: str, topic: str, seq: int, fake=False) -> tuple[list[str], list[str]]:
    if fake or not MODEL:
        return EXAMPLE_RESPONSE["Think"], EXAMPLE_RESPONSE["Answer"]

    enhanced_query = RAG(query, topic, seq)

    # E.g. `ollama run deepseek-r1:32b "What is the meaning of life?"`
    result = run(
        ["ollama", "run", MODEL, enhanced_query], capture_output=True, text=True
    )
    if result.returncode != 0:
        print("Failed to run OLLama")
        return [], []

    think, answer = parse_response(result.stdout)
    # Store the answer in the database for future reference
    answers_db.add_answer(topic, seq, query, answer, think)

    return think, answer


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python answers.py <query> <topic>")
        sys.exit(1)

    query = sys.argv[1]
    topic = sys.argv[2]
    seq = int(sys.argv[3])

    think, answer = ask(query, topic, seq)
    print(f"Topic: {topic}")
    print(f"Seq: {seq}")
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
