from app.shared.utils.email_verifier import verify_email_address


def test_valid_email_syntax():
    valid, normalized, suggestion, code = verify_email_address("valid.user@gmail.com", check_mx=False)
    assert valid is True
    assert normalized == "valid.user@gmail.com"
    assert code is None


def test_invalid_email_syntax():
    valid, error, suggestion, code = verify_email_address("plainaddress", check_mx=False)
    assert valid is False
    assert code == "INVALID_SYNTAX"

    valid2, error2, suggestion2, code2 = verify_email_address("user@.com", check_mx=False)
    assert valid2 is False
    assert code2 == "INVALID_SYNTAX"


def test_disposable_email_blocking():
    disposable_samples = [
        "scammer@mailinator.com",
        "bot@tempmail.com",
        "throwaway@guerrillamail.com",
        "temp@10minutemail.com",
    ]
    for email in disposable_samples:
        valid, error, suggestion, code = verify_email_address(email, check_mx=False)
        assert valid is False, f"Expected {email} to be blocked as disposable"
        assert code == "DISPOSABLE_EMAIL_PROHIBITED"
        assert "Disposable or temporary" in error


def test_email_typo_suggestion():
    valid, res, suggestion, code = verify_email_address("alex@gmai.com", check_mx=False)
    assert suggestion == "alex@gmail.com"

    valid2, res2, suggestion2, code2 = verify_email_address("sarah@yaho.com", check_mx=False)
    assert suggestion2 == "sarah@yahoo.com"

