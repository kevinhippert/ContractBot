# Architecture

The BossBot frontend will provide a friendly interface for users to make
queries to the inference engine.[^1] The inference engine(s) itself will be
externally hosted on a machine more capable of running an LLM than is the small
instance hosting the frontend.

# Query Queuing

When a query is made by a user, the frontend places it in a collection of
active topic threads, each item having the following structure, illustrated
with a few examples:

### Query Objects

| Topic        | Timestamp           | Seq | Query                               | Status  |
|--------------|---------------------|-----|-------------------------------------|---------|
| DGQIn+5troxI | 2025-03-22T13:35:49 | 1   | What day is it?                     | Done    |
| DGQIn+5troxI | 2025-03-22T13:36:08 | 2   | What is the meaning of life?        | Open    |
| DGQIn+5troxI | 2025-03-22T13:36:22 | 3   | What is your favorite color?        | Open    |
| qSBb7/zYhIN0 | 2025-03-22T12:55:15 | 1   | What is the secret password?        | Done    |
| R4FHJu8+hl1n | 2025-03-22T13:45:14 | 1   | Who is your least favorite sibling? | Pending |
| R4FHJu8+hl1n | 2025-03-22T13:47:22 | 2   | What is their name?                 | Pending |

Any topic with one or more rows with Open status are eligible to be answered by
an inference engine.  

Although we only anticipated standing up one initial inference engine, in
principle we could create multiple such machines to service requests in a
round-robin fashion.  Therefore the Pending status indicates that a topic has
been *claimed* by an inference engine but has not been answered yet.

Pending status lines should be reverted to Open if an answer has not been
received within a configurable timeout period.

## User Routes

### `POST api/add-query`

Takes authentication query parameters:

- User (e.g. `Frontend-1`)
- Nonce
- Hash

Body should look like:

```json
{
    "Topic": "DGQIn+5troxI",
    "Query": "How far can an African swallow fly?",
    "Modifiers": {
        "Region": "...",
        "Category": [],
        "TBD": "Loosely defined schema for this object"
    }
}
```

Response should look like:

```json
{
    "Topic": "DGQIn+5troxI",
    "Seq": 4,
    "Timestamp": "2025-03-25T01:02:03"
}
```

### `GET api/check-query`

Takes authentication and topic query parameters:

- User (e.g. `Frontend-1`)
- Nonce
- Hash
- Topic (e.g. `&Topic=DGQIn+5troxI`)
- Seq (e.g. `&Seq=4`)

Return body should look like this if no answer is available:

```json
{
    "Topic": "DGQIn+5troxI",
    "Seq": 4,
    "Answer": null,
    "Think": null
}
```

If there is an available answer:

```json
{
    "Topic": "DGQIn+5troxI",
    "Seq": 4,
    "Answer": ["First paragraph", "Second paragraph"],
    "Think": ["Thinking about foo", "Thinking about bar"]
}
```

This response will "dawdle" a bit if no answer is yet available.  A loop in
FastAPI will wait one second a few times if no answer is yet ready.  When an
answer is available, the response will occur immediately.  After a minute or
two of no answer becoming ready, the unavailable response will be sent.

### `GET /api/login`

Logins (for now) will be handled by a static list of authorized users, with
names like "User1", "User2", etc.  Authentication of a user will be essentially
identical to authentication by an inference engine.

As with other authentication, we use a nonce, a shared secret, and create a
hash.  The query parameters for the route are:

- User
- Nonce
- Hash

Responses are simply 200 OK for successful authentication, or 401 Unauthorized.

Suppose we have this information stored on the FastAPI server securely:

| User   | Password         |
|--------|------------------|
| User-1 | 04EMG47U62bjoyL3 |
| User-2 | MLIyPLaQqCJ6tMqP |

The React frontend will take the username and purported password from the user,
and compute:

```javascript
const crypto = require('crypto');
let shasum = crypto.createHash('sha1');
let nonce = crypto.randomBytes(16).toStr
shasum.update(`${user} ${nonce} ${purported_pw}`); 
let hash = shasum.digest('hex');
```

## Inference Engine Authentication

Inference engines are loosely coupled with the frontend, and moreover we wish
for the inference engines to avoid *all dependencies* on external services.
However, we also require that only authorized engines are permitted to answer
queries.

Requests submitted by inference engines will contain information sufficient for
the frontend to validate them.  This will be accomplished by the frontend
maintaining a secure mapping from authorized inference engines to secret tokens
shared between the inference engines and the frontend.  For example, the
frontend might have a secure table like:

| Engine       | Tokens                                   |
|--------------|------------------------------------------|
| Inference-1  | 7b18d017f89f61cf17d47f92749ea6930a3f1deb |
| Inference-2  | 03cfd743661f07975fa2f1220c5194cbaff48451 |

Validated inference routes will contain the following query parameters:

- User (e.g. "Inference-1")
- Nonce (e.g. "PSjUAS82NcDKgwXq")
- Hash (e.g. "37f5bbd5657e3d69b1cabd81c2b8671e050d05d7")

If the result of hashing the nonce with the shared secret token does not
produce the hash, then an HTTP 401 status code is returned by the route.  The
example shown will validate successfully:[^2]

```bash
sha1sum <(echo "$Nonce $Token")
37f5bbd5657e3d69b1cabd81c2b8671e050d05d7
```

All inference engines **must** generate a new Nonce, and a corresponding new
Hash at **every** call to a secured route to avoid replay attacks.

## Inference Routes

### `PUT api/get-new-queries`

The body contains the validation block discussed in the authentication section.
No additional data is required in the body for this route.  Inference engines
will call this route immediately after they complete providing answers to a
previous batch of queries within a topic and also frequently after receiving a
response indicating no such batches exist.

As a means to minimize the latency and number of required authentications, the
server should permit up to a minute or two for queries to become available
before returning a response (but return immediately if some exist).  For
example (in pseudo-code):

```python
for _ in range(100):
    if queries := find_queries():
        return queries
        sleep(1)
return no_queries
```

If no new batches of queries are available, a 200 OK response will have the
body:

```json
{
    "Topic": null,
    "Queries": null
}
```

If topics are open—as is shown in the Query Objects table above—a response body
will resemble:

```json
{
    "Topic": "DGQIn+5troxI",
    "Queries": [
        {"2": "What is the meaning of life?"},
        {"3": "What is your favorite color?"}
    ]
}
```

Notice that since query 1 within this topic has already been answered, it is
not included in the Queries array of the JSON body.  The inference engine *may*
(and probably will) include both earlier queries in the same topic and their
answers into formulating an answer to the identified queries.  Those queries
and answers can be cached within the inference engine based on the topic
identifier.

Upon providing this response, the frontend server should mark each
corresponding row of the Query Objects table as Pending so that other inference
engines are not sent the same queries.

### `POST api/give-new-answer`

When an inference engine has completed an answer to one query (not necessarily
the only query it has received within a topic), it posts the answer in the form:

```json
{
    "Topic": "DGQIn+5troxI",
    "Seq": 2,
    "Think": [
        "That’s a great question.",
        "Many philosophers have asked that.",
        "Duke Ellington seems relevant."
    ],
    "Answer": ["It don’t mean a thing if you ain’t got that swing."]
}
```

Since chain-of-thought models provide self-injection of prompt elaborations, we
can include the “Think” key in the response that the frontend may wish to
expose to users.  The answer, as well as the thinking is returned as a list of
paragraphs.

When an answer has been received for a given topic and sequence number, that
row of the Query Objects table should be marked as Done.

[^1]:  The “inference engine” is an LLM model that utilizes RAG (retrieval
augmented generation) customized for the needs of SEIU negotiators.  Most
likely the underlying model will be DeepSeek-R1-Distill-Qwen-32B, but this
detail will not be exposed to users.

[^2]:  The SHA-1 algorithm is shown in these examples.  We may choose to use
SHA-256 or an alternative cryptographic hash in the actual implementation.
