"""
Validation utilities for user input
"""
import re
from fastapi import HTTPException


def validate_phone_az(phone: str) -> bool:
    """
    Validate Azerbaijan phone number format
    Expected formats:
    - +994XXXXXXXXX (12 digits total)
    - 994XXXXXXXXX (11 digits total)
    - 0XXXXXXXXX (10 digits total)
    Returns True if valid, raises HTTPException if invalid
    """
    if not phone:
        return True  # Phone is optional
    
    # Remove spaces and dashes
    phone_clean = phone.replace(" ", "").replace("-", "")
    
    # Check formats
    patterns = [
        r'^\+994[0-9]{9}$',  # +994XXXXXXXXX
        r'^994[0-9]{9}$',     # 994XXXXXXXXX
        r'^0[0-9]{9}$',       # 0XXXXXXXXX
    ]
    
    if not any(re.match(pattern, phone_clean) for pattern in patterns):
        raise HTTPException(
            status_code=400,
            detail="Invalid phone number format. Expected: +994XXXXXXXXX, 994XXXXXXXXX, or 0XXXXXXXXX"
        )
    return True


def validate_fin(fin: str) -> bool:
    """
    Validate Azerbaijan FIN (Fərdi İdentifikasiya Nömrəsi)
    Expected format: 7 alphanumeric characters
    Returns True if valid, raises HTTPException if invalid
    """
    if not fin:
        return True  # FIN is optional
    
    fin_pattern = r'^[A-Z0-9]{7}$'
    if not re.match(fin_pattern, fin.upper()):
        raise HTTPException(
            status_code=400,
            detail="Invalid FIN format. Expected: 7 alphanumeric characters"
        )
    return True


def validate_password_strength(password: str) -> bool:
    """
    Validate password strength
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    Returns True if valid, raises HTTPException if invalid
    """
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )
    
    if not re.search(r'[A-Z]', password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter"
        )
    
    if not re.search(r'[a-z]', password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter"
        )
    
    if not re.search(r'[0-9]', password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one digit"
        )
    
    return True


def validate_username(username: str) -> bool:
    """
    Validate username format
    Requirements:
    - 3-100 characters
    - Only alphanumeric, underscore, and dash
    Returns True if valid, raises HTTPException if invalid
    """
    if len(username) < 3:
        raise HTTPException(
            status_code=400,
            detail="Username must be at least 3 characters"
        )
    
    if len(username) > 100:
        raise HTTPException(
            status_code=400,
            detail="Username too long (max 100 characters)"
        )
    
    username_pattern = r'^[a-zA-Z0-9_-]+$'
    if not re.match(username_pattern, username):
        raise HTTPException(
            status_code=400,
            detail="Username can only contain letters, numbers, underscore, and dash"
        )
    
    return True
