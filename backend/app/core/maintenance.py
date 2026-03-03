from datetime import datetime, timedelta, timezone
from threading import Lock


_maintenance_enabled: bool = False
_maintenance_message: str = (
    "Sistemdə texniki təmir işləri aparılır. Xahiş edirik bir müddət sonra yenidən cəhd edin."
)
_maintenance_effective_at: datetime | None = None
_lock = Lock()


def enable_maintenance(message: str | None = None, delay_seconds: int = 60) -> None:
    """
    Texniki rejimi aktiv et, lakin dərhal deyil – delay_seconds sonra tam güclə işə düşəcək.
    """
    global _maintenance_enabled, _maintenance_message, _maintenance_effective_at
    with _lock:
        _maintenance_enabled = True
        if message:
            _maintenance_message = message
        _maintenance_effective_at = datetime.now(timezone.utc) + timedelta(seconds=delay_seconds)


def disable_maintenance() -> None:
    global _maintenance_enabled, _maintenance_effective_at
    with _lock:
        _maintenance_enabled = False
        _maintenance_effective_at = None


def is_maintenance_enabled() -> bool:
    return _maintenance_enabled


def get_maintenance_message() -> str:
    return _maintenance_message


def get_effective_at() -> datetime | None:
    return _maintenance_effective_at


def get_seconds_until_logout() -> int | None:
    """
    Texniki rejim aktivləşdirildikdən sonra qalan saniyəni qaytarır.
    Aktiv deyilsə None, artıq keçibsə 0 qaytarır.
    """
    if not _maintenance_enabled or _maintenance_effective_at is None:
        return None
    now = datetime.now(timezone.utc)
    delta = (_maintenance_effective_at - now).total_seconds()
    return max(0, int(delta))


def is_maintenance_active_now() -> bool:
    """
    Texniki rejim həqiqətən tətbiq olunurmu (grace period bitibmi)?
    """
    secs = get_seconds_until_logout()
    return _maintenance_enabled and secs is not None and secs == 0

