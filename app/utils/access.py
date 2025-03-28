import os

USERS = {
    k: v
    for k, v in os.environ.items()
    if k.startswith(("Frontend_", "Inference_", "User_"))
}


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
