import pytest
from datetime import date, timedelta
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.modules.users.schemas import OnboardingRequest
from app.modules.users.service import calculate_age


def test_password_hashing():
    pw = "SecurePassword123!"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_lifecycle():
    data = {"sub": "123e4567-e89b-12d3-a456-426614174000", "email": "test@example.com"}
    access = create_access_token(data, expires_delta=timedelta(minutes=15))
    refresh = create_refresh_token(data, expires_delta=timedelta(days=1))

    decoded_access = decode_token(access)
    assert decoded_access["sub"] == data["sub"]
    assert decoded_access["email"] == data["email"]
    assert decoded_access["type"] == "access"

    decoded_refresh = decode_token(refresh)
    assert decoded_refresh["sub"] == data["sub"]
    assert decoded_refresh["type"] == "refresh"


def test_age_calculation():
    today = date.today()
    # 20 years old
    bday_20 = date(today.year - 20, today.month, today.day)
    assert calculate_age(bday_20) == 20

    # Under 18
    bday_17 = date(today.year - 17, today.month, today.day)
    assert calculate_age(bday_17) == 17


def test_onboarding_age_validation():
    today = date.today()
    # Under 18 should raise ValidationError
    underage_date = date(today.year - 17, today.month, today.day)
    with pytest.raises(ValueError, match="at least 18 years old"):
        OnboardingRequest(
            display_name="Young User",
            birth_date=underage_date,
            general_location="Kolkata",
            interests=[{"interest_id": "123e4567-e89b-12d3-a456-426614174000", "proficiency_level": 3}],
        )


def test_onboarding_location_privacy_validation():
    today = date.today()
    valid_bday = date(today.year - 25, today.month, today.day)

    # Street address leakage should raise ValidationError
    with pytest.raises(ValueError, match="prohibited for privacy and safety"):
        OnboardingRequest(
            display_name="Safe User",
            birth_date=valid_bday,
            general_location="Flat 4B, Park Street Apartment",
            interests=[{"interest_id": "123e4567-e89b-12d3-a456-426614174000", "proficiency_level": 3}],
        )

    # Valid general locality should succeed
    req = OnboardingRequest(
        display_name="Safe User",
        birth_date=valid_bday,
        general_location="Park Street, Kolkata",
        interests=[{"interest_id": "123e4567-e89b-12d3-a456-426614174000", "proficiency_level": 3}],
    )
    assert req.general_location == "Park Street, Kolkata"
