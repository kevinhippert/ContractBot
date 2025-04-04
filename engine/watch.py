from datetime import datetime
from hashlib import sha1
import os
from secrets import token_urlsafe as make_nonce
from time import sleep

import requests

from engine.answers import ask


def give_answer(engine: str, token: str, topic: str, seq: int, queries: list[str]):
    for _query in queries:
        nonce = make_nonce(16)
        hash = sha1(f"{nonce} {token}".encode()).hexdigest()
        think, answer, seq = ask(_query, topic)
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


def poll_queries(engine, token):
    nonce = make_nonce(16)
    hash = sha1(f"{nonce} {token}".encode()).hexdigest()
    response = requests.put(
        "http://bossbot.org/api/get-new-queries",
        data={"Engine": engine, "Nonce": nonce, "Hash": hash},
    )
    if response.status_code == 401:
        print("Authentication failed")
        exit(1)

    elif response.status_code == 200:
        data = response.json()
        if data["Topic"] is None:
            print(
                f"{datetime.now().isoformat(timespec="seconds")} "
                "No new queries available"
            )
        else:
            topic = data["Topic"]
            seq = data["Seq"]
            queries = data["Queries"]
            give_answer(engine, token, topic, seq, queries)


if __name__ == "__main__":
    missing = False
    for key in [
        "BOSSBOT_ENGINE_NAME",
        "BOSSBOT_ENGINE_TOKEN",
        "BOSSBOT_MODEL",
        "TOKENIZER_PARALLELISM",
    ]:
        if not os.getenv(key):
            print(f"Missing environment variable: {key}")
            missing = True
    if missing:
        exit(1)

    engine = os.getenv("BOSSBOT_ENGINE_NAME")
    token = os.getenv("BOSSBOT_ENGINE_TOKEN")
    while True:
        poll_queries(engine=engine, token=token)
        sleep(1)
