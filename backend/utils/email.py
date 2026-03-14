import os
import random
import smtplib
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def generate_otp(length=6):
    """Generate a random numeric OTP of the given length."""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(to_email: str, otp_code: str, purpose: str):
    """
    Send an OTP email via SMTP.

    Reads from environment:
      SMTP_HOST      (default: smtp.gmail.com)
      SMTP_PORT      (default: 587 — STARTTLS; use 465 for SSL)
      SMTP_USER      sender login / from address
      SMTP_PASSWORD  sender password / app-password
      SMTP_FROM      override From address (defaults to SMTP_USER)

    If SMTP_USER or SMTP_PASSWORD are not set the OTP is printed to stdout
    (development fallback) instead of being sent.
    """
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_pass = os.environ.get('SMTP_PASSWORD', '')
    smtp_from = os.environ.get('SMTP_FROM', smtp_user)

    if purpose == 'register':
        subject = 'Your Registration OTP'
        body = (
            f"Welcome!\n\n"
            f"Your email verification code is:\n\n"
            f"    {otp_code}\n\n"
            f"This code expires in 10 minutes. Do not share it with anyone.\n"
        )
    else:  # reset
        subject = 'Password Reset OTP'
        body = (
            f"You requested a password reset.\n\n"
            f"Your one-time reset code is:\n\n"
            f"    {otp_code}\n\n"
            f"This code expires in 10 minutes.\n"
            f"If you did not request a reset, you can safely ignore this email.\n"
        )

    # ── Development fallback ─────────────────────────────────────────────────
    if not smtp_user or not smtp_pass:
        print(
            f"\n[DEV SMTP] ─────────────────────────\n"
            f"  To      : {to_email}\n"
            f"  Subject : {subject}\n"
            f"  OTP     : {otp_code}\n"
            f"────────────────────────────────────\n",
            flush=True,
        )
        return

    # ── Send via SMTP ────────────────────────────────────────────────────────
    msg = MIMEMultipart('alternative')
    msg['From']    = smtp_from
    msg['To']      = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_from, to_email, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.ehlo()
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_from, to_email, msg.as_string())
    except smtplib.SMTPAuthenticationError:
        raise RuntimeError('SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD.')
    except Exception as exc:
        raise RuntimeError(f'Failed to send email: {exc}')
