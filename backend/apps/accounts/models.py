from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.mail import send_mail
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from schedule_builder.mixins import UUIDPrimaryKeyMixin
from apps.accounts.managers import EmailUserManager


def email_user_image_upload_to(user, filename):
    ext = filename.split(".")[-1]
    return f"email_users/{user.id}/image.{ext}"


class EmailUser(AbstractBaseUser, PermissionsMixin, UUIDPrimaryKeyMixin):
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=30, blank=True)
    last_name = models.CharField(_("last name"), max_length=30, blank=True)
    image = models.ImageField(
        upload_to=email_user_image_upload_to, blank=True, null=True
    )
    phone = models.CharField(_("phone number"), max_length=16, blank=True)
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    # Permissions
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )

    # Email verification
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = EmailUserManager()

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ("email",)

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self) -> str:
        """Returns first_name plus last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.email

    def get_short_name(self) -> str:
        """Returns the short name for the User."""
        return self.first_name or self.email

    def email_user(
        self, subject: str, message: str, from_email: str = None, **kwargs
    ) -> None:
        """Sends an email to this User."""
        send_mail(subject, message, from_email, [self.email], **kwargs)
