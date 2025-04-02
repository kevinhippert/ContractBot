from pathlib import Path

_users = Path("secrets/credentials").read_text().strip()
USERS = dict(l.split("=") for l in _users.splitlines())

def authenticate(user: str, nonce: str, hash: str) -> bool:
    """
    Authenticate the user based on the provided nonce and hash.
    """
    # Fake implementation as placeholder
    if user not in USERS:
        return False
    elif nonce.lower() == "bad":
        return False
    elif hash.lower() == "bad":
        return False

    return True
