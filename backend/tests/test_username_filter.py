from app.shared.utils.username_filter import is_friendly_username


def test_friendly_valid_names():
    valid_names = [
        "Aritra Sengupta",
        "Rahul Sharma",
        "Priya Mukherjee",
        "Alex Walker",
        "Samantha_K",
        "John Doe 99",
    ]
    for name in valid_names:
        is_friendly, reason = is_friendly_username(name)
        assert is_friendly is True, f"Expected '{name}' to be accepted as friendly, but got: {reason}"
        assert reason is None


def test_blocked_abusive_names():
    abusive_names = [
        "fucku",
        "fuck_you",
        "fuck_off",
        "asshole",
        "bitch",
        "bastard",
        "cunt",
        "whore",
    ]
    for name in abusive_names:
        is_friendly, reason = is_friendly_username(name)
        assert is_friendly is False, f"Expected '{name}' to be rejected as abusive"
        assert "friendly, respectful name" in reason


def test_leetspeak_and_obfuscated_profanity():
    obfuscated_names = [
        "f*ck",
        "f.u.c.k",
        "f_u_c_k_u",
        "fuk_u",
        "fvvck_you",
        "fuuuck",
        "b!tch",
        "b1tch",
        "a$$hole",
        "d1ck_head",
    ]
    for name in obfuscated_names:
        is_friendly, reason = is_friendly_username(name)
        assert is_friendly is False, f"Expected obfuscated '{name}' to be rejected"
        assert "friendly, respectful name" in reason


def test_dating_and_solicitation_names():
    inappropriate_names = [
        "hookup_guy",
        "sex_machine",
        "porn_star",
    ]
    for name in inappropriate_names:
        is_friendly, reason = is_friendly_username(name)
        assert is_friendly is False, f"Expected '{name}' to be rejected"

