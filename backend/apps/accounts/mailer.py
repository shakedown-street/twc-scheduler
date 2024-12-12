from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def get_default_context():
    return {
        "settings": settings,
    }


def send_password_changed_email(user):
    subject = "Password Changed"
    context = {
        "user": user,
        **get_default_context(),
    }
    message = render_to_string("accounts/email/password_changed.txt", context)
    html_message = render_to_string("accounts/email/password_changed.html", context)

    send_mail(
        subject=subject,
        from_email=settings.DEFAULT_FROM_EMAIL,
        message=message,
        html_message=html_message,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    subject = "Password Reset"
    context = {
        "user": user,
        "uid": uid,
        "token": token,
        **get_default_context(),
    }
    message = render_to_string("accounts/email/password_reset.txt", context)
    html_message = render_to_string("accounts/email/password_reset.html", context)

    send_mail(
        subject=subject,
        from_email=settings.DEFAULT_FROM_EMAIL,
        message=message,
        html_message=html_message,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_verify_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    subject = "Verify Email Address"
    context = {
        "user": user,
        "uid": uid,
        "token": token,
        **get_default_context(),
    }
    message = render_to_string("accounts/email/verify_email.txt", context)
    html_message = render_to_string("accounts/email/verify_email.html", context)

    send_mail(
        subject=subject,
        from_email=settings.DEFAULT_FROM_EMAIL,
        message=message,
        html_message=html_message,
        recipient_list=[user.email],
        fail_silently=False,
    )
