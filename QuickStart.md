# Getting started deploying ContractBot

## Architecture Summary

ContractBot consists of three major hardware components, each with a
corresponding software stack:

* An "Inference Engine" is a physical machine with a reasonably powerful GPU
  to perform LLM inference.  Code relevant to this component lives under the
  `engine/` directory.

* A backend is a physical machine running a FastAPI server that provides
  several routes.  Code relevant to this component lives under the `app/`
  directory.

* A frontend is a physical machine running a React server and creating a
  single-page interface for interacting with the system.  Code relevant to
  this component lives under the `react/` directory.

It is very reasonable, and even recommended, to host the backend and frontend
on the same physical machine.  The SEIU IU deployment runs on an AWS EC2
t3.small instance, supporting both FastAPI and React servers.

The bulk of the computational load relies on one or more engines.  We
**strongly recommend** that every Inference Engine is a physical machine owned
and controlled by the implementer of a ContractBot instance, and **not** a
cloud-hosted instance under the control of an external entity.

## Deploying an Inference Engine

By design, an Inference Engine that may contain proprietary information, or
even PII, is isolated from general external access.  It performs its work by
calling a backend frequently to inquire whether additional work is available
to perform.  After queries are provided by the backend, another route is
called once an answer is computed.

Within the SEIU IU deployment, our initial Inference Engine is a Mac Studio
(M3 Ultra, 60-core GPU, 96 GiB).  The only port exposed is SSH over 443, and a
small number of public keys are contained in its `.ssh/authorized_keys`.  No
domain name is associated with the Inference Engine, only an IP address.

An Engine must have [Ollama](https://github.com/ollama/ollama) installed.
On Linux doing this is as simple as running the following while logged into
that machine. 

```sh
curl -fsSL https://ollama.com/install.sh | sh
```
On macOS or Windows, a download of an [installer](https://ollama.com/download) is needed.

Updating code on the Inference Engine is peformed via `rsync`, and hence only
from one of the few machines with SSH access to the relevant IP address.  The
script `bin/to-engine-ssh` is used by SEIU, but will have to be adapted
modestly for a different deployment.

### Running the Engine

The script `engine/watch` will loop forever, and periodically call
`poll_queries()` which in turn calls `give_answer()` once an answer is
computed.  The functions each call routes on the backend to obtain or provide
the actual data.

The script `./inference.sh` performs a few tasks prior to launching
`engine/watch`.  It uses Ollama to install several models, then archives
previous data, configures log file location, and restarts the watcher.  The
heart of script is simply:

```sh
nohup engine/watch 2>>$INFERENCE_LOG &
```

You may wish to modify details of `inference.sh` and/or launch `engine/watch`
directly; such changes are straightforward.

### LLM Interaction History

All interactions with the Inference Engine are kept in an SQLite3 database at
`$HOME/.answers.db` on that physical machine.  The following columns are
recorded within the `answers` table:

* Topic - A random string that distinguishes topic threads.
* Seq - A one-based counter of queries within the same topic thread.
* User - Who created this query (and was provided the corresponding answer)?
* Timestamp - Second-resolution ISO-8601 datetime when query was received.
* Query - The query provided by the user.
* Answer - The text produced by the underlying LLM in response.
* Model - The name of the LLM used to calculate the answer.
* Seconds - An integer count of the time generating this answer took.

In general, the interactions records in the Engine's DB will be kept
long-term. However, they will not be copied to exposed public locations.

## Deploying the Backend and Frontend Servers

The SEIU IU deployment uses GitHub Actions to deploy both the backend and
frontend.  The bulk of the deployment work is performed by the script
`.deploy.sh`, which should run similarly in any deployment environment.

The deployment script rotates logs, kills old processes, installs software
components if needed, and so on.  Once initial setup is taken care of, the
backend server is launched with:

```sh
uv run python -m gunicorn [... various flags ...] > \
    $BACKEND_LOG 2>&1 & disown >/dev/null 2>&1
```

The frontend server is similar, using:

```sh
serve -s dist -l 3000 > $FRONTEND_LOG 2>&1 & disown >/dev/null 2>&1
```

### The GitHub Action

You will need to modify the GitHub workflow for a different deployment, and if
you do not use GitHub and/or Actions, the same tasks will be achieved by other
scripts or manual steps.  What the workflow does is:

1. Checkout code to a runner. This will later, but does not yet, run tests to
   gate the next steps.
2. Populate the checkout with login credentials for various users (see below).
3. Use `rsync` to transfer the current code from the runner to the deploy
   instance.
4. Run `bin/make-certs` on the deploy instance.
5. Run `./deploy.sh` on the deploy instance.

## Understanding Credentials

Login credentials are manually maintained (and sometimes rotated) during this
development period.  The `secrets/credentials` file resembles the following:

```
Inference_1=ascii-beijing-analytical-foam
Frontend_1=preparation-lesbians-deserve-soon
Sara_Chan=employment-legitimate-uganda-case
```

Those are, of course, not real credentials, but share the same form.  Later
on, we will probably transition to an OAuth provider and a different
credential system.

Credentials come in three types, as illustrated.  Users named `Inference_*`
can only communicate with a subset of relevant routes.  Users named
`Frontend_*` can only communicate with a distinct subset of the routes.

The only route that regular users can utilize at all is `GET api/login`. All
further actions are performed on their behalf by a `Frontend_*` "user" which
can access relevant routes.  The [Architecture](Architecture.md) document
discusses how the security system works in more detail.
