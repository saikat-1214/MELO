import re
from typing import Tuple

# Pattern matching residential, private, or suspicious domestic address markers
RESIDENTIAL_PATTERNS = [
    r"\bflat\b",
    r"\bflats\b",
    r"\bapartment\b",
    r"\bapartments\b",
    r"\bapt\b",
    r"\bste\b",
    r"\bsuite\b",
    r"\broom\b",
    r"\bmy\s+room\b",
    r"\bmy\s+flat\b",
    r"\bmy\s+house\b",
    r"\bmy\s+home\b",
    r"\bmy\s+place\b",
    r"\bhostel\b",
    r"\bdorm\b",
    r"\bdormitory\b",
    r"\bbasement\b",
    r"\bfloor\b",
    r"\b[0-9]+(?:st|nd|rd|th)?\s+floor\b",
    r"\btower\s+[a-z0-9]+\b",
    r"\bblock\s+[a-z0-9]+\b",
    r"\bplot\s+no\b",
    r"\bhouse\s+no\b",
    r"\bdoor\s+no\b",
    r"\bvilla\b",
    r"\bresidence\b",
    r"\bresidency\b",
    r"\bhousing\s+society\b",
    r"\bgated\s+community\b",
]

COMPILED_RESIDENTIAL_REGEX = [
    re.compile(pattern, re.IGNORECASE) for pattern in RESIDENTIAL_PATTERNS
]


def validate_public_landmark(landmark: str) -> Tuple[bool, str]:
    """
    Validates that a proposed meetup landmark represents an open, verifiable public space
    and does not leak residential, private, or domestic locations.
    """
    if not landmark or len(landmark.strip()) < 6:
        return False, "Public meeting landmark must be at least 6 characters long (e.g. 'Park Street Metro Gate 1')."

    cleaned = landmark.strip()

    for pattern in COMPILED_RESIDENTIAL_REGEX:
        if pattern.search(cleaned):
            return (
                False,
                "For community safety, meetups must take place at recognized public landmarks "
                "(e.g., Metro Station Gate, Public Park Entrance, Stadium, Cafe, Museum). "
                "Residential, private apartments, or domestic addresses are strictly prohibited."
            )

    return True, ""
