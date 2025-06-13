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
| ------------ | ------------------- | --- | ----------------------------------- | ------- |
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
round-robin fashion. Therefore the Pending status indicates that a topic has
been _claimed_ by an inference engine but has not been answered yet.

Pending status lines should be reverted to Open if an answer has not been
received within a configurable timeout period.

## User Routes

Routes in the current version require user authentication, but specifically _do
not_ explicitly distinguish users. That is, while the React UI should generate
globally distinct topic strings to distinguish topics, no mechanism enforces
that an added or checked query using the same topic identifier "belongs" to the
same user.

Future versions are _likely_ to add tighter "user binding" of topics. However,
we can envision scenarios in which sharing topic threads among users is a
perfectly reasonable workflow. Hence the alpha version simply does not commit
as to what such sharing—if any—is desirable.

### `GET api/user-topics`

Takes authentication and OnBehalfOf query parameters:

- User (e.g. `Frontend_1`)
- Nonce
- Hash
- OnBehalfOf (e.g. `Calico_Seders`)

If no topics pertain to this OnBehalfOf user, return a 404 HTTP status.

Otherwise, return a 200 with a body similar to:

```json
{
  "DGQIn+5troxI": "What is the carrying weight on an unladen swallow?",
  "ABC124-993SW": "What is the meaning of life",
  "..."
}
```

### `DEL api/topic`

Takes authentication, OnBehalfOf, and Topic query parameters:

- User (e.g. `Frontend_1`)
- Nonce
- Hash
- OnBehalfOf (e.g. `Calico_Seders`)
- Topic (e.g. `DGQIn+5troxI`)

If no topic with that identifier exists for the OnBehalfOf user, return a 403
HTTP status. Otherwise, return a 200.


### `POST api/add-query`

Takes authentication query parameters:

- User (e.g. `Frontend_1`)
- Nonce
- Hash

Body should look like:

```json
{
  "Topic": "DGQIn+5troxI",
  "User": "John_Doe",
  "Query": "How far can an African swallow fly?",
  "Modifiers": {
    "Region": "...",
    "Category": [],
    "TBD": "Loosely defined schema for this object"
  },
  "Model": "default"
}
```

Models are one of a few permitted values. If an unrecognized string is
provided, the Inference Engine will fall back to "default".

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

- User (e.g. `Frontend_1`)
- Nonce
- Hash
- Topic (e.g. `&Topic=DGQIn+5troxI`)
- Seq (e.g. `&Seq=4`)

Return body should look like this if no answer is available:

```json
{
  "Query": "What is the capital of Zimbabwe?",
  "Topic": "DGQIn+5troxI",
  "Seq": 4,
  "Answer": null,
  "Think": null
}
```

If there is an available answer:

```json
{
  "Query": "What is the capital of Mali?",
  "Topic": "DGQIn+5troxI",
  "Seq": 4,
  "Answer": ["First paragraph", "Second paragraph"],
  "Think": ["Thinking about foo", "Thinking about bar"]
}
```

This response will "dawdle" a bit if no answer is yet available. A loop in
FastAPI will wait one second a few times if no answer is yet ready. When an
answer is available, the response will occur immediately. After a minute or
so of no answer becoming ready, the unavailable response will be sent.

### `GET /api/get-topic-thread`

Takes authentication and topic query parameters:

- User (e.g. `Frontend_1`)
- Nonce
- Hash
- Topic (e.g. `&Topic=DGQIn+5troxI`)

If no matches exist for the topic, return a 404 status code. If a topic thread
exists, return a structure like:

```json
[
  {
    "Query": "What is your favorite color?",
    "Topic": "DGQIn+5troxI",
    "Seq": 1,
    "Answer": ["First paragraph", "Second paragraph"],
    "Think": ["Thinking about foo", "Thinking about bar"]
  },
  {
    "Query": "What is your mothers maiden name?",
    "Topic": "DGQIn+5troxI",
    "Seq": 2,
    "Answer": ["Other stuff"],
    "Think": ["Thinking about baz", "Thinking about bam"]
  },
  ...
]
```

Sequences within a topic are always returned in ascending numeric order.

In contrast to `api/check-query` this route responds immediately with either a
404 status or a 200 status and an array of answers.

### `POST api/add-lookup`

This request queues a text to identify the most similar fragments within the
document/vector database.

Takes authentication query parameters:

- User (e.g. `Frontend_1`)
- Nonce
- Hash

Body should look like:

```json
{
  "Topic": "DGQIn+5troxI",
  "Seq": 4,
  "Fragment": "Employees can accrue comp time for overtime hours worked ...",
  "Count": 5,
  "Threshold": 1.0
}
```

`Fragment` is simply the text we wish to match against existing fragments in
RAG data. The lookup will identify the top-N matches, for N specified by
`Count`.  `Threshold` will discard matches that are too distant in the vector
space of the embedding (lower numbers are "closer").

If `Count` or `Threshold` are not provided, they default to the values shown
in this document.

A response will resemble the following.

```json
{
  "Fingerprint": "7b33f9588431",
  "Timestamp": "2025-03-25T01:02:03"
}
```

The `Fingerprint` is a hash of the fragment being searched that is used as an
index.  E.g.:

```sh
% echo "Employees can accrue comp time for overtime hours worked ..." |
    sha1sum | cut -c-12
7b33f9588431
```

### `GET api/get-lookups`

Takes authentication query parameters:

- User (e.g. `Frontend_1`)
- Nonce
- Hash

Body should look like:

```json
{
  "Topic": "DGQIn+5troxI",
}
```

Response should resemble:

```json
{
  "Topic": "DGQIn+5troxI",
  "Lookups": [
    {
      "Query": "What's the meaning of life?",
      "Fragments": [
{
          "Employees can accrue comp time...": [
            "Match 1 - whole bunch of info, with line breaks embedded",
            "Match 2 - yet more info",
            "..."
          ]
        },
        {
          "Another lookup fragment": [
            "..."
          ]
        }
      ]
    },
    {
      "Query": "...",
      "Fragments": []
    }
  ]
}
```

### `POST /api/recommend`

As with other authentication, we use a nonce, a shared secret, and create a
hash. The query parameters for the route are:

- User (e.g. `Frontend_1`)
- Nonce
- Hash

In the body (discussed), we indicate the `OnBehalfOf` user, but the
authenticating user will simply be `Frontend_1` or similar.

The purpose of this route is for a user to _recommend_ a section of text as
particularly useful, and hence that it should be used in future RAG fragment
matching.

Multiple kinds texts can be recommended, and negative recommendations are
permitted as well.  Either paragraphs from existing answers or answers
composed by users themselves can be incorporated into future model answers.  A
body should resemble:

```json
{
    "Topic": "DGQIn+5troxI",
    "OnBehalfOf": "Calico_Seders", // Not Frontend_1, but regular user
    "Query": "What's the meaning of life?",
    "Fragment": "It don't mean a thing if you ain't got that swing.",
    "Comment": "Duke Ellington frequently lent his wisdom to song lyrics.
               He correctly noted that you need that swing to mean anything.",
    "Type": "Suggest Improvement"
}
```

Types can include:

- Suggest Improvement
- Promote Answer
- Make Correction
- Add Missing Info
- Clarify Phrasing
- Flag as Off Topic

Response will be a 200 HTTP status code if it is stored successfully, and
resemble:

```json
{
  "Timestamp": "2025-03-25T01:02:03"
}
```

### `GET /api/login`

Logins (for now) will be handled by a static list of authorized users, with
names like "User1", "User2", etc. Authentication of a user will be essentially
identical to authentication by an inference engine.

As with other authentication, we use a nonce, a shared secret, and create a
hash. The query parameters for the route are:

- User
- Nonce
- Hash

Responses are simply 200 OK for successful authentication, or 401 Unauthorized.

Suppose we have this information stored on the FastAPI server securely:

| User   | Password         |
| ------ | ---------------- |
| User_1 | 04EMG47U62bjoyL3 |
| User_2 | MLIyPLaQqCJ6tMqP |

The React frontend will take the username and purported password from the user,
and compute:

```javascript
const crypto = require("crypto");
let shasum = crypto.createHash("sha1");
let nonce = crypto.randomBytes(16).toStr;
shasum.update(`${user} ${nonce} ${purported_pw}`);
let hash = shasum.digest("hex");
```

## Inference Engine Authentication

Inference engines are loosely coupled with the frontend, and moreover we wish
for the inference engines to avoid _all dependencies_ on external services.
However, we also require that only authorized engines are permitted to answer
queries.

Requests submitted by inference engines will contain information sufficient for
the frontend to validate them. This will be accomplished by the frontend
maintaining a secure mapping from authorized inference engines to secret tokens
shared between the inference engines and the frontend. For example, the
frontend might have a secure table like:

| Engine      | Tokens              |
| ----------- | ------------------- |
| Inference_1 | 7b18d017f89f61cf17d |
| Inference_2 | 03cfd743661f07975fa |

Validated inference routes will contain the following query parameters:

- User (e.g. "Inference_1")
- Nonce (e.g. "PSjUAS82NcDKgwXq")
- Hash (e.g. "3f71f8a88e09b52f7ff6c73aa96826558b302d32")

If the result of hashing the nonce with the shared secret token does not
produce the hash, then an HTTP 401 status code is returned by the route. The
example shown will validate successfully:[^2]

```bash
echo -n "$Engine $Nonce $Token" | sha1sum
7c5ed0a4c01ff5c0f84544464bdfe706928d4381 -
```

All inference engines **must** generate a new Nonce, and a corresponding new
Hash at **every** call to a secured route to avoid replay attacks.

## Inference Routes

### `GET api/get-new-lookup`

In contrast to the `api/get-new-queries` route that potentially returns
multiple queries, at most one lookup fragment is returned at a time.  Servicing
a lookup takes much less time than servicing a query.

If no new lookup has been requested, the route returns a 404 status code.

If a new lookup is available, the route return a 200 with a body similar to:

```json
{
    "Fragment": "Employees can accrue comp time...",
    "Fingerprint": "4892a5d812af",
    "Count": 5,
    "Threshold": 1.0
}
```

### `POST api/give-new-matches`

When an inference engine has identified matches to a fragment it posts a body
similar to:

```json
{
  "Fingerprint": "4892a5d812af",
  "Matches": [
    "Match 1 - whole bunch of info, with line breaks embedded",
    "Match 2 - yet more info",
    "..."
  ]
}
```

Each match will contain multiple lines, separated by newlines.  Within each
match, the initial portion will contain metadata, then a line with only 5 dots
will occur, followed by approximately a paragraph of relevant content from the
RAG database.  For example, this might be a returned match (generally one of
several):

    Distance: 0.75
    Document Type: Contract
    Company: CHICAGO PUBLIC SCHOOLS
    Division: Public
    Effective Date: 2018-04-09
    Employer: Chicago Public Schools
    Expiration: 2021-04-04
    Local: L00001
    Prior Local Number: L00001
    Document Name: CPS-4-9-18-to-4-4-21-FINAL-rfza_ocr
    Uploaded At: 2023-08-17 19:19
    .....
    Overtime work shall be distributed equitably among employees able and
    qualified to perform the needed overtime work. Section 11. Part-time
    employees may constitute up to fifteen percent (15%) of the total work
    force, but no more at any given time.	Section 12. Employees assigned to
    multiple worksites during their shift shall be paid for eight hours per shift
    which shall include one (1) hour of paid travel time between sites

This data will be stored in the backend table `lookup_matches` and the
frontend will be responsible for formatting the matches.

### `GET api/get-new-queries`

The body contains the validation block discussed in the authentication section.
No additional data is required in the body for this route. Inference engines
will call this route immediately after they complete providing answers to a
previous batch of queries within a topic and also frequently after receiving a
response indicating no such batches exist.

As a means to minimize the latency and number of required authentications, the
server should permit up to a minute or two for queries to become available
before returning a response (but return immediately if some exist). For
example (in pseudo-code):

```python
for _ in range(100)::
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
    { "2": "What is the meaning of life?" },
    { "3": "What is your favorite color?" }
  ]
}
```

Notice that since query 1 within this topic has already been answered, it is
not included in the Queries array of the JSON body. The inference engine _may_
(and probably will) include both earlier queries in the same topic and their
answers into formulating an answer to the identified queries. Those queries
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
  "Query": "What is the meaning of life?",
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

Note that the sequence produced by the engine is not guaranteed to be the same
as the sequence created by the frontend. In normal operation, they should
match, but it is not enforced. The frontend _may decide_ to compare the
underlying query to check this alignment.

Since chain-of-thought models provide self-injection of prompt elaborations, we
can include the “Think” key in the response that the frontend may wish to
expose to users. The answer, as well as the thinking is returned as a list of
paragraphs.

When an answer has been received for a given topic and sequence number, that
row of the Query Objects table should be marked as Done.

[^1]:
    The “inference engine” is an LLM model that utilizes RAG (retrieval
    augmented generation) customized for the needs of SEIU negotiators. Most
    likely the underlying model will be DeepSeek-R1-Distill-Qwen-32B, but this
    detail will not be exposed to users.

[^2]:
    The SHA-1 algorithm is shown in these examples. We may choose to use
    SHA-256 or an alternative cryptographic hash in the actual implementation.
