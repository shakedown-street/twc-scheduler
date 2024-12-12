from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.test import override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.fake = Faker()

    def test_password_reset(self):
        email = self.fake.email()
        password = self.fake.password()
        User.objects.create_user(email=email, password=password)

        data = {"email": email}
        response = self.client.post(reverse("api-password-reset"), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_password_reset_confirm(self):
        email = self.fake.email()
        password = self.fake.password()
        new_password = self.fake.password()

        user = User.objects.create_user(email=email, password=password)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        data = {
            "uid": uid,
            "token": token,
            "new_password1": new_password,
            "new_password2": new_password,
        }
        response = self.client.post(
            reverse("api-password-reset-confirm"), data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_password_reset_confirm_invalid_key(self):
        email = self.fake.email()
        password = self.fake.password()
        new_password = self.fake.password()
        User.objects.create_user(email=email, password=password)

        data = {
            "uid": "notreal",
            "token": "notreal",
            "new_password1": new_password,
            "new_password2": new_password,
        }
        response = self.client.post(
            reverse("api-password-reset-confirm"), data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        AUTH_PASSWORD_VALIDATORS=[
            {
                "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
            },
        ]
    )
    def test_password_reset_confirm_invalid_password(self):
        email = self.fake.email()
        password = self.fake.password()
        invalid_password = self.fake.password(length=7)
        user = User.objects.create_user(email=email, password=password)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        data = {
            "uid": uid,
            "token": token,
            "new_password1": invalid_password,
            "new_password2": invalid_password,
        }
        response = self.client.post(
            reverse("api-password-reset-confirm"), data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_mismatched_passwords(self):
        email = self.fake.email()
        password = self.fake.password()
        new_password = self.fake.password()
        user = User.objects.create_user(email=email, password=password)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        data = {
            "uid": uid,
            "token": token,
            "new_password1": new_password,
            "new_password2": "mismatched",
        }
        response = self.client.post(
            reverse("api-password-reset-confirm"), data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
