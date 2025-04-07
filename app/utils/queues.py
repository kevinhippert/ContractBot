import sqlite3

from app.models import Answer, MODELS, QueryTodo


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
                Think TEXT,
                Model TEXT NOT NULL DEFAULT 'default'
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

    def __del__(self):
        self.conn.close()

    def add_query(self, topic: str, query: str, model: str) -> tuple[int, str]:
        # Dereference alias names for Ollama models
        model = MODELS.get(model) or MODELS["default"]

        self.cursor.execute(
            "SELECT Seq FROM queries WHERE Topic =? ORDER BY Seq DESC LIMIT 1", (topic,)
        )
        seq = 1  # Start from 1 if new topic
        if last_seq := self.cursor.fetchone():
            seq = last_seq[0] + 1

        self.cursor.execute(
            "INSERT INTO queries (Topic, Seq, Query, Model) VALUES (?,?,?,?)",
            (topic, seq, query, model),
        )
        self.cursor.execute(
            "SELECT Timestamp FROM queries WHERE Topic =? AND Seq =?", (topic, seq)
        )
        received = self.cursor.fetchone()[0]
        self.conn.commit()
        return seq, received

    def find_queries(self) -> QueryTodo | None:
        self.cursor.execute(
            "SELECT Topic, Seq, Query, Model FROM queries WHERE Status = 'Open'"
        )
        rows = self.cursor.fetchall()
        if not rows:
            return None

        # First topic, ignore other topics for this call
        topic = rows[0][0]
        # Map Seq -> (Query, Model) for each item in the first topic found
        queries = [{row[1]: (row[2], row[3])} for row in rows if row[0] == topic]
        return QueryTodo(Topic=topic, Queries=queries)

    def mark_pending(self, topic: str, seqs: list[int]) -> None:
        for seq in seqs:
            # NOTE: For unknown reasons, the `Seq IN ?` form doesn't work
            # There won't be more than a couple seqs, so this if fine.
            self.cursor.execute(
                "UPDATE queries SET Status='Pending' WHERE Topic =? AND Seq =?",
                (topic, seq),
            )
        self.conn.commit()

    def update_answer(self, answer: Answer) -> None:
        topic = answer.Topic
        seq = answer.Seq
        _answer = "§".join(answer.Answer or [])
        think = "§".join(answer.Think or [])
        sql = """
            UPDATE queries
            SET Answer =?, Think =?, Status = 'Done'
            WHERE Topic =? AND Seq =?
        """
        self.cursor.execute(sql, (_answer, think, topic, seq))
        self.conn.commit()

    def find_answer(self, topic: str, seq: int) -> Answer | None:
        self.cursor.execute(
            "SELECT Query, Answer, Think "
            "FROM queries "
            "WHERE Topic =? AND Seq =? AND Status = 'Done'",
            (topic, seq),
        )
        result = self.cursor.fetchone()
        if result is not None:
            query, answer, think = result
            return Answer(
                Query=query,
                Topic=topic,
                Seq=seq,
                Answer=answer.split("§"),
                Think=think.split("§"),
            )
        return None
