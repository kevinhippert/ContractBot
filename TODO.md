# Tasks

NOTE: We have adopted GitHub Issues to track these items, and the canonical
status of them is maintained at https://github.com/SEIU/BossBot/issues rather
than in this document.

## Deployment

- [x] Create a repository (SEIU/BossBot)
- [x] Create an instance for BossBot UI to run on.
- [x] DNS stuff for https://bossbot.org and https://api.bossbot.org.
- [x] AWS stuff with load balancer, port forwarding, etc.
- [x] Deployment script to launch Gunicorn and React servers
- [x] Each redeployment removes old `.queue.db`
      (Inference Engines keeps records and archives DB).
- [ ] Periodically remove old rows from `.queue.db`.
- [x] Create `Frontend_2` user for local development.
- [x] Calico access to Inference Engine via SSH?
- [x] Answers database lives at `$HOME/.answers.db`
      (will not get deleted on redeployment).
- [x] Rotate passwords post-conference.

## React/UI

- [x] Chat interface.
- [x] Login screen with authentication.
- [x] Authentication of `api/add-query` and `api/check-query`
- [ ] Category tags (conceptually in place, but need to decide specifics).
- [x] Topic creation and switching.
- [x] Pass LLM model selection to `api/add-query`.
- [x] User aliases for topic IDs (use first query).
- [x] Handle "no answer" for `api/check-query` response.
- [x] Prettify answers returned:
  - [x] Paragraph breaks between each item in Answer array.
  - [ ] Bold (or similar marker) for **marked** words/phrases.
  - [x] Header indication for lines starting with "###" etc.
- [ ] Markdown tables.
- [ ] Pin topic list to left, don't scroll with answers.
- [ ] New topic at top of list of previous topics.
- [ ] Query entry box should wrap text longer than its width.

## Gunicorn/FastAPI Server

- [x] Authentication mechanism.
- [x] `POST api/add-query` correctly writes to `QueryQueue`.
- [x] `GET api/check-query`.
- [x] `GET api/login`.
- [x] `GET api/get-new-queries`
- [x] `POST api/give-new-answer`.
- [x] Persist the single-use nonce check.

## Inference Engine(s)

- [x] Command-line tool `mk_db` for vectorizing raw documents.
- [x] `Answer` class in `answers.py` to provide access to storage of queries,
      topics, answers, etc.
- [x] Command-line tool `search` to show RAG content identified matching queries.
- [x] `ask()` to inject RAG and history context, then call a model specified by
      environment variable `BOSSBOT_MODEL`. In `answers.py`.
- [x] Command-line tool `answer` to provide developer access to equivalent
      results as API, using the `ask()` function.
- [x] Runner `watch` polls for questions, produces answers, and cals APIs.

# Notes

- For unclear reasons, the "cosine" metric is ignored when `{"hnsw:space":
"cosine"}` is passed as argument to `.create_collection()`. Collection
  is simply created as "l2" instead.
- The argument `{"hnsw:space": "inner"}` instead raises an exception.
- _Perhaps_ these metrics are incompatible with the default embedding model?
