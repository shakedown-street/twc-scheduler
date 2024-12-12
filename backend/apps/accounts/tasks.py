from celery import shared_task
from django.core.mail import send_mail


@shared_task
def async_send_email(sbj: str, frm: str, msg: str, html_msg: str, rcpts: list[str]):
    send_mail(
        subject=sbj,
        from_email=frm,
        message=msg,
        html_message=html_msg,
        recipient_list=rcpts,
        fail_silently=False,
    )
