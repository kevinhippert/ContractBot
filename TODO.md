# Tasks

## Deployment

[X] Create a repository (SEIU/BossBot)
[X] Create an instance for BossBot UI to run on.
[X] DNS stuff for https://bossbot.org and https://api.bossbot.org.
[X] AWS stuff with load balancer, port forwarding, etc.
[X] Deployment script to launch Gunicorn and React servers

## React/UI

[ ] Chat interface.  Sort-of done. Needs to be prettier.
[ ] Login screen with authentication.
[X] Authentication of `api/add-query` and `api/check-query`
[ ] Category tags (conceptually in place, but need to decide specifics).
[ ] Topic creation and switching (wireframe exists, not functionality).

## Gunicorn/FastAPI Server

[X] Authentication mechanism.
[X] `POST api/add-query` correctly writes to `query_queue`.
[ ] `GET api/check-query` (dummy form returns fortune messages).
[X] `GET api/login`.
[X] `GET api/get-new-queries`
[?] `POST api/give-new-answer` (probably working, but not tested yet).

## Inference Engine(s)

[X] Command-line tool `mk_db` for vectorizing raw documents.
[X] `Answer` class in `answers.py` to provide access to storage of queries,
    topics, answers, etc.
[X] Command-line tool `search` to show RAG content identified matching queries.
[X] `ask()` to inject RAG and history context, then call a model specified by
    environment variable `BOSSBOT_MODEL`.  In `answers.py`.
[X] Command-line tool `answer` to provide developer access to equivalent
    results as API, using the `ask()` function.
[?] Runner `watch` that will poll for questions and produce answers, calling
    appropriate APIs. Probably working, but not tested yet.

# Notes

- For unclear reasons, the "cosine" metric is ignored when `{"hnsw:space":
  "cosine"}` is passed as argument to `.create_collection()`.  Collection
  is simply created as "l2" instead.
- The argument `{"hnsw:space": "inner"}` instead raises an exception.
- _Perhaps_ these metrics are incompatible with the default embedding model?
