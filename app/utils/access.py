from hashlib import sha256
from pathlib import Path

_users = Path("secrets/credentials").read_text().strip()
USERS = dict(line.split("=") for line in _users.splitlines())

# TODO: For TWR deadline, keep used nonces in-memory.
# In future, persist in a database or file
nonces_seen = set()


def authenticate(user: str, nonce: str, hash: str) -> bool:
    """
    Authenticate the user based on the provided nonce and hash.
    """
    global nonces_seen
    if user not in USERS:
        return False

    if nonce in nonces_seen:
        # Guard against replay attacks (MITM still a danger)
        return False

    nonces_seen.add(nonce)
    data_string = f"{user} {nonce} {USERS[user]}".encode()
    hex_digest = sha256(data_string).hexdigest()
    if hex_digest == hash:
        return True

    return False
