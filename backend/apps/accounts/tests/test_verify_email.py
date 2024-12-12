from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class VerifyEmailTests(APITestCase):
    def setUp(self):
        self.fake = Faker()

    def test_resend_verify_email(self):
        email = self.fake.email()
        password = self.fake.password()
        user = User.objects.create_user(
            email=email, password=password, is_verified=False
        )

        self.assertFalse(user.is_verified)

        data = {"email": email}
        response = self.client.post(
            reverse("api-resend-verify-email"), data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_resend_verify_email_already_verified(self):
        email = self.fake.email()
        password = self.fake.password()
        User.objects.create_user(email=email, password=password)

        data = {"email": email}
        response = self.client.post(
            reverse("api-resend-verify-email"), data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_email(self):
        email = self.fake.email()
        password = self.fake.password()
        user = User.objects.create_user(
            email=email,
            password=password,
            is_verified=False,
        )

        self.assertFalse(user.is_verified)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        data = {
            "uid": uid,
            "token": token,
        }
        response = self.client.post(reverse("api-verify-email"), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        user = User.objects.get(email=email)
        self.assertTrue(user.is_verified)

    def test_verify_email_invalid_key(self):
        email = self.fake.email()
        password = self.fake.password()
        user = User.objects.create_user(
            email=email,
            password=password,
            is_verified=False,
        )

        self.assertFalse(user.is_verified)

        data = {"uid": "notreal", "token": "notreal"}
        response = self.client.post(reverse("api-verify-email"), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
