from typing import Tuple, Optional
from email_validator import validate_email, EmailNotValidError

# Known disposable/temporary email provider domains
DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "tempmail.com",
    "temp-mail.org",
    "10minutemail.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "sharklasers.com",
    "yopmail.com",
    "yopmail.fr",
    "trashmail.com",
    "throwawaymail.com",
    "dispostable.com",
    "getairmail.com",
    "fakeinbox.com",
    "generator.email",
    "maildrop.cc",
    "inboxkitten.com",
}

# Major trusted mail providers guaranteed to have active MX records (bypasses network DNS query)
MAJOR_TRUSTED_DOMAINS = {
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.in",
    "yahoo.co.uk",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "proton.me",
    "protonmail.com",
    "zoho.com",
    "zoho.in",
    "aol.com",
    "ymail.com",
    "mail.com",
    "gmx.com",
}

# Common domain typos
COMMON_TYPOS = {
    "gmai.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "outlok.com": "outlook.com",
}


def verify_email_address(
    email: str, check_mx: bool = True
) -> Tuple[bool, str, Optional[str], Optional[str]]:
    """
    Validates an email address.
    Returns:
        (is_valid: bool, normalized_email_or_error: str, suggestion: Optional[str], error_code: Optional[str])
    """
    if not email or "@" not in email:
        return False, "Email address must contain an '@' sign.", None, "INVALID_SYNTAX"

    parts = email.split("@")
    if len(parts) != 2:
        return False, "Invalid email format.", None, "INVALID_SYNTAX"

    domain = parts[1].lower().strip()

    # 1. Check for common domain typos
    suggestion = None
    if domain in COMMON_TYPOS:
        suggestion = f"{parts[0]}@{COMMON_TYPOS[domain]}"

    # 2. Check for disposable email domains
    if domain in DISPOSABLE_DOMAINS:
        return (
            False,
            "Disposable or temporary email addresses are not permitted on SocialConnect for community safety.",
            None,
            "DISPOSABLE_EMAIL_PROHIBITED",
        )

    # 3. Check RFC syntax and domain structure
    try:
        # First validate format
        valid = validate_email(email, check_deliverability=False)
        normalized = valid.normalized
    except EmailNotValidError as e:
        return False, str(e), None, "INVALID_SYNTAX"

    # 4. Deliverability / MX check (if enabled)
    # Fast path: Skip network DNS query for known reliable global email providers
    if check_mx and domain not in MAJOR_TRUSTED_DOMAINS:
        try:
            valid_mx = validate_email(normalized, check_deliverability=True)
            normalized = valid_mx.normalized
        except EmailNotValidError as e:
            # If domain does not exist or has no MX records
            return False, f"Domain '@{domain}' cannot receive emails or does not exist.", suggestion, "UNDELIVERABLE_DOMAIN"
        except Exception:
            # Gracefully handle network/DNS timeout without blocking legitimate users
            pass

    return True, normalized, suggestion, None

