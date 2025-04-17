# Tasks

## Deployment

- [X] Create a repository (SEIU/BossBot)
- [X] Create an instance for BossBot UI to run on.
- [X] DNS stuff for https://bossbot.org and https://api.bossbot.org.
- [X] AWS stuff with load balancer, port forwarding, etc.
- [X] Deployment script to launch Gunicorn and React servers
- [X] Each redeployment removes old `.queue.db`
      (Inference Engines keeps records and archives DB).
- [ ] Periodically remove old rows from `.queue.db`.
- [X] Create `Frontend_2` user for local development.
- [ ] Calico access to Inference Engine via SSH?
- [-] Answers database lives at `$HOME/.answers.db`
      (will not get deleted on redeployment).
- [ ] Rotate passwords post-conference.

## React/UI

- [X] Chat interface.
- [X] Login screen with authentication.
- [X] Authentication of `api/add-query` and `api/check-query`
- [ ] Category tags (conceptually in place, but need to decide specifics).
- [X] Topic creation and switching.
- [X] Pass LLM model selection to `api/add-query`.
- [X] User aliases for topic IDs (use first query).
- [X] Handle "no answer" for `api/check-query` response.
- [X] Prettify answers returned:
  - [X] Paragraph breaks between each item in Answer array.
  - [ ] Bold (or similar marker) for **marked** words/phrases.
  - [X] Header indication for lines starting with "###" etc.
- [ ] Markdown tables.
- [ ] Pin topic list to left, don't scroll with answers.
- [ ] New topic at top of list of previous topics.
- [ ] Query entry box should wrap text longer than its width.

## Gunicorn/FastAPI Server

- [X] Authentication mechanism.
- [X] `POST api/add-query` correctly writes to `QueryQueue`.
- [X] `GET api/check-query`.
- [X] `GET api/login`.
- [X] `GET api/get-new-queries`
- [X] `POST api/give-new-answer`.
- [ ] Persist the single-use nonce check.  Show nonce reuse vs bad hash? 

## Inference Engine(s)

- [X] Command-line tool `mk_db` for vectorizing raw documents.
- [X] `Answer` class in `answers.py` to provide access to storage of queries,
      topics, answers, etc.
- [X] Command-line tool `search` to show RAG content identified matching queries.
- [X] `ask()` to inject RAG and history context, then call a model specified by
      environment variable `BOSSBOT_MODEL`. In `answers.py`.
- [X] Command-line tool `answer` to provide developer access to equivalent
      results as API, using the `ask()` function.
- [X] Runner `watch` polls for questions, produces answers, and cals APIs.

# Notes

- For unclear reasons, the "cosine" metric is ignored when `{"hnsw:space":
"cosine"}` is passed as argument to `.create_collection()`. Collection
  is simply created as "l2" instead.
- The argument `{"hnsw:space": "inner"}` instead raises an exception.
- _Perhaps_ these metrics are incompatible with the default embedding model?
