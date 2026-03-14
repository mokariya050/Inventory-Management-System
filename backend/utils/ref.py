import random
import string
from datetime import datetime


def generate_ref(prefix: str) -> str:
    """Generate a unique reference number like REC-20250314-4821."""
    date_str = datetime.utcnow().strftime('%Y%m%d')
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{date_str}-{suffix}"
