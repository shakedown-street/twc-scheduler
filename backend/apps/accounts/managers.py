from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.hashers import make_password

from apps.accounts.mailer import send_verify_email


class EmailUserManager(BaseUserManager):
    def _create_user(self, email, password, **kwargs):
        if not email:
            raise ValueError("email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **kwargs)
        user.password = make_password(password)
        user.save()

        return user

    def create_user(self, email, password=None, **kwargs):
        kwargs.setdefault("is_staff", False)
        kwargs.setdefault("is_superuser", False)
        # Default to verified user
        # must explicitly set is_verified to False when creating
        # a user that needs to verify their email
        kwargs.setdefault("is_verified", True)

        user = self._create_user(email, password, **kwargs)

        # NOTE: Email verification is disabled

        # if not user.is_verified:
        #     send_verify_email(user)

        return user

    def create_superuser(self, email, password, **kwargs):
        kwargs.setdefault("is_staff", True)
        kwargs.setdefault("is_superuser", True)

        if kwargs.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if kwargs.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, is_verified=True, **kwargs)
