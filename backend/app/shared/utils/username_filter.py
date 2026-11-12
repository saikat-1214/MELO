import re
from typing import Tuple, Optional

# Core list of profanities, slurs, abusive terms, and harassment roots
BLOCKED_TERMS = {
    "fuck", "fuk", "fvck", "fck", "fuc",
    "bitch", "b1tch", "btch",
    "asshole", "ashole", "a55hole",
    "bastard", "dick", "d1ck",
    "cunt", "c*nt",
    "slut", "whore",
    "pussy", "puss",
    "nigger", "nigga", "faggot", "fag", "retard",
    "nazi", "hitler",
    "shit", "sh1t",
    "porn", "xxx", "sex", "dating", "hookup",
}

# Leetspeak substitution map for de-obfuscation
LEET_MAP = {
    "@": "a",
    "4": "a",
    "8": "b",
    "3": "e",
    "1": "i",
    "!": "i",
    "|": "i",
    "0": "o",
    "5": "s",
    "$": "s",
    "7": "t",
    "+": "t",
    "v": "u",
}


def normalize_username(name: str) -> str:
    """
    Normalizes a name for profanity inspection by:
    1. Converting to lower case.
    2. Substituting common leetspeak characters.
    3. Collapsing repeated characters (e.g. 'fuuuuck' -> 'fuck').
    4. Stripping non-alphanumeric punctuation.
    """
    cleaned = name.lower().strip()
    
    # 1. Substitute leetspeak
    trans_chars = []
    for char in cleaned:
        trans_chars.append(LEET_MAP.get(char, char))
    substituted = "".join(trans_chars)

    # 2. Strip punctuation and whitespace (e.g., 'f.u.c.k' -> 'fuck')
    alpha_only = re.sub(r"[^a-z0-9]", "", substituted)

    # 3. Collapse repeating consecutive letters (e.g. 'fuuuck' -> 'fuck')
    collapsed = re.sub(r"(.)\1+", r"\1", alpha_only)

    return alpha_only, collapsed


def is_friendly_username(name: str) -> Tuple[bool, Optional[str]]:
    """
    Validates that a display name is respectful, friendly, and free from abusive/profane words.
    Returns:
        (is_friendly: bool, rejection_reason: Optional[str])
    """
    if not name or len(name.strip()) < 2:
        return False, "Display name must be at least 2 characters long."

    if len(name.strip()) > 50:
        return False, "Display name cannot exceed 50 characters."

    # Check that it contains at least one letter
    if not any(c.isalpha() for c in name):
        return False, "Display name must contain letters."

    alpha_only, collapsed = normalize_username(name)

    # Check exact word tokens and collapsed strings
    for blocked in BLOCKED_TERMS:
        # Check if the blocked root is contained in alpha_only or collapsed
        if blocked in alpha_only or blocked in collapsed:
            return (
                False,
                "Please choose a friendly, respectful name. Abusive, profane, or offensive terms are not permitted."
            )

    return True, None

