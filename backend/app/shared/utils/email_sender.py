import smtplib
import asyncio
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger("email_sender")


def _send_smtp_sync(to_email: str, subject: str, html_content: str, text_content: str) -> bool:
    """Synchronous SMTP email delivery function."""
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            "⚠️ [SMTP NOT CONFIGURED] Outgoing email delivery is disabled. "
            "To send emails to real inboxes, configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in backend/.env."
        )
        return False

    sender_email = settings.EMAILS_FROM_EMAIL or settings.SMTP_USER
    sender_name = settings.EMAILS_FROM_NAME or "SocialConnect"
    from_header = f"{sender_name} <{sender_email}>"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_header
    msg["To"] = to_email

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    msg.attach(part1)
    msg.attach(part2)

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            if settings.SMTP_TLS:
                server.starttls()

        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(sender_email, [to_email], msg.as_string())
        server.quit()
        logger.info(f"✅ Real email successfully delivered to {to_email} via SMTP!")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to deliver email to {to_email}: {e}")
        return False


async def send_verification_email(to_email: str, otp_code: str) -> bool:
    """
    Sends the 6-digit confirmation code to the user's inbox asynchronously.
    """
    subject = f"{otp_code} is your SocialConnect verification code"

    text_content = f"""Welcome to SocialConnect!

Your 6-digit email confirmation code is: {otp_code}

This code will expire in 15 minutes. Enter it on the verification screen to activate your account.

If you did not request this account, you can safely ignore this email.
"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
    .container {{ max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
    .logo {{ font-size: 24px; font-weight: 800; color: #059669; text-align: center; margin-bottom: 24px; }}
    .title {{ font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 12px; }}
    .desc {{ font-size: 14px; color: #64748b; text-align: center; line-height: 1.5; margin-bottom: 24px; }}
    .otp-box {{ background: #ecfdf5; border: 2px dashed #10b981; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #065f46; font-family: monospace; }}
    .footer {{ font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SocialConnect</div>
    <div class="title">Verify Your Email Address</div>
    <div class="desc">
      Thank you for joining our community! Enter the 6-digit confirmation code below to verify your email address.
    </div>
    <div class="otp-box">
      <div class="otp-code">{otp_code}</div>
    </div>
    <div class="desc" style="font-size: 12px;">
      This verification code is valid for <strong>15 minutes</strong>. Never share this code with anyone.
    </div>
    <div class="footer">
      If you did not request this account, please disregard this email.<br>
      &copy; SocialConnect Community Platform
    </div>
  </div>
</body>
</html>
"""

    return await asyncio.to_thread(
        _send_smtp_sync, to_email, subject, html_content, text_content
    )

