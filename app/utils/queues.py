from hashlib import sha1
import sqlite3
from typing import NewType


from app.models import (
    Answer,
    Lookup,
    LookupMatch,
    LookupTodo,
    Match,
    MODELS,
    QueryTodo,
    Recommendation,
)

priority_queue: list[str] = []
Timestamp = NewType("Timestamp", str)


class QueryQueue:
    def __init__(self, db_file: str = ".queue.db"):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()

        # Table for queries, and some indices
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS queries (
                Topic TEXT NOT NULL, -- Topic ID (random short string)
                Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                User TEXT NOT NULL,
                Seq INTEGER NOT NULL,
                Query TEXT NOT NULL, -- User-provided query
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
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_queries_user ON queries(User)"
        )

        # Table for lookups, and some indices
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS lookups (
                Topic TEXT NOT NULL,
                Seq Integer NOT NULL,
                Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                Fragment TEXT NOT NULL, -- Fragment (paragraph) from an Answer
                Fingerprint TEXT NOT NULL, -- Hash of the fragment
                Count INTEGER NOT NULL DEFAULT 5,  -- Max matches to find
                Threshold REAL NOT NULL DEFAULT 1.0,  -- Required match closeness
                Status TEXT NOT NULL DEFAULT 'Open'
            )
            """
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_lookups_topic ON lookups(Topic)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_lookups_status ON lookups(Status)"
        )
        self.cursor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS "
            "idx_lookups_fingerprint ON lookups(Fingerprint)"
        )

        # Table for lookup matches, and an index
        # One-to-many relationship between lookup and matches
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS lookup_matches (
                Fingerprint TEXT NOT NULL,  -- Specifically non-unique lookup hash
                Match TEXT NOT NULL
            )
            """
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS "
            "idx_lookup_matches_fingerprint ON lookup_matches(Fingerprint)"
        )
        self.conn.commit()

        # Table for recommendations
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS recommendations (
                Topic TEXT NOT NULL,
                OnBehalfOf TEXT NOT NULL,
                Query TEXT NOT NULL,
                Fragment TEXT NOT NULL,
                Comment TEXT NOT NULL,
                Type TEXT NOT NULL,
                Status TEXT NOT NULL DEFAULT 'Available',
                Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        self.conn.commit()

    def __del__(self):
        self.conn.close()

    def get_user_topics(self, user: str) -> dict[str, str]:
        self.cursor.execute(
            "SELECT DISTINCT Topic "
            "FROM queries "
            "WHERE User =? "
            "ORDER BY Timestamp DESC",
            (user,),
        )
        topics = [row[0] for row in self.cursor.fetchall()]
        # Cannot use a list as binding parameter.
        # Since `topics` is generated internally, no SQL injection vulnerability.
        topic_list = ",".join(f"'{topic}'" for topic in topics)
        self.cursor.execute(
            "SELECT Topic, Query "
            "FROM queries "
            f"WHERE Topic IN ({topic_list}) "
            "AND Seq = 1 "
            "ORDER BY Timestamp DESC",
        )
        return dict(self.cursor.fetchall())

    def add_query(
        self, topic: str, user: str, query: str, modifiers: dict, model: str
    ) -> tuple[int, str]:
        # Dereference alias names for Ollama models
        model = MODELS.get(model) or MODELS["default"]

        self.cursor.execute(
            "SELECT Seq FROM queries WHERE Topic =? ORDER BY Seq DESC LIMIT 1", (topic,)
        )
        seq = 1  # Start from 1 if new topic
        if last_seq := self.cursor.fetchone():
            seq = last_seq[0] + 1

        # Enhance the query with categories if provided
        if categories := modifiers.get("Category"):
            prefix = "\n".join(f"Category: {cat.upper()}" for cat in categories)
            query = f"{prefix}\n.....\n{query}"

        self.cursor.execute(
            "INSERT INTO queries (Topic, Seq, User, Query, Model) "
            "VALUES (?,?,?,?,?) "
            "RETURNING Timestamp",
            (topic, seq, user, query, model),
        )
        received = self.cursor.fetchone()[0]
        self.conn.commit()
        return seq, received

    def find_queries(self) -> QueryTodo | None:
        self.cursor.execute(
            "SELECT Topic, Seq, Query, User, Model FROM queries WHERE Status = 'Open'"
        )
        rows = self.cursor.fetchall()
        if not rows:
            return None

        # First topic, ignore other topics for this call
        topic = rows[0][0]
        # Map Seq -> (Query, Model) for each item in the first topic found
        # Note: (query, user, model) = row[2:5]
        queries = [{row[1]: tuple(row[2:5])} for row in rows if row[0] == topic]
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

    def find_answers(self, topic: str) -> list[Answer]:
        self.cursor.execute(
            "SELECT Query, Seq, Answer, Think "
            "FROM queries "
            "WHERE Topic =? "
            "ORDER BY Seq",
            (topic,),
        )
        result = list(map(list, self.cursor))  # mutable lists, not tuples
        for row in result:
            row[2] = row[2] or ""  # If Answer is None, set it to empty string
            row[3] = row[3] or ""  # If Think is None, set it to empty string

        return [
            Answer(
                Query=row[0],
                Topic=topic,
                Seq=row[1],
                Answer=row[2].split("§"),
                Think=row[3].split("§"),
            )
            for row in result
        ]

    def user_topics(self, user: str) -> list[str]:
        self.cursor.execute(
            "SELECT DISTINCT Topic FROM queries WHERE User =?",
            (user,),
        )
        return [row[0] for row in self.cursor.fetchall()]

    def recent_users(self) -> list[str]:
        self.cursor.execute(
            "SELECT User, max(Timestamp) ts "
            "FROM queries "
            "GROUP BY User "
            "HAVING datetime('now', '-30 minutes') <= ts "
            "ORDER BY ts DESC"
        )
        return [row[0] for row in self.cursor.fetchall()]

    def add_lookup(self, lookup: Lookup) -> tuple[str, Timestamp]:
        fingerprint = sha1(lookup.Fragment.encode()).hexdigest()
        # This fingerprint might already exist
        self.cursor.execute(
            "SELECT Timestamp FROM lookups WHERE Fingerprint =?",
            (fingerprint,),
        )
        if timestamp := self.cursor.fetchone():
            return fingerprint, timestamp[0]

        self.cursor.execute(
            "INSERT INTO lookups (Topic, Seq, Fragment, Fingerprint, Count, Threshold) "
            "VALUES (?,?,?,?,?,?)"
            "RETURNING Timestamp",
            (
                lookup.Topic,
                lookup.Seq,
                lookup.Fragment,
                fingerprint,
                lookup.Count,
                lookup.Threshold,
            ),
        )
        timestamp = self.cursor.fetchone()[0]
        self.conn.commit()
        return fingerprint, timestamp

    def answer_lookup(self, fingerprint: str, matches: list[str]) -> None:
        self.cursor.execute(
            "UPDATE lookups SET Status='Done' WHERE Fingerprint =?",
            (fingerprint,),
        )
        self.cursor.executemany(
            "INSERT INTO lookup_matches (Fingerprint, Match) VALUES (?,?)",
            [(fingerprint, match) for match in matches],
        )
        self.conn.commit()

    def find_topic_lookups(self, topic: str) -> dict:
        """
        Return a LookupMatch¹ with a Topic and a Lookups list of Match objects.
        Each Match contains a Query and a list of Fragments. E.g.

          LookupMatch(
            Topic="DGQIn+5troxI",
            Lookups=[
              Match(
                Query="What's the meaning of life?",
                Fragments=[
                  {"Employees can accrue comp time...": [
                    "Match 1 - whole bunch of info, with line breaks embedded",
                    "Match 2 - yet more info",
                    "..."
                  ]},
                  {"Another lookup fragment": ["..."]}
                ]
              ),
              Match(
                Query="...",
                Fragments=[],
              )
            ]
          )

        ¹Technically, we dump this all to a dict for the return value, but use
        Pydantic models for more readable creation and type checking.
        """
        # Find all the answered queries within a topic
        topic_lookups = LookupMatch(
            Topic=topic,
            Lookups=[],  # Populate below
        )

        # More than we need (not all answers have lookups), but still a small number
        self.cursor.execute(
            "SELECT Seq, Query FROM queries WHERE Topic =? AND Status = 'Done'",
            (topic,),
        )
        seq_to_query = dict(self.cursor)

        # Get each sequence and fingerprint within the topic
        self.cursor.execute(
            "SELECT Seq, Fragment, Fingerprint "
            "FROM lookups "
            "WHERE Topic =? AND Status = 'Done'",
            (topic,),
        )
        for seq, fragment, fingerprint in self.cursor.fetchall():
            # We really should have this sequence within this topic
            if seq not in seq_to_query:
                print(f"ALERT: Topic={topic} Seq={seq} not found in `lookups` table!")
                continue
            else:
                query = seq_to_query[seq]

            # Ready to add matches for fragments under this query
            topic_lookups.Lookups.append(Match(Query=query, Fragments=[{fragment: []}]))

            # Find all matches for this fingerprint/fragment
            self.cursor.execute(
                "SELECT Match FROM lookup_matches WHERE Fingerprint =?",
                (fingerprint,),
            )
            for match in self.cursor.fetchall():
                match = match[0]
                topic_lookups.Lookups[-1].Fragments[-1][fragment].append(match)

        return topic_lookups.model_dump()

    def get_new_lookup(self) -> LookupTodo | None:
        self.cursor.execute(
            "SELECT Fragment, Fingerprint, Count, Threshold "
            "FROM lookups "
            "WHERE Status = 'Open' "
            "ORDER BY Timestamp "
            "LIMIT 1"
        )
        new = self.cursor.fetchone()
        if not new:
            return None
        else:
            fragment, fingerprint, count, threshold = new
            self.cursor.execute(
                "UPDATE lookups SET Status='Pending' WHERE Fingerprint =?",
                (fingerprint,),
            )
            self.conn.commit()
            return LookupTodo(
                Fragment=fragment,
                Fingerprint=fingerprint,
                Count=count,
                Threshold=threshold,
            )

    def update_matches(self, fingerprint: str, matches: list[str]) -> None:
        self.cursor.execute(
            "UPDATE lookups SET Status='Done' WHERE Fingerprint =?",
            (fingerprint,),
        )
        self.cursor.executemany(
            "INSERT INTO lookup_matches (Fingerprint, Match) VALUES (?,?)",
            [(fingerprint, match) for match in matches],
        )
        self.conn.commit()

    def recommend(self, rec: Recommendation) -> str:
        self.cursor.execute(
            "INSERT INTO recommendations "
            "(Topic, OnBehalfOf, Query, Fragment, Comment, Type) "
            "VALUES (?,?,?,?,?,?) "
            "RETURNING Timestamp",
            (rec.Topic, rec.OnBehalfOf, rec.Query, rec.Fragment, rec.Comment, rec.Type),
        )
        self.conn.commit()
        return self.cursor.fetchone()[0]
