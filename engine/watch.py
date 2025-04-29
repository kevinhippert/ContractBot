from datetime import datetime
from hashlib import sha256
from secrets import token_urlsafe as make_nonce
from sys import stderr

import requests

from engine.answers import ask


def give_answer(
    engine: str,
    token: str,
    topic: str,
    user: str,
    seq: int,
    query: str,
    model: str = "default",
) -> None:
    nonce = make_nonce(16)
    hash = sha256(f"{engine} {nonce} {token}".encode()).hexdigest()
    think, answer, seq, _seconds = ask(query, topic, user, model)
    response = requests.post(
        "https://api.bossbot.org/api/give-new-answer",
        params={"User": engine, "Nonce": nonce, "Hash": hash},
        json={
            "Query": query,
            "Topic": topic,
            "Seq": seq,
            "Think": think,
            "Answer": answer,
        },
    )
    now = datetime.now().isoformat(timespec="seconds")
    if response.status_code == 200:
        print(f"{now} Posted query answer for {topic}[{seq}]", file=stderr, flush=True)
    else:
        print(
            f"{now} Failed to post query answer for {topic}[{seq}]",
            file=stderr,
            flush=True,
        )


def poll_queries(engine: str, token: str) -> None:
    nonce = make_nonce(16)
    hash = sha256(f"{engine} {nonce} {token}".encode()).hexdigest()
    response = requests.get(
        "http://api.bossbot.org/api/get-new-queries",
        params={"User": engine, "Nonce": nonce, "Hash": hash},
    )
    now = datetime.now().isoformat(timespec="seconds")
    if response.status_code == 401:
        print(f"{now} Authentication failed", file=stderr, flush=True)

    elif response.status_code == 200:
        data = response.json()
        if data["Topic"] is not None:
            print(f"{now} {data}", file=stderr, flush=True)
            topic = data["Topic"]
            for Q in data["Queries"]:
                seq, (query, model) = Q.popitem()
                give_answer(engine, token, topic, seq, query, model)
