from datetime import datetime
from hashlib import sha1
from secrets import token_urlsafe as make_nonce

import requests

from engine.answers import ask


def give_answer(engine: str, token: str, topic: str, seq: int, queries: list[str]):
    for _query in queries:
        nonce = make_nonce(16)
        hash = sha1(f"{engine} {nonce} {token}".encode()).hexdigest()
        # FIXME: Only disable RAG until we can get secure login working
        think, answer, seq, _seconds = ask(_query, topic, model="default", no_rag=True)
        response = requests.post(
            "https://api.bossbot.org/api/give-new-answer",
            params={"Engine": engine, "Nonce": nonce, "Hash": hash},
            json={
                "Topic": topic,
                "Seq": seq,
                "Think": think,
                "Answer": answer,
            },
        )
        if response.status_code != 200:
            print("Failed to post query answer")


def poll_queries(engine: str, token: str) -> None:
    nonce = make_nonce(16)
    hash = sha1(f"{engine} {nonce} {token}".encode()).hexdigest()
    response = requests.put(
        "http://api.bossbot.org/api/get-new-queries",
        data={"Engine": engine, "Nonce": nonce, "Hash": hash},
    )
    print("XXX", response.text)
    now = datetime.now().isoformat(timespec="seconds")
    if response.status_code == 401:
        print(f"{now} Authentication failed")

    elif response.status_code == 200:
        data = response.json()
        if data["Topic"] is None:
            print(f"{now} No new queries available")
        else:
            topic = data["Topic"]
            seq = data["Seq"]
            queries = data["Queries"]
            give_answer(engine, token, topic, seq, queries)
