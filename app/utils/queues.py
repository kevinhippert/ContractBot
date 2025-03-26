import sqlite3

from app.models import Answer, QueryTodo


class QueryQueue:
    def __init__(self, db_file: str = ".queue.db"):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()

        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS queries (
                Topic TEXT NOT NULL,
                Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                Seq INTEGER NOT NULL,
                Query TEXT NOT NULL,
                Status TEXT NOT NULL DEFAULT 'Open',
                Answer TEXT,
                Think TEXT
            )
            """
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_topic ON queries(Topic)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(Status)"
        )
        self.conn.commit()

    def add_query(self, topic: str, query: str) -> tuple[int, str]:
        self.cursor.execute(
            "SELECT Seq FROM queries WHERE Topic =? ORDER BY Seq DESC LIMIT 1", (topic,)
        )
        seq = 1  # Start from 1 if new topic
        if last_seq := self.cursor.fetchone():
            seq = last_seq[0] + 1

        self.cursor.execute(
            "INSERT INTO queries (Topic, Seq, Query) VALUES (?,?,?)",
            (topic, seq, query),
        )
        self.cursor.execute(
            "SELECT Timestamp FROM queries WHERE Topic =? AND Seq =?", (topic, seq)
        )
        received = self.cursor.fetchone()[0]
        self.conn.commit()
        return seq, received

    def find_queries(self) -> dict:
        self.cursor.execute(
            "SELECT Topic, Seq, Query FROM queries WHERE Status = 'Open'"
        )
        rows = self.cursor.fetchall()
        if not rows:
            todo = QueryTodo(Topic=None, Queries=None)
            return todo.model_dump()

        topic = rows[0][0]
        queries = [{row[1]: row[2]} for row in rows if row[0] == topic]
        todo = QueryTodo(Topic=topic, Queries=queries)
        return todo.model_dump()

    def mark_pending(self, topic: str, seqs: list[int]) -> None:
        self.cursor.execute(
            "UPDATE queries SET Status ='Pending' WHERE Topic =? AND Seq IN ?",
            (topic, seqs),
        )
        self.conn.commit()

    def update_answer(self, answer: Answer) -> None:
        topic = answer.Topic
        seq = answer.Seq
        _answer = "§".join(answer.Answer or [])
        think = "§".join(answer.Think or [])
        self.cursor.execute(
            "UPDATE queries "
            "SET Answer =?, Think =?, Status = 'Done'"
            "WHERE Topic =? AND Seq =?",
            (_answer, think, topic, seq),
        )


query_queue = QueryQueue()
