from hashlib import sha256
from pathlib import Path

_users = Path("secrets/credentials").read_text().strip()
USERS = dict(line.split("=") for line in _users.splitlines())


def authenticate(user: str, nonce: str, hash: str) -> bool:
    """
    Authenticate the user based on the provided nonce and hash.
    """
    if user not in USERS:
        return False

    data_string = f"{user} {nonce} {USERS[user]}".encode()
    hex_digest = sha256(data_string).hexdigest()
    if hex_digest == hash:
        return True

    return False
