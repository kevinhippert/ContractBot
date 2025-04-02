# Tasks

## Deployment

[X] Create a repository (SEIU/BossBot)
[X] Create an instance for BossBot UI to run on.
[X] DNS stuff for https://bossbot.org.
[X] AWS stuff with load balancer, port forwarding, etc. 
    (with much help from Nick)
[X] Deployment script to launch Gunicorn and React servers

## React/UI

## Gunicorn/FastAPI Server

[ ] Authentication mechanism (designed and distributed with GitHub secrets,
    but not implemented currently).
[X] `POST api/add-query` correctly writes to `query_queue`.
[ ] `GET api/check-query` (dummy form returns fortune messages).
[ ] `GET api/login` (exists in dummy form for development).
[X] `GET api/get-new-queries`
[?] `POST api/give-new-answer` (probably working, but not tested yet).

## Inference Engine(s)

[X] Vectorizing tool for raw documents (`mk_db`)
[X] `Answer` class in `answers.py` to provide access to storage of queries, 
    topics, answers, etc.
[X] `ask()` to inject RAG and history context, then call a model specified by
    environment variable `BOSSBOT_MODEL`.
[X] Command-line tool `answer.py` to provide developer access to equivalent
    results as API, using the `ask()` function.


# Notes

- For unclear reasons, the "cosine" metric is ignored when `{"hnsw:space":
  "cosine"}` is passed as argument to `.create_collection()`.  Collection
  is simply created as "l2" instead.
- The argument `{"hnsw:space": "inner"}` instead raises an exception.
- _Perhaps_ these metrics are incompatible with the default embedding model?

    
